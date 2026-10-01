/**
 * Server function definitions (safe to import from routes/components — the
 * client bundle only ever sees RPC stubs). All real logic lives in
 * src/server/api.ts, loaded lazily inside each handler so no server code
 * leaks into the client build.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const api = () => import("../server/api");

// ─────────────────────────── Public catalog ───────────────────────────

export const fetchCourses = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).listCourses();
});

export const fetchCourseDetail = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).getCourseDetail(data.slug);
  });

export const fetchTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).listTestimonials();
});

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2, "Please enter your name").max(120),
      email: z.string().email("Please enter a valid email"),
      message: z.string().min(10, "Please tell us a bit more").max(5000),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).submitContact(data);
  });

export const verifyCertificateFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ code: z.string().min(4).max(40) }))
  .handler(async ({ data }) => {
    return (await api()).verifyCertificate(data.code);
  });

// ─────────────────────────────── Auth ───────────────────────────────

export const signUpFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2, "Please enter your full name").max(120),
      email: z.string().email("Please enter a valid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).signUp(data);
  });

export const signInFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email("Please enter a valid email"),
      password: z.string().min(1, "Please enter your password"),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).signIn(data);
  });

export const signOutFn = createServerFn({ method: "POST" }).handler(async () => {
  return (await api()).signOut();
});

export const fetchMe = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).getMe();
});

// ───────────────────────────── Student ─────────────────────────────

export const enrollFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ courseId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).enroll(data.courseId);
  });

export const fetchDashboard = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).getDashboard();
});

export const fetchLearn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).getLearn(data.slug);
  });

export const completeLessonFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ lessonId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).completeLesson(data.lessonId);
  });

export const submitAssessmentFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      courseSlug: z.string().min(1),
      answers: z.array(z.number().int().min(-1).max(5)),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).submitAssessment(data);
  });
