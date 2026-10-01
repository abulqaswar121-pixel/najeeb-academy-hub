/**
 * Lovable Cloud (Supabase) backend.
 *
 * Activated automatically when the Supabase environment variables are present
 * (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — injected by Lovable
 * Cloud). All access goes through RLS: public reads use the anon key, student
 * reads/writes use the signed-in user's JWT, and admin operations rely on
 * is_admin() RLS policies (see supabase/migrations/20261001000300_portals.sql).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  AdminCourseRecord,
  AdminOverview,
  AdminProjectSubmission,
  AdminStudentRecord,
  CertificateRecord,
  CertificateWithDetails,
  ContactMessageRecord,
  CourseRatingSummary,
  CourseRecord,
  CourseReviewRecord,
  DataBackend,
  EnrollmentRecord,
  EnrollmentWithCourse,
  LearnState,
  LessonMeta,
  LessonRecord,
  LessonState,
  ProjectSubmissionRecord,
  ProjectSubmissionWithCourse,
  TestimonialRecord,
  UserRecord,
  VerifiedCertificate,
} from "./types";
import {
  WATCH_COMPLETION_RATIO,
  generateCertificateCode,
  requiredWindowSeconds,
  sameWindow,
} from "./types";

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
    content: row.content ?? "",
    videoUrl: row.video_url,
    videoId: row.video_id ?? parseVideoId(row.video_url),
    videoStart: row.video_start ?? parseStart(row.video_url),
    videoEnd: row.video_end ?? null,
    videoDuration: row.video_duration ?? null,
    position: row.position,
  };
}

function parseVideoId(videoUrl: string | null): string | null {
  if (!videoUrl) return null;
  const match = /embed\/([A-Za-z0-9_-]{6,})/.exec(videoUrl);
  return match ? (match[1] ?? null) : null;
}

function parseStart(videoUrl: string | null): number {
  if (!videoUrl) return 0;
  const match = /[?&]start=(\d+)/.exec(videoUrl);
  return match ? Number(match[1]) : 0;
}

function mapProject(row: any): ProjectSubmissionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    link: row.link,
    notes: row.notes ?? "",
    status: row.status,
    feedback: row.feedback ?? null,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? null,
  };
}

function mapReview(row: any): CourseReviewRecord {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: row.created_at,
  };
}

function mapTestimonial(row: any): TestimonialRecord {
  return {
    id: String(row.id),
    name: row.name,
    role: row.role,
    quote: row.quote,
    courseId: row.course_id,
    courseTitle: row.courses?.title ?? null,
    status: row.status ?? "published",
    userId: row.user_id ?? null,
    createdAt: row.created_at ?? null,
  };
}

async function fetchUserRecord(
  client: SupabaseClient,
  userId: string,
  email: string,
): Promise<UserRecord> {
  const { data } = await client
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();
  return {
    id: userId,
    name: data?.full_name ?? email.split("@")[0],
    email,
    role: data?.role === "admin" ? "admin" : "student",
  };
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

async function fetchCourseLessons(
  client: SupabaseClient,
  courseId: string,
): Promise<LessonRecord[]> {
  const { data } = await client
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position");
  return (data ?? []).map(mapLesson);
}

async function fetchVideoProgress(
  client: SupabaseClient,
  userId: string,
  lessonIds: string[],
): Promise<Map<string, { watchedSeconds: number; completed: boolean }>> {
  if (lessonIds.length === 0) return new Map();
  const { data } = await client
    .from("video_progress")
    .select("lesson_id, watched_seconds, completed")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return new Map(
    (data ?? []).map((row: any) => [
      row.lesson_id,
      { watchedSeconds: Number(row.watched_seconds), completed: Boolean(row.completed) },
    ]),
  );
}

function videoDoneFor(
  lesson: LessonRecord,
  lessons: LessonRecord[],
  progress: Map<string, { watchedSeconds: number; completed: boolean }>,
): boolean {
  if (!lesson.videoId) return true;
  return lessons.some((l) => sameWindow(l, lesson) && progress.get(l.id)?.completed);
}

function watchedFor(
  lesson: LessonRecord,
  lessons: LessonRecord[],
  progress: Map<string, { watchedSeconds: number; completed: boolean }>,
): number {
  return lessons
    .filter((l) => sameWindow(l, lesson))
    .reduce((max, l) => Math.max(max, progress.get(l.id)?.watchedSeconds ?? 0), 0);
}

export const supabaseBackend: DataBackend = {
  async listCourses() {
    const { data, error } = await anonClient()
      .from("courses")
      .select("*, lessons(count)")
      .eq("is_published", true)
      .is("deleted_at", null)
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
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const { data: lessonRows } = await client
      .from("lessons")
      .select(
        "id, course_id, title, slug, video_url, video_id, video_start, video_end, video_duration, position",
      )
      .eq("course_id", row.id)
      .order("position");
    const lessons: LessonMeta[] = (lessonRows ?? []).map((l: any) => {
      const { content: _content, ...meta } = mapLesson(l);
      return meta;
    });
    return { course: mapCourse(row), lessons };
  },

  async getCourseRatings(courseId): Promise<CourseRatingSummary> {
    const { data } = await anonClient()
      .from("course_reviews")
      .select("rating, comment, reviewer_name, created_at")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    const rows = data ?? [];
    const average =
      rows.length === 0
        ? null
        : Math.round((rows.reduce((s: number, r: any) => s + r.rating, 0) / rows.length) * 10) / 10;
    return {
      average,
      count: rows.length,
      recent: rows
        .filter((r: any) => (r.comment ?? "").trim().length > 0)
        .slice(0, 3)
        .map((r: any) => ({
          rating: r.rating,
          comment: r.comment,
          name: r.reviewer_name ?? "Student",
          createdAt: r.created_at,
        })),
    };
  },

  async listTestimonials() {
    const { data, error } = await anonClient()
      .from("testimonials")
      .select("*, courses(title)")
      .eq("status", "published")
      .order("id");
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTestimonial);
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
    return { token, user: { id: data.user.id, name, email, role: "student" } };
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

    return (data ?? [])
      .filter((row: any) => row.courses)
      .map((row: any) => {
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

  async getLearnState(userId, courseSlug): Promise<LearnState | null> {
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
    const lessons = await fetchCourseLessons(client, courseRow.id);
    const lessonIds = lessons.map((l) => l.id);
    const [{ data: done }, videoProgress, { data: certRow }, { data: projectRow }, reviewRow] =
      await Promise.all([
        client
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", userId)
          .in("lesson_id", lessonIds),
        fetchVideoProgress(client, userId, lessonIds),
        client
          .from("certificates")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseRow.id)
          .maybeSingle(),
        client
          .from("project_submissions")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseRow.id)
          .maybeSingle(),
        client
          .from("course_reviews")
          .select("*")
          .eq("user_id", userId)
          .eq("course_id", courseRow.id)
          .maybeSingle(),
      ]);
    const completedLessonIds = (done ?? []).map((d: any) => d.lesson_id);
    const completedSet = new Set(completedLessonIds);

    const lessonStates: LessonState[] = lessons.map((lesson, i) => {
      const completed = completedSet.has(lesson.id);
      const prevDone = i === 0 || completedSet.has(lessons[i - 1]!.id);
      return {
        lessonId: lesson.id,
        unlocked: completed || prevDone,
        videoDone: videoDoneFor(lesson, lessons, videoProgress),
        watchedSeconds: watchedFor(lesson, lessons, videoProgress),
        completed,
      };
    });
    const stateByLesson = new Map(lessonStates.map((s) => [s.lessonId, s]));

    return {
      course: mapCourse(courseRow),
      lessons: lessons.map((l) => {
        const s = stateByLesson.get(l.id)!;
        return s.unlocked && s.videoDone ? l : { ...l, content: "" };
      }),
      enrollment: mapEnrollment(enrollmentRow),
      completedLessonIds,
      lessonStates,
      certificate: certRow ? mapCertificate(certRow) : null,
      projectSubmission: projectRow ? mapProject(projectRow) : null,
      myReview: reviewRow.data ? mapReview(reviewRow.data) : null,
    };
  },

  async saveVideoProgress(userId, lessonId, watchedSeconds, playerDuration, ended) {
    const client = clientForUser();
    const { data: lessonRow } = await client
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .maybeSingle();
    if (!lessonRow) throw new Error("Lesson not found.");
    const lesson = mapLesson(lessonRow);
    const required = requiredWindowSeconds(lesson, playerDuration);
    const safeWatched = Math.max(0, Math.min(watchedSeconds, required > 0 ? required : 86400));
    const completed = ended || (required > 0 && safeWatched >= required * WATCH_COMPLETION_RATIO);

    const { data: existing } = await client
      .from("video_progress")
      .select("watched_seconds, completed")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    const merged = {
      user_id: userId,
      lesson_id: lessonId,
      watched_seconds: Math.max(existing?.watched_seconds ?? 0, safeWatched),
      completed: Boolean(existing?.completed) || completed,
      updated_at: new Date().toISOString(),
    };
    const { error } = await client
      .from("video_progress")
      .upsert(merged, { onConflict: "user_id,lesson_id" });
    if (error) throw new Error(error.message);

    const lessons = await fetchCourseLessons(client, lesson.courseId);
    const progress = await fetchVideoProgress(
      client,
      userId,
      lessons.map((l) => l.id),
    );
    return {
      videoDone: videoDoneFor(lesson, lessons, progress),
      watchedSeconds: watchedFor(lesson, lessons, progress),
    };
  },

  async completeLesson(userId, lessonId) {
    const client = clientForUser();
    const { data: lessonRow, error: lessonError } = await client
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .maybeSingle();
    if (lessonError || !lessonRow) throw new Error("Lesson not found.");
    const lesson = mapLesson(lessonRow);
    const lessons = await fetchCourseLessons(client, lesson.courseId);
    const index = lessons.findIndex((l) => l.id === lessonId);
    const { data: done } = await client
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .in(
        "lesson_id",
        lessons.map((l) => l.id),
      );
    const doneIds = new Set((done ?? []).map((d: any) => d.lesson_id));
    if (index > 0 && !doneIds.has(lessons[index - 1]!.id)) {
      throw new Error("Complete the previous lesson first — lessons unlock in order.");
    }
    const progressMap = await fetchVideoProgress(
      client,
      userId,
      lessons.map((l) => l.id),
    );
    if (!videoDoneFor(lesson, lessons, progressMap)) {
      throw new Error("Watch the full lesson video before marking this lesson complete.");
    }
    const { error } = await client
      .from("lesson_progress")
      .upsert(
        { user_id: userId, lesson_id: lessonId },
        { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    const progress = await recomputeProgress(client, userId, lesson.courseId);
    return { progress, courseId: lesson.courseId };
  },

  async submitProject(userId, courseId, input) {
    const client = clientForUser();
    const { error } = await client.from("project_submissions").upsert(
      {
        user_id: userId,
        course_id: courseId,
        link: input.link,
        notes: input.notes,
        status: "pending",
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
      },
      { onConflict: "user_id,course_id" },
    );
    if (error) throw new Error(error.message);
    const { data } = await client
      .from("project_submissions")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();
    return mapProject(data);
  },

  async listMyProjects(userId): Promise<ProjectSubmissionWithCourse[]> {
    const { data, error } = await clientForUser()
      .from("project_submissions")
      .select("*, courses(title, slug)")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      ...mapProject(row),
      courseTitle: row.courses?.title ?? "Course",
      courseSlug: row.courses?.slug ?? row.course_id,
    }));
  },

  async submitReview(userId, courseId, input) {
    const client = clientForUser();
    const { data: profile } = await client
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    const reviewerName = (profile?.full_name ?? "Student").split(" ")[0];
    const { error } = await client.from("course_reviews").upsert(
      {
        user_id: userId,
        course_id: courseId,
        rating: input.rating,
        comment: input.comment,
        reviewer_name: reviewerName,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" },
    );
    if (error) throw new Error(error.message);
    const { data } = await client
      .from("course_reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();
    return mapReview(data);
  },

  async listMyReviews(userId) {
    const { data, error } = await clientForUser()
      .from("course_reviews")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapReview);
  },

  async submitTestimonial(userId, input) {
    const client = clientForUser();
    const { data, error } = await client
      .from("testimonials")
      .insert({
        name: input.name,
        role: input.role,
        quote: input.quote,
        course_id: input.courseId,
        user_id: userId,
        status: "pending",
      })
      .select("*, courses(title)")
      .single();
    if (error) throw new Error(error.message);
    return mapTestimonial(data);
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

  // ───────────────────────────── Admin ─────────────────────────────
  // All queries below run with the admin's JWT; is_admin() RLS policies
  // grant the extra visibility.

  async adminOverview(): Promise<AdminOverview> {
    const client = clientForUser();
    const count = async (table: string, filter?: (q: any) => any) => {
      let q: any = client.from(table).select("*", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count: n } = await q;
      return n ?? 0;
    };
    const [
      students,
      enrollments,
      certificates,
      courses,
      hiddenCourses,
      pendingProjects,
      pendingTestimonials,
      publishedTestimonials,
      messages,
    ] = await Promise.all([
      count("profiles", (q) => q.eq("role", "student")),
      count("enrollments"),
      count("certificates"),
      count("courses", (q) => q.is("deleted_at", null)),
      count("courses", (q) => q.is("deleted_at", null).eq("is_published", false)),
      count("project_submissions", (q) => q.eq("status", "pending")),
      count("testimonials", (q) => q.eq("status", "pending")),
      count("testimonials", (q) => q.eq("status", "published")),
      count("contact_submissions"),
    ]);
    const { data: ratingRows } = await client.from("course_reviews").select("rating");
    const ratings = ratingRows ?? [];
    return {
      students,
      enrollments,
      certificates,
      courses,
      hiddenCourses,
      pendingProjects,
      pendingTestimonials,
      publishedTestimonials,
      messages,
      reviews: ratings.length,
      averageRating:
        ratings.length === 0
          ? null
          : Math.round(
              (ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length) * 10,
            ) / 10,
    };
  },

  async adminListStudents(): Promise<AdminStudentRecord[]> {
    const client = clientForUser();
    const [{ data: profiles }, { data: enrollments }, { data: certs }, { data: projects }] =
      await Promise.all([
        client
          .from("profiles")
          .select("id, full_name, email, role, created_at")
          .eq("role", "student")
          .order("created_at", { ascending: false }),
        client.from("enrollments").select("user_id"),
        client.from("certificates").select("user_id"),
        client.from("project_submissions").select("user_id"),
      ]);
    const countBy = (rows: any[] | null) => {
      const m = new Map<string, number>();
      for (const row of rows ?? []) m.set(row.user_id, (m.get(row.user_id) ?? 0) + 1);
      return m;
    };
    const e = countBy(enrollments);
    const c = countBy(certs);
    const p = countBy(projects);
    return (profiles ?? []).map((row: any) => ({
      user: {
        id: row.id,
        name: row.full_name ?? "Student",
        email: row.email ?? "",
        role: "student" as const,
      },
      joinedAt: row.created_at ?? null,
      enrollmentCount: e.get(row.id) ?? 0,
      certificateCount: c.get(row.id) ?? 0,
      projectCount: p.get(row.id) ?? 0,
    }));
  },

  async adminDeleteStudent(userId) {
    const { error } = await clientForUser().rpc("admin_delete_user", { target_user: userId });
    if (error) throw new Error(error.message);
  },

  async adminListCourses(): Promise<AdminCourseRecord[]> {
    const client = clientForUser();
    const [{ data: courses, error }, { data: enrollments }, { data: reviews }] = await Promise.all([
      client.from("courses").select("*, lessons(count)").order("title"),
      client.from("enrollments").select("course_id"),
      client.from("course_reviews").select("course_id, rating"),
    ]);
    if (error) throw new Error(error.message);
    const enrollCounts = new Map<string, number>();
    for (const row of enrollments ?? []) {
      enrollCounts.set(row.course_id, (enrollCounts.get(row.course_id) ?? 0) + 1);
    }
    const ratingAgg = new Map<string, { sum: number; n: number }>();
    for (const row of reviews ?? []) {
      const agg = ratingAgg.get(row.course_id) ?? { sum: 0, n: 0 };
      agg.sum += row.rating;
      agg.n += 1;
      ratingAgg.set(row.course_id, agg);
    }
    return (courses ?? []).map((row: any) => {
      const agg = ratingAgg.get(row.id);
      return {
        ...mapCourse(row),
        deleted: row.deleted_at !== null,
        enrollmentCount: enrollCounts.get(row.id) ?? 0,
        ratingAvg: agg ? Math.round((agg.sum / agg.n) * 10) / 10 : null,
        ratingCount: agg?.n ?? 0,
      };
    });
  },

  async adminUpdateCourse(courseId, patch) {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update["title"] = patch.title;
    if (patch.summary !== undefined) update["summary"] = patch.summary;
    if (patch.priceNgn !== undefined) update["price_ngn"] = patch.priceNgn;
    if (patch.isFeatured !== undefined) update["is_featured"] = patch.isFeatured;
    if (Object.keys(update).length === 0) return;
    const { error } = await clientForUser().from("courses").update(update).eq("id", courseId);
    if (error) throw new Error(error.message);
  },

  async adminSetCourseHidden(courseId, hidden) {
    const { error } = await clientForUser()
      .from("courses")
      .update({ is_published: !hidden })
      .eq("id", courseId);
    if (error) throw new Error(error.message);
  },

  async adminSetCourseDeleted(courseId, deleted) {
    const { error } = await clientForUser()
      .from("courses")
      .update({ deleted_at: deleted ? new Date().toISOString() : null })
      .eq("id", courseId);
    if (error) throw new Error(error.message);
  },

  async adminListProjects(): Promise<AdminProjectSubmission[]> {
    const { data, error } = await clientForUser()
      .from("project_submissions")
      .select("*, courses(title, slug), profiles(full_name, email)")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row: any) => ({
        ...mapProject(row),
        courseTitle: row.courses?.title ?? "Course",
        courseSlug: row.courses?.slug ?? row.course_id,
        studentName: row.profiles?.full_name ?? "Student",
        studentEmail: row.profiles?.email ?? "",
      }))
      .sort((a: AdminProjectSubmission, b: AdminProjectSubmission) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return a.submittedAt < b.submittedAt ? 1 : -1;
      });
  },

  async adminReviewProject(submissionId, status, feedback) {
    const { error } = await clientForUser()
      .from("project_submissions")
      .update({
        status,
        feedback: feedback.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);
    if (error) throw new Error(error.message);
  },

  async adminListTestimonials() {
    const { data, error } = await clientForUser()
      .from("testimonials")
      .select("*, courses(title)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTestimonial).sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return 0;
    });
  },

  async adminSetTestimonialStatus(testimonialId, status) {
    const { error } = await clientForUser()
      .from("testimonials")
      .update({ status })
      .eq("id", Number.isNaN(Number(testimonialId)) ? testimonialId : Number(testimonialId));
    if (error) throw new Error(error.message);
  },

  async adminDeleteTestimonial(testimonialId) {
    const { error } = await clientForUser()
      .from("testimonials")
      .delete()
      .eq("id", Number.isNaN(Number(testimonialId)) ? testimonialId : Number(testimonialId));
    if (error) throw new Error(error.message);
  },

  async adminListMessages(): Promise<ContactMessageRecord[]> {
    const { data, error } = await clientForUser()
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      id: String(row.id),
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: row.created_at,
    }));
  },

  async adminDeleteMessage(messageId) {
    const { error } = await clientForUser()
      .from("contact_submissions")
      .delete()
      .eq("id", Number.isNaN(Number(messageId)) ? messageId : Number(messageId));
    if (error) throw new Error(error.message);
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
