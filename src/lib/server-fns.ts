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
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).getCourseDetail(data.slug);
  });

export const fetchTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).listTestimonials();
});

export const submitContactForm = createServerFn({ method: "POST" })
  .validator(
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
  .validator(z.object({ code: z.string().min(4).max(40) }))
  .handler(async ({ data }) => {
    return (await api()).verifyCertificate(data.code);
  });

// ─────────────────────────────── Auth ───────────────────────────────

export const signUpFn = createServerFn({ method: "POST" })
  .validator(
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
  .validator(
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
  .validator(z.object({ courseId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).enroll(data.courseId);
  });

export const fetchDashboard = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).getDashboard();
});

export const fetchLearn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).getLearn(data.slug);
  });

export const completeLessonFn = createServerFn({ method: "POST" })
  .validator(z.object({ lessonId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).completeLesson(data.lessonId);
  });

export const saveVideoProgressFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      lessonId: z.string().min(1),
      watchedSeconds: z.number().min(0).max(86400),
      playerDuration: z.number().min(0).max(86400),
      ended: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).saveVideoProgress(data);
  });

export const submitProjectFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      courseSlug: z.string().min(1),
      link: z.string().url("Enter a valid link (Google Drive, GitHub, portfolio …)").max(500),
      notes: z.string().max(3000),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).submitProject(data);
  });

export const submitReviewFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      courseSlug: z.string().min(1),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(1200),
      asTestimonial: z.boolean(),
      testimonialRole: z.string().max(120),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).submitReview(data);
  });

// ────────────────────────────── Admin ──────────────────────────────

export const adminOverviewFn = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).adminGetOverview();
});

export const adminStudentsFn = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).adminGetStudents();
});

export const adminDeleteStudentFn = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).adminDeleteStudent(data.userId);
  });

export const adminCoursesFn = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).adminGetCourses();
});

export const adminUpdateCourseFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      courseId: z.string().min(1),
      title: z.string().min(3).max(160).optional(),
      summary: z.string().min(10).max(600).optional(),
      priceNgn: z.number().int().min(0).max(10_000_000).optional(),
      isFeatured: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).adminUpdateCourse(data.courseId, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.priceNgn !== undefined ? { priceNgn: data.priceNgn } : {}),
      ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
    });
  });

export const adminSetCourseHiddenFn = createServerFn({ method: "POST" })
  .validator(z.object({ courseId: z.string().min(1), hidden: z.boolean() }))
  .handler(async ({ data }) => {
    return (await api()).adminSetCourseHidden(data.courseId, data.hidden);
  });

export const adminSetCourseDeletedFn = createServerFn({ method: "POST" })
  .validator(z.object({ courseId: z.string().min(1), deleted: z.boolean() }))
  .handler(async ({ data }) => {
    return (await api()).adminSetCourseDeleted(data.courseId, data.deleted);
  });

export const adminProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).adminGetProjects();
});

export const adminReviewProjectFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      submissionId: z.string().min(1),
      status: z.enum(["approved", "changes_requested"]),
      feedback: z.string().max(3000),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).adminReviewProject(data);
  });

export const adminTestimonialsFn = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).adminGetTestimonials();
});

export const adminSetTestimonialStatusFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      testimonialId: z.string().min(1),
      status: z.enum(["pending", "published", "hidden"]),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).adminSetTestimonialStatus(data.testimonialId, data.status);
  });

export const adminDeleteTestimonialFn = createServerFn({ method: "POST" })
  .validator(z.object({ testimonialId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).adminDeleteTestimonial(data.testimonialId);
  });

export const adminMessagesFn = createServerFn({ method: "GET" }).handler(async () => {
  return (await api()).adminGetMessages();
});

export const adminDeleteMessageFn = createServerFn({ method: "POST" })
  .validator(z.object({ messageId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return (await api()).adminDeleteMessage(data.messageId);
  });

export const submitAssessmentFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      courseSlug: z.string().min(1),
      answers: z.array(z.number().int().min(-1).max(5)),
    }),
  )
  .handler(async ({ data }) => {
    return (await api()).submitAssessment(data);
  });
