/**
 * Local development backend.
 *
 * Used automatically when Lovable Cloud (Supabase) environment variables are
 * not present, so the whole product — auth, enrollments, watch-gated video
 * progress, projects, reviews, testimonials, certificates and the admin
 * portal — works in local/sandbox previews. State persists to
 * .data/academy-local.json (gitignored). In production, the Supabase backend
 * in supabase-backend.ts is used instead.
 *
 * A default admin account is seeded on first run:
 *   email: admin@ndh.com.ng · password: NdhAdmin#2026
 */
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { courses as courseSeeds } from "../data/courses";
import { testimonials as testimonialSeeds } from "../data/testimonials";
import {
  buildDescription,
  buildLessonContent,
  formatDuration,
  lessonSlug,
  lessonVideoUrl,
} from "../data/content";
import type {
  AdminCourseRecord,
  AdminOverview,
  AdminProjectSubmission,
  AdminStudentRecord,
  CertificateRecord,
  CertificateWithDetails,
  ContactMessageRecord,
  CourseEditInput,
  CourseRatingSummary,
  CourseRecord,
  CourseReviewRecord,
  DataBackend,
  EnrollmentRecord,
  EnrollmentWithCourse,
  LearnState,
  LessonRecord,
  LessonState,
  ProjectSubmissionRecord,
  ProjectSubmissionWithCourse,
  TestimonialRecord,
  TestimonialStatus,
  UserRecord,
  UserRole,
  VerifiedCertificate,
} from "./types";
import {
  WATCH_COMPLETION_RATIO,
  generateCertificateCode,
  requiredWindowSeconds,
  sameWindow,
} from "./types";

const ADMIN_EMAIL = "admin@ndh.com.ng";
const ADMIN_PASSWORD = "NdhAdmin#2026";

interface LocalUser extends UserRecord {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface CourseOverride {
  title?: string;
  summary?: string;
  priceNgn?: number;
  isFeatured?: boolean;
  hidden?: boolean;
  deleted?: boolean;
}

interface LocalState {
  users: LocalUser[];
  sessions: Record<string, string>; // token -> userId
  enrollments: EnrollmentRecord[];
  lessonProgress: { id: string; userId: string; lessonId: string; completedAt: string }[];
  videoProgress: {
    userId: string;
    lessonId: string;
    watchedSeconds: number;
    completed: boolean;
    updatedAt: string;
  }[];
  certificates: CertificateRecord[];
  projects: ProjectSubmissionRecord[];
  reviews: CourseReviewRecord[];
  submittedTestimonials: TestimonialRecord[];
  testimonialOverrides: Record<string, TestimonialStatus>;
  courseOverrides: Record<string, CourseOverride>;
  contactSubmissions: ContactMessageRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "academy-local.json");

// ---------- static catalog derived from the seed data ----------

const baseCourses: CourseRecord[] = courseSeeds.map((seed) => ({
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
    seed.lessons.map((title, i) => {
      const detail = seed.lessonDetails[i];
      const windowed =
        !seed.videoReplaced && detail && detail.endSeconds > detail.startSeconds
          ? { start: detail.startSeconds, end: detail.endSeconds }
          : { start: 0, end: null };
      return {
        id: `${seed.slug}/${lessonSlug(title)}`,
        courseId: seed.slug,
        title,
        slug: lessonSlug(title),
        content: buildLessonContent(seed, title, i, seed.lessons.length),
        videoUrl: lessonVideoUrl(seed, i),
        videoId: seed.videoId,
        videoStart: windowed.start,
        videoEnd: windowed.end,
        videoDuration: seed.videoReplaced ? null : seed.videoDurationSeconds,
        position: i + 1,
      } satisfies LessonRecord;
    }),
  );
}

const seedTestimonials: TestimonialRecord[] = testimonialSeeds.map((t, i) => ({
  id: `t-${i + 1}`,
  name: t.name,
  role: t.role,
  quote: t.quote,
  courseId: t.courseSlug,
  courseTitle: t.courseSlug
    ? (baseCourses.find((c) => c.slug === t.courseSlug)?.title ?? null)
    : null,
  status: "published" as const,
  userId: null,
  createdAt: null,
}));

// ---------- persisted mutable state ----------

function emptyState(): LocalState {
  return {
    users: [],
    sessions: {},
    enrollments: [],
    lessonProgress: [],
    videoProgress: [],
    certificates: [],
    projects: [],
    reviews: [],
    submittedTestimonials: [],
    testimonialOverrides: {},
    courseOverrides: {},
    contactSubmissions: [],
  };
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function loadState(): LocalState {
  let state = emptyState();
  try {
    if (existsSync(DATA_FILE)) {
      state = { ...state, ...(JSON.parse(readFileSync(DATA_FILE, "utf8")) as LocalState) };
    }
  } catch (err) {
    console.error("Failed to read local academy state, starting fresh:", err);
  }
  // Migrate pre-portal records.
  for (const user of state.users) {
    if (!user.role) user.role = user.email === ADMIN_EMAIL ? "admin" : ("student" as UserRole);
  }
  // Seed the default admin account once.
  if (!state.users.some((u) => u.role === "admin")) {
    const salt = randomBytes(16).toString("hex");
    state.users.push({
      id: randomUUID(),
      name: "NDH Admin",
      email: ADMIN_EMAIL,
      role: "admin",
      salt,
      passwordHash: hashPassword(ADMIN_PASSWORD, salt),
      createdAt: new Date().toISOString(),
    });
  }
  return state;
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

function toPublicUser(u: LocalUser): UserRecord {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

/** Catalog with admin overrides applied. Includes hidden, excludes deleted. */
function effectiveCourses(): CourseRecord[] {
  return baseCourses
    .filter((c) => !state.courseOverrides[c.id]?.deleted)
    .map((c) => applyOverride(c));
}

function applyOverride(course: CourseRecord): CourseRecord {
  const o = state.courseOverrides[course.id];
  if (!o) return course;
  return {
    ...course,
    ...(o.title !== undefined ? { title: o.title } : {}),
    ...(o.summary !== undefined ? { summary: o.summary } : {}),
    ...(o.priceNgn !== undefined ? { priceNgn: o.priceNgn } : {}),
    ...(o.isFeatured !== undefined ? { isFeatured: o.isFeatured } : {}),
    isPublished: !o.hidden,
  };
}

function courseById(id: string): CourseRecord | undefined {
  return effectiveCourses().find((c) => c.id === id);
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

/** videoDone for a lesson = its own (or any same-window sibling's) completed record. */
function isVideoDone(userId: string, lesson: LessonRecord): boolean {
  if (!lesson.videoId) return true;
  const siblings = (lessonsByCourse.get(lesson.courseId) ?? []).filter((l) =>
    sameWindow(l, lesson),
  );
  return state.videoProgress.some(
    (vp) => vp.userId === userId && vp.completed && siblings.some((l) => l.id === vp.lessonId),
  );
}

function watchedSecondsFor(userId: string, lesson: LessonRecord): number {
  const siblings = (lessonsByCourse.get(lesson.courseId) ?? []).filter((l) =>
    sameWindow(l, lesson),
  );
  return state.videoProgress
    .filter((vp) => vp.userId === userId && siblings.some((l) => l.id === vp.lessonId))
    .reduce((max, vp) => Math.max(max, vp.watchedSeconds), 0);
}

function ratingSummary(courseId: string): { average: number | null; count: number } {
  const rows = state.reviews.filter((r) => r.courseId === courseId);
  if (rows.length === 0) return { average: null, count: 0 };
  const average = Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10;
  return { average, count: rows.length };
}

function allTestimonials(): TestimonialRecord[] {
  const seeded = seedTestimonials.map((t) => ({
    ...t,
    status: state.testimonialOverrides[t.id] ?? t.status,
  }));
  return [...state.submittedTestimonials, ...seeded];
}

// ---------- backend implementation ----------

export const localBackend: DataBackend = {
  async listCourses() {
    return effectiveCourses().filter((c) => c.isPublished);
  },

  async getCourseBySlug(slug) {
    const course = effectiveCourses().find((c) => c.slug === slug && c.isPublished);
    if (!course) return null;
    const lessons = (lessonsByCourse.get(course.id) ?? []).map(
      ({ content: _content, ...meta }) => meta,
    );
    return { course, lessons };
  },

  async getCourseRatings(courseId): Promise<CourseRatingSummary> {
    const { average, count } = ratingSummary(courseId);
    const recent = state.reviews
      .filter((r) => r.courseId === courseId && r.comment.trim().length > 0)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 3)
      .map((r) => ({
        rating: r.rating,
        comment: r.comment,
        name: state.users.find((u) => u.id === r.userId)?.name.split(" ")[0] ?? "Student",
        createdAt: r.createdAt,
      }));
    return { average, count, recent };
  },

  async listTestimonials() {
    return allTestimonials().filter((t) => t.status === "published");
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
    const course = baseCourses.find((c) => c.id === cert.courseId);
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
      role: "student",
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
    const course = courseById(courseId);
    if (!course || !course.isPublished) throw new Error("Course not found.");
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
      .filter((e) => e.userId === userId && courseById(e.courseId))
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

  async getLearnState(userId, courseSlug): Promise<LearnState | null> {
    const course = effectiveCourses().find((c) => c.slug === courseSlug);
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
    const completedSet = new Set(completedLessonIds);

    const lessonStates: LessonState[] = lessons.map((lesson, i) => {
      const completed = completedSet.has(lesson.id);
      const prevDone = i === 0 || completedSet.has(lessons[i - 1]!.id);
      return {
        lessonId: lesson.id,
        unlocked: completed || prevDone,
        videoDone: isVideoDone(userId, lesson),
        watchedSeconds: watchedSecondsFor(userId, lesson),
        completed,
      };
    });
    const stateByLesson = new Map(lessonStates.map((s) => [s.lessonId, s]));

    return {
      course,
      // Lesson notes unlock only after the lesson's video has been watched.
      lessons: lessons.map((l) => {
        const s = stateByLesson.get(l.id)!;
        return s.unlocked && s.videoDone ? l : { ...l, content: "" };
      }),
      enrollment: { ...enrollment, progress: computeProgress(userId, course.id).progress },
      completedLessonIds,
      lessonStates,
      certificate:
        state.certificates.find((c) => c.userId === userId && c.courseId === course.id) ?? null,
      projectSubmission:
        state.projects.find((p) => p.userId === userId && p.courseId === course.id) ?? null,
      myReview: state.reviews.find((r) => r.userId === userId && r.courseId === course.id) ?? null,
    };
  },

  async saveVideoProgress(userId, lessonId, watchedSeconds, playerDuration, ended) {
    const courseId = lessonId.split("/")[0] ?? "";
    const lesson = (lessonsByCourse.get(courseId) ?? []).find((l) => l.id === lessonId);
    if (!lesson) throw new Error("Lesson not found.");
    if (!state.enrollments.some((e) => e.userId === userId && e.courseId === courseId)) {
      throw new Error("You are not enrolled in this course.");
    }
    const required = requiredWindowSeconds(lesson, playerDuration);
    const safeWatched = Math.max(0, Math.min(watchedSeconds, required > 0 ? required : 86400));
    const completed = ended || (required > 0 && safeWatched >= required * WATCH_COMPLETION_RATIO);

    const existing = state.videoProgress.find(
      (vp) => vp.userId === userId && vp.lessonId === lessonId,
    );
    if (existing) {
      existing.watchedSeconds = Math.max(existing.watchedSeconds, safeWatched);
      existing.completed = existing.completed || completed;
      existing.updatedAt = new Date().toISOString();
    } else {
      state.videoProgress.push({
        userId,
        lessonId,
        watchedSeconds: safeWatched,
        completed,
        updatedAt: new Date().toISOString(),
      });
    }
    persist();
    return {
      videoDone: isVideoDone(userId, lesson),
      watchedSeconds: watchedSecondsFor(userId, lesson),
    };
  },

  async completeLesson(userId, lessonId) {
    const courseId = lessonId.split("/")[0] ?? "";
    const lessons = lessonsByCourse.get(courseId) ?? [];
    const index = lessons.findIndex((l) => l.id === lessonId);
    if (index === -1) throw new Error("Lesson not found.");
    const lesson = lessons[index]!;
    const enrollment = state.enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId,
    );
    if (!enrollment) throw new Error("You are not enrolled in this course.");
    const doneIds = new Set(
      state.lessonProgress.filter((lp) => lp.userId === userId).map((lp) => lp.lessonId),
    );
    if (index > 0 && !doneIds.has(lessons[index - 1]!.id)) {
      throw new Error("Complete the previous lesson first — lessons unlock in order.");
    }
    if (!isVideoDone(userId, lesson)) {
      throw new Error("Watch the full lesson video before marking this lesson complete.");
    }
    if (!doneIds.has(lessonId)) {
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

  async submitProject(userId, courseId, input) {
    if (!state.enrollments.some((e) => e.userId === userId && e.courseId === courseId)) {
      throw new Error("You are not enrolled in this course.");
    }
    const existing = state.projects.find((p) => p.userId === userId && p.courseId === courseId);
    if (existing) {
      existing.link = input.link;
      existing.notes = input.notes;
      existing.status = "pending";
      existing.submittedAt = new Date().toISOString();
      existing.reviewedAt = null;
      persist();
      return existing;
    }
    const record: ProjectSubmissionRecord = {
      id: randomUUID(),
      userId,
      courseId,
      link: input.link,
      notes: input.notes,
      status: "pending",
      feedback: null,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
    };
    state.projects.push(record);
    persist();
    return record;
  },

  async listMyProjects(userId): Promise<ProjectSubmissionWithCourse[]> {
    return state.projects
      .filter((p) => p.userId === userId)
      .map((p) => {
        const course = baseCourses.find((c) => c.id === p.courseId);
        return {
          ...p,
          courseTitle: course ? applyOverride(course).title : "Course",
          courseSlug: course?.slug ?? p.courseId,
        };
      })
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  },

  async submitReview(userId, courseId, input) {
    if (!state.enrollments.some((e) => e.userId === userId && e.courseId === courseId)) {
      throw new Error("You can only review courses you are enrolled in.");
    }
    const existing = state.reviews.find((r) => r.userId === userId && r.courseId === courseId);
    if (existing) {
      existing.rating = input.rating;
      existing.comment = input.comment;
      existing.createdAt = new Date().toISOString();
      persist();
      return existing;
    }
    const record: CourseReviewRecord = {
      id: randomUUID(),
      userId,
      courseId,
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    };
    state.reviews.push(record);
    persist();
    return record;
  },

  async listMyReviews(userId) {
    return state.reviews.filter((r) => r.userId === userId);
  },

  async submitTestimonial(userId, input) {
    const course = input.courseId ? baseCourses.find((c) => c.id === input.courseId) : null;
    const record: TestimonialRecord = {
      id: randomUUID(),
      name: input.name,
      role: input.role,
      quote: input.quote,
      courseId: input.courseId,
      courseTitle: course?.title ?? null,
      status: "pending",
      userId,
      createdAt: new Date().toISOString(),
    };
    // Replace any previous pending testimonial from the same student+course.
    const idx = state.submittedTestimonials.findIndex(
      (t) => t.userId === userId && t.courseId === input.courseId && t.status === "pending",
    );
    if (idx !== -1) state.submittedTestimonials[idx] = record;
    else state.submittedTestimonials.push(record);
    persist();
    return record;
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
        const course = baseCourses.find((x) => x.id === c.courseId)!;
        return {
          ...c,
          courseTitle: course.title,
          courseCategory: course.category,
          studentName: user?.name ?? "Student",
        };
      })
      .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
  },

  // ───────────────────────────── Admin ─────────────────────────────

  async adminOverview(): Promise<AdminOverview> {
    const courses = effectiveCourses();
    const ratings = state.reviews;
    return {
      students: state.users.filter((u) => u.role === "student").length,
      enrollments: state.enrollments.length,
      certificates: state.certificates.length,
      courses: courses.length,
      hiddenCourses: courses.filter((c) => !c.isPublished).length,
      pendingProjects: state.projects.filter((p) => p.status === "pending").length,
      pendingTestimonials: allTestimonials().filter((t) => t.status === "pending").length,
      publishedTestimonials: allTestimonials().filter((t) => t.status === "published").length,
      messages: state.contactSubmissions.length,
      reviews: ratings.length,
      averageRating:
        ratings.length === 0
          ? null
          : Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10,
    };
  },

  async adminListStudents(): Promise<AdminStudentRecord[]> {
    return state.users
      .filter((u) => u.role === "student")
      .map((u) => ({
        user: toPublicUser(u),
        joinedAt: u.createdAt ?? null,
        enrollmentCount: state.enrollments.filter((e) => e.userId === u.id).length,
        certificateCount: state.certificates.filter((c) => c.userId === u.id).length,
        projectCount: state.projects.filter((p) => p.userId === u.id).length,
      }))
      .sort((a, b) => ((a.joinedAt ?? "") < (b.joinedAt ?? "") ? 1 : -1));
  },

  async adminDeleteStudent(userId) {
    const user = state.users.find((u) => u.id === userId);
    if (!user) throw new Error("Student not found.");
    if (user.role === "admin") throw new Error("Admin accounts cannot be deleted here.");
    state.users = state.users.filter((u) => u.id !== userId);
    for (const [token, uid] of Object.entries(state.sessions)) {
      if (uid === userId) delete state.sessions[token];
    }
    state.enrollments = state.enrollments.filter((e) => e.userId !== userId);
    state.lessonProgress = state.lessonProgress.filter((lp) => lp.userId !== userId);
    state.videoProgress = state.videoProgress.filter((vp) => vp.userId !== userId);
    state.certificates = state.certificates.filter((c) => c.userId !== userId);
    state.projects = state.projects.filter((p) => p.userId !== userId);
    state.reviews = state.reviews.filter((r) => r.userId !== userId);
    state.submittedTestimonials = state.submittedTestimonials.filter((t) => t.userId !== userId);
    persist();
  },

  async adminListCourses(): Promise<AdminCourseRecord[]> {
    return baseCourses.map((base) => {
      const course = applyOverride(base);
      const { average, count } = ratingSummary(base.id);
      return {
        ...course,
        deleted: Boolean(state.courseOverrides[base.id]?.deleted),
        enrollmentCount: state.enrollments.filter((e) => e.courseId === base.id).length,
        ratingAvg: average,
        ratingCount: count,
      };
    });
  },

  async adminUpdateCourse(courseId, patch: CourseEditInput) {
    if (!baseCourses.some((c) => c.id === courseId)) throw new Error("Course not found.");
    const o = (state.courseOverrides[courseId] ??= {});
    if (patch.title !== undefined) o.title = patch.title;
    if (patch.summary !== undefined) o.summary = patch.summary;
    if (patch.priceNgn !== undefined) o.priceNgn = patch.priceNgn;
    if (patch.isFeatured !== undefined) o.isFeatured = patch.isFeatured;
    persist();
  },

  async adminSetCourseHidden(courseId, hidden) {
    if (!baseCourses.some((c) => c.id === courseId)) throw new Error("Course not found.");
    const o = (state.courseOverrides[courseId] ??= {});
    o.hidden = hidden;
    persist();
  },

  async adminSetCourseDeleted(courseId, deleted) {
    if (!baseCourses.some((c) => c.id === courseId)) throw new Error("Course not found.");
    const o = (state.courseOverrides[courseId] ??= {});
    o.deleted = deleted;
    persist();
  },

  async adminListProjects(): Promise<AdminProjectSubmission[]> {
    return state.projects
      .map((p) => {
        const course = baseCourses.find((c) => c.id === p.courseId);
        const user = state.users.find((u) => u.id === p.userId);
        return {
          ...p,
          courseTitle: course ? applyOverride(course).title : "Course",
          courseSlug: course?.slug ?? p.courseId,
          studentName: user?.name ?? "Student",
          studentEmail: user?.email ?? "",
        };
      })
      .sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return a.submittedAt < b.submittedAt ? 1 : -1;
      });
  },

  async adminReviewProject(submissionId, status, feedback) {
    const submission = state.projects.find((p) => p.id === submissionId);
    if (!submission) throw new Error("Submission not found.");
    submission.status = status;
    submission.feedback = feedback.trim() || null;
    submission.reviewedAt = new Date().toISOString();
    persist();
  },

  async adminListTestimonials() {
    return allTestimonials().sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return (a.createdAt ?? "") < (b.createdAt ?? "") ? 1 : -1;
    });
  },

  async adminSetTestimonialStatus(testimonialId, status) {
    const submitted = state.submittedTestimonials.find((t) => t.id === testimonialId);
    if (submitted) {
      submitted.status = status;
    } else if (seedTestimonials.some((t) => t.id === testimonialId)) {
      state.testimonialOverrides[testimonialId] = status;
    } else {
      throw new Error("Testimonial not found.");
    }
    persist();
  },

  async adminDeleteTestimonial(testimonialId) {
    const idx = state.submittedTestimonials.findIndex((t) => t.id === testimonialId);
    if (idx !== -1) {
      state.submittedTestimonials.splice(idx, 1);
    } else if (seedTestimonials.some((t) => t.id === testimonialId)) {
      state.testimonialOverrides[testimonialId] = "hidden";
    } else {
      throw new Error("Testimonial not found.");
    }
    persist();
  },

  async adminListMessages() {
    return [...state.contactSubmissions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async adminDeleteMessage(messageId) {
    state.contactSubmissions = state.contactSubmissions.filter((m) => m.id !== messageId);
    persist();
  },
};
