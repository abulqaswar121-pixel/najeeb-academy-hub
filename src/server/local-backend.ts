/**
 * Local development backend.
 *
 * Used automatically when Lovable Cloud (Supabase) environment variables are
 * not present, so the whole product — auth, enrollments, progress,
 * certificates — works in local/sandbox previews. State persists to
 * .data/academy-local.json (gitignored). In production, the Supabase backend
 * in supabase-backend.ts is used instead.
 */
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { courses as courseSeeds } from "../data/courses";
import { testimonials as testimonialSeeds } from "../data/testimonials";
import { buildDescription, buildLessonContent, formatDuration, lessonSlug } from "../data/content";
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

interface LocalUser extends UserRecord {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface LocalState {
  users: LocalUser[];
  sessions: Record<string, string>; // token -> userId
  enrollments: EnrollmentRecord[];
  lessonProgress: { id: string; userId: string; lessonId: string; completedAt: string }[];
  certificates: CertificateRecord[];
  contactSubmissions: {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
  }[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "academy-local.json");

// ---------- static catalog derived from the seed data ----------

const allCourses: CourseRecord[] = courseSeeds.map((seed) => ({
  id: seed.slug,
  title: seed.title,
  slug: seed.slug,
  summary: seed.summary,
  description: buildDescription(seed),
  category: seed.category,
  priceNgn: seed.priceNgn,
  duration: formatDuration(seed.durationHours),
  image: `/images/courses/${seed.slug}.jpg`,
  isPublished: true,
  level: seed.level,
  isFeatured: Boolean(seed.featured),
  tools: seed.tools,
  project: seed.project,
  lessonCount: seed.lessons.length,
}));

const lessonsByCourse = new Map<string, LessonRecord[]>();
for (const seed of courseSeeds) {
  lessonsByCourse.set(
    seed.slug,
    seed.lessons.map((title, i) => ({
      id: `${seed.slug}/${lessonSlug(title)}`,
      courseId: seed.slug,
      title,
      slug: lessonSlug(title),
      content: buildLessonContent(seed, title, i, seed.lessons.length),
      videoUrl: null,
      position: i + 1,
    })),
  );
}

const allTestimonials: TestimonialRecord[] = testimonialSeeds.map((t, i) => ({
  id: `t-${i + 1}`,
  name: t.name,
  role: t.role,
  quote: t.quote,
  courseId: t.courseSlug,
  courseTitle: t.courseSlug
    ? (allCourses.find((c) => c.slug === t.courseSlug)?.title ?? null)
    : null,
}));

// ---------- persisted mutable state ----------

function emptyState(): LocalState {
  return {
    users: [],
    sessions: {},
    enrollments: [],
    lessonProgress: [],
    certificates: [],
    contactSubmissions: [],
  };
}

function loadState(): LocalState {
  try {
    if (existsSync(DATA_FILE)) {
      return { ...emptyState(), ...(JSON.parse(readFileSync(DATA_FILE, "utf8")) as LocalState) };
    }
  } catch (err) {
    console.error("Failed to read local academy state, starting fresh:", err);
  }
  return emptyState();
}

const globalKey = "__najeebAcademyLocalState" as const;
const g = globalThis as typeof globalThis & { [globalKey]?: LocalState };
if (!g[globalKey]) g[globalKey] = loadState();
const state = g[globalKey];

function persist() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to persist local academy state:", err);
  }
}

// ---------- helpers ----------

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function toPublicUser(u: LocalUser): UserRecord {
  return { id: u.id, name: u.name, email: u.email };
}

function courseById(id: string): CourseRecord | undefined {
  return allCourses.find((c) => c.id === id);
}

function computeProgress(
  userId: string,
  courseId: string,
): { completed: number; progress: number } {
  const lessons = lessonsByCourse.get(courseId) ?? [];
  const completed = state.lessonProgress.filter(
    (lp) => lp.userId === userId && lessons.some((l) => l.id === lp.lessonId),
  ).length;
  const progress = lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);
  return { completed, progress };
}

function nextLessonSlug(userId: string, courseId: string): string | null {
  const lessons = lessonsByCourse.get(courseId) ?? [];
  const doneIds = new Set(
    state.lessonProgress.filter((lp) => lp.userId === userId).map((lp) => lp.lessonId),
  );
  const next = lessons.find((l) => !doneIds.has(l.id));
  return next ? next.slug : null;
}

// ---------- backend implementation ----------

export const localBackend: DataBackend = {
  async listCourses() {
    return allCourses.filter((c) => c.isPublished);
  },

  async getCourseBySlug(slug) {
    const course = allCourses.find((c) => c.slug === slug && c.isPublished);
    if (!course) return null;
    const lessons: LessonMeta[] = (lessonsByCourse.get(course.id) ?? []).map(
      ({ content: _content, ...meta }) => meta,
    );
    return { course, lessons };
  },

  async listTestimonials() {
    return allTestimonials;
  },

  async submitContact(input) {
    state.contactSubmissions.push({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      message: input.message,
      createdAt: new Date().toISOString(),
    });
    persist();
  },

  async verifyCertificate(code): Promise<VerifiedCertificate | null> {
    const normalized = code.trim().toUpperCase();
    const cert = state.certificates.find((c) => c.code === normalized);
    if (!cert) return null;
    const user = state.users.find((u) => u.id === cert.userId);
    const course = courseById(cert.courseId);
    if (!user || !course) return null;
    return {
      code: cert.code,
      studentName: user.name,
      courseTitle: course.title,
      courseCategory: course.category,
      issuedAt: cert.issuedAt,
    };
  },

  async signUp({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (state.users.some((u) => u.email === normalizedEmail)) {
      throw new Error("An account with this email already exists. Try logging in instead.");
    }
    const salt = randomBytes(16).toString("hex");
    const user: LocalUser = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      salt,
      passwordHash: hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    const token = randomBytes(32).toString("hex");
    state.sessions[token] = user.id;
    persist();
    return { token, user: toPublicUser(user) };
  },

  async signIn({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = state.users.find((u) => u.email === normalizedEmail);
    if (!user) throw new Error("Invalid email or password.");
    const candidate = Buffer.from(hashPassword(password, user.salt), "hex");
    const actual = Buffer.from(user.passwordHash, "hex");
    if (candidate.length !== actual.length || !timingSafeEqual(candidate, actual)) {
      throw new Error("Invalid email or password.");
    }
    const token = randomBytes(32).toString("hex");
    state.sessions[token] = user.id;
    persist();
    return { token, user: toPublicUser(user) };
  },

  async signOut(token) {
    delete state.sessions[token];
    persist();
  },

  async getUser(token) {
    const userId = state.sessions[token];
    if (!userId) return null;
    const user = state.users.find((u) => u.id === userId);
    return user ? { user: toPublicUser(user) } : null;
  },

  async enroll(userId, courseId) {
    const existing = state.enrollments.find((e) => e.userId === userId && e.courseId === courseId);
    if (existing) return existing;
    if (!courseById(courseId)) throw new Error("Course not found.");
    const enrollment: EnrollmentRecord = {
      id: randomUUID(),
      userId,
      courseId,
      progress: 0,
      enrolledAt: new Date().toISOString(),
    };
    state.enrollments.push(enrollment);
    persist();
    return enrollment;
  },

  async listEnrollments(userId): Promise<EnrollmentWithCourse[]> {
    return state.enrollments
      .filter((e) => e.userId === userId)
      .map((e) => {
        const course = courseById(e.courseId)!;
        const { completed, progress } = computeProgress(userId, e.courseId);
        return {
          ...e,
          progress,
          course,
          completedLessons: completed,
          nextLessonSlug: nextLessonSlug(userId, e.courseId),
          certificate:
            state.certificates.find((c) => c.userId === userId && c.courseId === e.courseId) ??
            null,
        };
      })
      .sort((a, b) => (a.enrolledAt < b.enrolledAt ? 1 : -1));
  },

  async getLearnState(userId, courseSlug) {
    const course = allCourses.find((c) => c.slug === courseSlug);
    if (!course) return null;
    const enrollment = state.enrollments.find(
      (e) => e.userId === userId && e.courseId === course.id,
    );
    if (!enrollment) return null;
    const lessons = lessonsByCourse.get(course.id) ?? [];
    const lessonIds = new Set(lessons.map((l) => l.id));
    const completedLessonIds = state.lessonProgress
      .filter((lp) => lp.userId === userId && lessonIds.has(lp.lessonId))
      .map((lp) => lp.lessonId);
    return {
      course,
      lessons,
      enrollment: { ...enrollment, progress: computeProgress(userId, course.id).progress },
      completedLessonIds,
      certificate:
        state.certificates.find((c) => c.userId === userId && c.courseId === course.id) ?? null,
    };
  },

  async completeLesson(userId, lessonId) {
    const courseId = lessonId.split("/")[0] ?? "";
    const lessons = lessonsByCourse.get(courseId) ?? [];
    if (!lessons.some((l) => l.id === lessonId)) throw new Error("Lesson not found.");
    const enrollment = state.enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId,
    );
    if (!enrollment) throw new Error("You are not enrolled in this course.");
    if (!state.lessonProgress.some((lp) => lp.userId === userId && lp.lessonId === lessonId)) {
      state.lessonProgress.push({
        id: randomUUID(),
        userId,
        lessonId,
        completedAt: new Date().toISOString(),
      });
    }
    const { progress } = computeProgress(userId, courseId);
    enrollment.progress = progress;
    persist();
    return { progress, courseId };
  },

  async issueCertificate(userId, courseId) {
    const existing = state.certificates.find((c) => c.userId === userId && c.courseId === courseId);
    if (existing) return existing;
    const cert: CertificateRecord = {
      id: randomUUID(),
      userId,
      courseId,
      code: generateCertificateCode(),
      issuedAt: new Date().toISOString(),
    };
    state.certificates.push(cert);
    persist();
    return cert;
  },

  async getCertificate(userId, courseId) {
    return state.certificates.find((c) => c.userId === userId && c.courseId === courseId) ?? null;
  },

  async listCertificates(userId): Promise<CertificateWithDetails[]> {
    const user = state.users.find((u) => u.id === userId);
    return state.certificates
      .filter((c) => c.userId === userId)
      .map((c) => {
        const course = courseById(c.courseId)!;
        return {
          ...c,
          courseTitle: course.title,
          courseCategory: course.category,
          studentName: user?.name ?? "Student",
        };
      })
      .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
  },
};
