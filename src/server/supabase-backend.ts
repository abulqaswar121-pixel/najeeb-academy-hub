/**
 * Lovable Cloud (Supabase) backend.
 *
 * Activated automatically when the Supabase environment variables are present
 * (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — injected by Lovable
 * Cloud). All access goes through RLS: public reads use the anon key, student
 * reads/writes use the signed-in user's JWT.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  CertificateRecord,
  CertificateWithDetails,
  CourseRecord,
  DataBackend,
  EnrollmentRecord,
  EnrollmentWithCourse,
  LessonMeta,
  LessonRecord,
  TestimonialRecord,
  UserRecord,
  VerifiedCertificate,
} from "./types";
import { generateCertificateCode } from "./types";

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const env = process.env as Record<string, string | undefined>;
  const viteEnv = (import.meta.env ?? {}) as Record<string, string | undefined>;
  const url = env["VITE_SUPABASE_URL"] ?? env["SUPABASE_URL"] ?? viteEnv["VITE_SUPABASE_URL"];
  const anonKey =
    env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
    env["VITE_SUPABASE_ANON_KEY"] ??
    env["SUPABASE_ANON_KEY"] ??
    viteEnv["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function anonClient(): SupabaseClient {
  const cfg = getSupabaseConfig();
  if (!cfg) throw new Error("Supabase is not configured.");
  return createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function userClient(accessToken: string): SupabaseClient {
  const cfg = getSupabaseConfig();
  if (!cfg) throw new Error("Supabase is not configured.");
  return createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

interface TokenPair {
  at: string;
  rt: string;
}

function encodeToken(pair: TokenPair): string {
  return Buffer.from(JSON.stringify(pair)).toString("base64url");
}

function decodeToken(token: string): TokenPair | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as TokenPair;
    if (typeof parsed.at === "string" && typeof parsed.rt === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCourse(row: any): CourseRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    category: row.category,
    priceNgn: row.price_ngn,
    duration: row.duration,
    image: row.image,
    isPublished: row.is_published,
    level: row.level ?? "Beginner",
    isFeatured: row.is_featured ?? false,
    tools: row.tools ?? [],
    project: row.project ?? "",
    lessonCount: Array.isArray(row.lessons)
      ? (row.lessons[0]?.count ?? 0)
      : (row.lesson_count ?? 0),
  };
}

function mapLesson(row: any): LessonRecord {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    videoUrl: row.video_url,
    position: row.position,
  };
}

async function fetchUserRecord(
  client: SupabaseClient,
  userId: string,
  email: string,
): Promise<UserRecord> {
  const { data } = await client.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  return { id: userId, name: data?.full_name ?? email.split("@")[0], email };
}

async function recomputeProgress(
  client: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<number> {
  const { data: lessons } = await client.from("lessons").select("id").eq("course_id", courseId);
  const lessonIds = (lessons ?? []).map((l: any) => l.id);
  if (lessonIds.length === 0) return 0;
  const { data: done } = await client
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  const progress = Math.round(((done?.length ?? 0) / lessonIds.length) * 100);
  await client
    .from("enrollments")
    .update({ progress })
    .eq("user_id", userId)
    .eq("course_id", courseId);
  return progress;
}

export const supabaseBackend: DataBackend = {
  async listCourses() {
    const { data, error } = await anonClient()
      .from("courses")
      .select("*, lessons(count)")
      .eq("is_published", true)
      .order("title");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCourse);
  },

  async getCourseBySlug(slug) {
    const client = anonClient();
    const { data: row, error } = await client
      .from("courses")
      .select("*, lessons(count)")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const { data: lessonRows } = await client
      .from("lessons")
      .select("id, course_id, title, slug, video_url, position")
      .eq("course_id", row.id)
      .order("position");
    const lessons: LessonMeta[] = (lessonRows ?? []).map((l: any) => ({
      id: l.id,
      courseId: l.course_id,
      title: l.title,
      slug: l.slug,
      videoUrl: l.video_url,
      position: l.position,
    }));
    return { course: mapCourse(row), lessons };
  },

  async listTestimonials() {
    const { data, error } = await anonClient()
      .from("testimonials")
      .select("*, courses(title)")
      .order("id");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any): TestimonialRecord => ({
      id: String(row.id),
      name: row.name,
      role: row.role,
      quote: row.quote,
      courseId: row.course_id,
      courseTitle: row.courses?.title ?? null,
    }));
  },

  async submitContact(input) {
    const { error } = await anonClient().from("contact_submissions").insert({
      name: input.name,
      email: input.email,
      message: input.message,
    });
    if (error) throw new Error(error.message);
  },

  async verifyCertificate(code): Promise<VerifiedCertificate | null> {
    const { data, error } = await anonClient().rpc("verify_certificate", {
      lookup_code: code.trim().toUpperCase(),
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      code: row.code,
      studentName: row.student_name,
      courseTitle: row.course_title,
      courseCategory: row.course_category,
      issuedAt: row.issued_at,
    };
  },

  async signUp({ name, email, password }) {
    const client = anonClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw new Error(error.message);
    if (!data.session || !data.user) {
      throw new Error("Account created — please confirm your email, then log in.");
    }
    const token = encodeToken({ at: data.session.access_token, rt: data.session.refresh_token });
    return { token, user: { id: data.user.id, name, email } };
  },

  async signIn({ email, password }) {
    const client = anonClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Invalid email or password.");
    const user = await fetchUserRecord(userClient(data.session.access_token), data.user.id, email);
    const token = encodeToken({ at: data.session.access_token, rt: data.session.refresh_token });
    return { token, user };
  },

  async signOut(token) {
    const pair = decodeToken(token);
    if (!pair) return;
    try {
      await userClient(pair.at).auth.signOut({ scope: "local" });
    } catch {
      // session already gone — nothing to do
    }
  },

  async getUser(token) {
    const pair = decodeToken(token);
    if (!pair) return null;
    const client = anonClient();
    const { data } = await client.auth.getUser(pair.at);
    if (data.user) {
      const user = await fetchUserRecord(userClient(pair.at), data.user.id, data.user.email ?? "");
      return { user };
    }
    // Access token expired — try the refresh token.
    const { data: refreshed, error } = await client.auth.refreshSession({ refresh_token: pair.rt });
    if (error || !refreshed.session || !refreshed.user) return null;
    const user = await fetchUserRecord(
      userClient(refreshed.session.access_token),
      refreshed.user.id,
      refreshed.user.email ?? "",
    );
    return {
      user,
      refreshedToken: encodeToken({
        at: refreshed.session.access_token,
        rt: refreshed.session.refresh_token,
      }),
    };
  },

  async enroll(userId, courseId) {
    const client = clientForUser();
    const { data: existing } = await client
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (existing) return mapEnrollment(existing);
    const { data, error } = await client
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId, progress: 0 })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapEnrollment(data);
  },

  async listEnrollments(userId): Promise<EnrollmentWithCourse[]> {
    const client = clientForUser();
    const { data, error } = await client
      .from("enrollments")
      .select("*, courses(*, lessons(id, slug, position))")
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: done } = await client
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId);
    const doneIds = new Set((done ?? []).map((d: any) => d.lesson_id));
    const { data: certs } = await client.from("certificates").select("*").eq("user_id", userId);

    return (data ?? []).map((row: any) => {
      const lessons = (row.courses?.lessons ?? []).sort(
        (a: any, b: any) => a.position - b.position,
      );
      const completed = lessons.filter((l: any) => doneIds.has(l.id)).length;
      const next = lessons.find((l: any) => !doneIds.has(l.id));
      const course = mapCourse({ ...row.courses, lessons: [{ count: lessons.length }] });
      const cert = (certs ?? []).find((c: any) => c.course_id === row.course_id);
      return {
        ...mapEnrollment(row),
        course,
        completedLessons: completed,
        nextLessonSlug: next?.slug ?? null,
        certificate: cert ? mapCertificate(cert) : null,
      };
    });
  },

  async getLearnState(userId, courseSlug) {
    const client = clientForUser();
    const { data: courseRow } = await client
      .from("courses")
      .select("*, lessons(count)")
      .eq("slug", courseSlug)
      .maybeSingle();
    if (!courseRow) return null;
    const { data: enrollmentRow } = await client
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseRow.id)
      .maybeSingle();
    if (!enrollmentRow) return null;
    const { data: lessonRows } = await client
      .from("lessons")
      .select("*")
      .eq("course_id", courseRow.id)
      .order("position");
    const lessons = (lessonRows ?? []).map(mapLesson);
    const { data: done } = await client
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .in(
        "lesson_id",
        lessons.map((l) => l.id),
      );
    const { data: certRow } = await client
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseRow.id)
      .maybeSingle();
    return {
      course: mapCourse(courseRow),
      lessons,
      enrollment: mapEnrollment(enrollmentRow),
      completedLessonIds: (done ?? []).map((d: any) => d.lesson_id),
      certificate: certRow ? mapCertificate(certRow) : null,
    };
  },

  async completeLesson(userId, lessonId) {
    const client = clientForUser();
    const { data: lesson, error: lessonError } = await client
      .from("lessons")
      .select("id, course_id")
      .eq("id", lessonId)
      .maybeSingle();
    if (lessonError || !lesson) throw new Error("Lesson not found.");
    const { error } = await client
      .from("lesson_progress")
      .upsert(
        { user_id: userId, lesson_id: lessonId },
        { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    const progress = await recomputeProgress(client, userId, lesson.course_id);
    return { progress, courseId: lesson.course_id };
  },

  async issueCertificate(userId, courseId) {
    const client = clientForUser();
    const { data: existing } = await client
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (existing) return mapCertificate(existing);
    const { data, error } = await client
      .from("certificates")
      .insert({ user_id: userId, course_id: courseId, code: generateCertificateCode() })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapCertificate(data);
  },

  async getCertificate(userId, courseId) {
    const { data } = await clientForUser()
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    return data ? mapCertificate(data) : null;
  },

  async listCertificates(userId): Promise<CertificateWithDetails[]> {
    const client = clientForUser();
    const { data, error } = await client
      .from("certificates")
      .select("*, courses(title, category)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: profile } = await client
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    return (data ?? []).map((row: any) => ({
      ...mapCertificate(row),
      courseTitle: row.courses?.title ?? "",
      courseCategory: row.courses?.category ?? "",
      studentName: profile?.full_name ?? "Student",
    }));
  },
};

function mapEnrollment(row: any): EnrollmentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    progress: row.progress,
    enrolledAt: row.enrolled_at,
  };
}

function mapCertificate(row: any): CertificateRecord {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    code: row.code,
    issuedAt: row.issued_at,
  };
}

/**
 * Student-scoped operations need the caller's JWT so RLS applies. The server
 * functions layer stores the current request's token here before invoking
 * backend methods.
 */
let currentAccessToken: string | null = null;

export function setRequestAccessToken(token: string | null) {
  if (!token) {
    currentAccessToken = null;
    return;
  }
  const pair = decodeToken(token);
  currentAccessToken = pair?.at ?? null;
}

function clientForUser(): SupabaseClient {
  if (!currentAccessToken) throw new Error("Not authenticated.");
  return userClient(currentAccessToken);
}
