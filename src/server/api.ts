/**
 * Server-side implementation of every academy operation. This module lives in
 * src/server/ (never bundled to the client) and is loaded by the server
 * functions in src/lib/server-fns.ts via dynamic import inside their handlers.
 */
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

import { assessments, PASS_MARK } from "../data/assessments";
import { localBackend } from "./local-backend";
import { getSupabaseConfig, setRequestAccessToken, supabaseBackend } from "./supabase-backend";
import type {
  CourseEditInput,
  DataBackend,
  ProjectStatus,
  TestimonialStatus,
  UserRecord,
} from "./types";

const SESSION_COOKIE = "ndh_academy_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function backend(): DataBackend {
  return getSupabaseConfig() ? supabaseBackend : localBackend;
}

async function currentUser(): Promise<UserRecord | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  setRequestAccessToken(token);
  const result = await backend().getUser(token);
  if (!result) return null;
  if (result.refreshedToken) {
    setCookie(SESSION_COOKIE, result.refreshedToken, COOKIE_OPTIONS);
    setRequestAccessToken(result.refreshedToken);
  }
  return result.user;
}

async function requireUser(): Promise<UserRecord> {
  const user = await currentUser();
  if (!user) throw new Error("Please log in to continue.");
  return user;
}

async function requireAdmin(): Promise<UserRecord> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Admin access required.");
  return user;
}

// ─────────────────────────── Public catalog ───────────────────────────

export async function listCourses() {
  return backend().listCourses();
}

export async function getCourseDetail(slug: string) {
  const result = await backend().getCourseBySlug(slug);
  if (!result) return null;
  const [all, ratings] = await Promise.all([
    backend().listCourses(),
    backend().getCourseRatings(result.course.id),
  ]);
  const related = all
    .filter((c) => c.category === result.course.category && c.id !== result.course.id)
    .slice(0, 3);
  return { ...result, related, ratings };
}

export async function listTestimonials() {
  return backend().listTestimonials();
}

export async function submitContact(input: { name: string; email: string; message: string }) {
  await backend().submitContact(input);
  return { ok: true };
}

export async function verifyCertificate(code: string) {
  return backend().verifyCertificate(code);
}

// ─────────────────────────────── Auth ───────────────────────────────

export async function signUp(input: { name: string; email: string; password: string }) {
  const { token, user } = await backend().signUp(input);
  setCookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
  return user;
}

export async function signIn(input: { email: string; password: string }) {
  const { token, user } = await backend().signIn(input);
  setCookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
  return user;
}

export async function signOut() {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    setRequestAccessToken(token);
    await backend().signOut(token);
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true };
}

export async function getMe() {
  return currentUser();
}

// ───────────────────────────── Student ─────────────────────────────

export async function enroll(courseId: string) {
  const user = await requireUser();
  return backend().enroll(user.id, courseId);
}

export async function getDashboard() {
  const user = await currentUser();
  if (!user) return null;
  const [enrollments, certificates, projects, reviews] = await Promise.all([
    backend().listEnrollments(user.id),
    backend().listCertificates(user.id),
    backend().listMyProjects(user.id),
    backend().listMyReviews(user.id),
  ]);
  return { user, enrollments, certificates, projects, reviews };
}

export async function getLearn(slug: string) {
  const user = await currentUser();
  if (!user) return { status: "unauthenticated" as const };
  const state = await backend().getLearnState(user.id, slug);
  if (!state) return { status: "not-enrolled" as const };
  const questions = (assessments[state.course.category] ?? []).map((q, i) => ({
    index: i,
    question: q.question,
    options: q.options,
  }));
  return { status: "ok" as const, user, ...state, assessment: questions };
}

export async function saveVideoProgress(input: {
  lessonId: string;
  watchedSeconds: number;
  playerDuration: number;
  ended: boolean;
}) {
  const user = await requireUser();
  return backend().saveVideoProgress(
    user.id,
    input.lessonId,
    input.watchedSeconds,
    input.playerDuration,
    input.ended,
  );
}

export async function completeLesson(lessonId: string) {
  const user = await requireUser();
  return backend().completeLesson(user.id, lessonId);
}

export async function submitProject(input: { courseSlug: string; link: string; notes: string }) {
  const user = await requireUser();
  const state = await backend().getLearnState(user.id, input.courseSlug);
  if (!state) throw new Error("You are not enrolled in this course.");
  if (state.completedLessonIds.length < state.lessons.length) {
    throw new Error("Complete all lessons before submitting your capstone project.");
  }
  return backend().submitProject(user.id, state.course.id, {
    link: input.link,
    notes: input.notes,
  });
}

export async function submitAssessment(input: { courseSlug: string; answers: number[] }) {
  const user = await requireUser();
  const state = await backend().getLearnState(user.id, input.courseSlug);
  if (!state) throw new Error("You are not enrolled in this course.");
  if (state.completedLessonIds.length < state.lessons.length) {
    throw new Error("Complete all lessons before taking the final assessment.");
  }
  if (!state.projectSubmission) {
    throw new Error("Submit your capstone project before taking the final assessment.");
  }
  const bank = assessments[state.course.category] ?? [];
  if (bank.length === 0) throw new Error("No assessment is available for this course yet.");
  if (input.answers.length !== bank.length) throw new Error("Please answer every question.");

  const correct = bank.reduce((acc, q, i) => acc + (input.answers[i] === q.answerIndex ? 1 : 0), 0);
  const score = correct / bank.length;
  const passed = score >= PASS_MARK;

  if (!passed) {
    return { passed: false as const, correct, total: bank.length };
  }
  const certificate = await backend().issueCertificate(user.id, state.course.id);
  return { passed: true as const, correct, total: bank.length, certificate };
}

export async function submitReview(input: {
  courseSlug: string;
  rating: number;
  comment: string;
  asTestimonial: boolean;
  testimonialRole: string;
}) {
  const user = await requireUser();
  const state = await backend().getLearnState(user.id, input.courseSlug);
  if (!state) throw new Error("You are not enrolled in this course.");
  const review = await backend().submitReview(user.id, state.course.id, {
    rating: input.rating,
    comment: input.comment,
  });
  let testimonialSubmitted = false;
  if (input.asTestimonial && input.comment.trim().length > 0) {
    await backend().submitTestimonial(user.id, {
      name: user.name,
      role: input.testimonialRole.trim() || "Najeeb Academy student",
      quote: input.comment.trim(),
      courseId: state.course.id,
    });
    testimonialSubmitted = true;
  }
  return { review, testimonialSubmitted };
}

// ────────────────────────────── Admin ──────────────────────────────

export async function adminGetOverview() {
  await requireAdmin();
  return backend().adminOverview();
}

export async function adminGetStudents() {
  await requireAdmin();
  return backend().adminListStudents();
}

export async function adminDeleteStudent(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) throw new Error("You cannot delete your own account.");
  await backend().adminDeleteStudent(userId);
  return { ok: true };
}

export async function adminGetCourses() {
  await requireAdmin();
  return backend().adminListCourses();
}

export async function adminUpdateCourse(courseId: string, patch: CourseEditInput) {
  await requireAdmin();
  await backend().adminUpdateCourse(courseId, patch);
  return { ok: true };
}

export async function adminSetCourseHidden(courseId: string, hidden: boolean) {
  await requireAdmin();
  await backend().adminSetCourseHidden(courseId, hidden);
  return { ok: true };
}

export async function adminSetCourseDeleted(courseId: string, deleted: boolean) {
  await requireAdmin();
  await backend().adminSetCourseDeleted(courseId, deleted);
  return { ok: true };
}

export async function adminGetProjects() {
  await requireAdmin();
  return backend().adminListProjects();
}

export async function adminReviewProject(input: {
  submissionId: string;
  status: Exclude<ProjectStatus, "pending">;
  feedback: string;
}) {
  await requireAdmin();
  await backend().adminReviewProject(input.submissionId, input.status, input.feedback);
  return { ok: true };
}

export async function adminGetTestimonials() {
  await requireAdmin();
  return backend().adminListTestimonials();
}

export async function adminSetTestimonialStatus(testimonialId: string, status: TestimonialStatus) {
  await requireAdmin();
  await backend().adminSetTestimonialStatus(testimonialId, status);
  return { ok: true };
}

export async function adminDeleteTestimonial(testimonialId: string) {
  await requireAdmin();
  await backend().adminDeleteTestimonial(testimonialId);
  return { ok: true };
}

export async function adminGetMessages() {
  await requireAdmin();
  return backend().adminListMessages();
}

export async function adminDeleteMessage(messageId: string) {
  await requireAdmin();
  await backend().adminDeleteMessage(messageId);
  return { ok: true };
}
