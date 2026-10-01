export type UserRole = "student" | "admin";

export interface CourseRecord {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  priceNgn: number;
  duration: string;
  image: string;
  isPublished: boolean;
  level: string;
  isFeatured: boolean;
  tools: string[];
  project: string;
  lessonCount: number;
}

export interface AdminCourseRecord extends CourseRecord {
  deleted: boolean;
  enrollmentCount: number;
  ratingAvg: number | null;
  ratingCount: number;
}

export interface LessonRecord {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  content: string;
  videoUrl: string | null;
  /** Raw YouTube video id + the watch window for this lesson (seconds). */
  videoId: string | null;
  videoStart: number;
  videoEnd: number | null;
  videoDuration: number | null;
  position: number;
}

export type LessonMeta = Omit<LessonRecord, "content">;

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface EnrollmentRecord {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
}

export interface CertificateRecord {
  id: string;
  userId: string;
  courseId: string;
  code: string;
  issuedAt: string;
}

export type TestimonialStatus = "pending" | "published" | "hidden";

export interface TestimonialRecord {
  id: string;
  name: string;
  role: string;
  quote: string;
  courseId: string | null;
  courseTitle?: string | null;
  status: TestimonialStatus;
  userId?: string | null;
  createdAt?: string | null;
}

export type ProjectStatus = "pending" | "approved" | "changes_requested";

export interface ProjectSubmissionRecord {
  id: string;
  userId: string;
  courseId: string;
  link: string;
  notes: string;
  status: ProjectStatus;
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface ProjectSubmissionWithCourse extends ProjectSubmissionRecord {
  courseTitle: string;
  courseSlug: string;
}

export interface AdminProjectSubmission extends ProjectSubmissionWithCourse {
  studentName: string;
  studentEmail: string;
}

export interface CourseReviewRecord {
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
}

export interface VideoProgressRecord {
  userId: string;
  lessonId: string;
  watchedSeconds: number;
  completed: boolean;
  updatedAt: string;
}

/** Per-lesson state sent to the learn page. */
export interface LessonState {
  lessonId: string;
  /** Lesson may be opened (sequential unlocking). */
  unlocked: boolean;
  /** The lesson's video window has been fully watched. */
  videoDone: boolean;
  /** Seconds of the window already watched (resume point / seek ceiling). */
  watchedSeconds: number;
  /** Lesson marked complete. */
  completed: boolean;
}

export interface EnrollmentWithCourse extends EnrollmentRecord {
  course: CourseRecord;
  completedLessons: number;
  nextLessonSlug: string | null;
  certificate: CertificateRecord | null;
}

export interface CertificateWithDetails extends CertificateRecord {
  courseTitle: string;
  courseCategory: string;
  studentName: string;
}

export interface VerifiedCertificate {
  code: string;
  studentName: string;
  courseTitle: string;
  courseCategory: string;
  issuedAt: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface AdminStudentRecord {
  user: UserRecord;
  joinedAt: string | null;
  enrollmentCount: number;
  certificateCount: number;
  projectCount: number;
}

export interface AdminOverview {
  students: number;
  enrollments: number;
  certificates: number;
  courses: number;
  hiddenCourses: number;
  pendingProjects: number;
  pendingTestimonials: number;
  publishedTestimonials: number;
  messages: number;
  reviews: number;
  averageRating: number | null;
}

export interface CourseRatingSummary {
  average: number | null;
  count: number;
  recent: { rating: number; comment: string; name: string; createdAt: string }[];
}

export interface CourseEditInput {
  title?: string;
  summary?: string;
  priceNgn?: number;
  isFeatured?: boolean;
}

export interface LearnState {
  course: CourseRecord;
  lessons: LessonRecord[];
  enrollment: EnrollmentRecord;
  completedLessonIds: string[];
  lessonStates: LessonState[];
  certificate: CertificateRecord | null;
  projectSubmission: ProjectSubmissionRecord | null;
  myReview: CourseReviewRecord | null;
}

export interface DataBackend {
  // public
  listCourses(): Promise<CourseRecord[]>;
  getCourseBySlug(slug: string): Promise<{ course: CourseRecord; lessons: LessonMeta[] } | null>;
  getCourseRatings(courseId: string): Promise<CourseRatingSummary>;
  listTestimonials(): Promise<TestimonialRecord[]>;
  submitContact(input: { name: string; email: string; message: string }): Promise<void>;
  verifyCertificate(code: string): Promise<VerifiedCertificate | null>;

  // auth — returns a session token to store in the cookie
  signUp(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: UserRecord }>;
  signIn(input: { email: string; password: string }): Promise<{ token: string; user: UserRecord }>;
  signOut(token: string): Promise<void>;
  /** Returns the user for a session token, plus optionally a refreshed token to re-set. */
  getUser(token: string): Promise<{ user: UserRecord; refreshedToken?: string } | null>;

  // student (all take the authenticated user id)
  enroll(userId: string, courseId: string): Promise<EnrollmentRecord>;
  listEnrollments(userId: string): Promise<EnrollmentWithCourse[]>;
  getLearnState(userId: string, courseSlug: string): Promise<LearnState | null>;
  /** Persist watch progress for a lesson window; returns the resulting state. */
  saveVideoProgress(
    userId: string,
    lessonId: string,
    watchedSeconds: number,
    playerDuration: number,
    ended: boolean,
  ): Promise<{ videoDone: boolean; watchedSeconds: number }>;
  completeLesson(userId: string, lessonId: string): Promise<{ progress: number; courseId: string }>;
  submitProject(
    userId: string,
    courseId: string,
    input: { link: string; notes: string },
  ): Promise<ProjectSubmissionRecord>;
  listMyProjects(userId: string): Promise<ProjectSubmissionWithCourse[]>;
  submitReview(
    userId: string,
    courseId: string,
    input: { rating: number; comment: string },
  ): Promise<CourseReviewRecord>;
  listMyReviews(userId: string): Promise<CourseReviewRecord[]>;
  submitTestimonial(
    userId: string,
    input: { name: string; role: string; quote: string; courseId: string | null },
  ): Promise<TestimonialRecord>;
  issueCertificate(userId: string, courseId: string): Promise<CertificateRecord>;
  getCertificate(userId: string, courseId: string): Promise<CertificateRecord | null>;
  listCertificates(userId: string): Promise<CertificateWithDetails[]>;

  // admin (callers must already be verified as admins)
  adminOverview(): Promise<AdminOverview>;
  adminListStudents(): Promise<AdminStudentRecord[]>;
  adminDeleteStudent(userId: string): Promise<void>;
  adminListCourses(): Promise<AdminCourseRecord[]>;
  adminUpdateCourse(courseId: string, patch: CourseEditInput): Promise<void>;
  adminSetCourseHidden(courseId: string, hidden: boolean): Promise<void>;
  adminSetCourseDeleted(courseId: string, deleted: boolean): Promise<void>;
  adminListProjects(): Promise<AdminProjectSubmission[]>;
  adminReviewProject(
    submissionId: string,
    status: Exclude<ProjectStatus, "pending">,
    feedback: string,
  ): Promise<void>;
  adminListTestimonials(): Promise<TestimonialRecord[]>;
  adminSetTestimonialStatus(testimonialId: string, status: TestimonialStatus): Promise<void>;
  adminDeleteTestimonial(testimonialId: string): Promise<void>;
  adminListMessages(): Promise<ContactMessageRecord[]>;
  adminDeleteMessage(messageId: string): Promise<void>;
}

export function generateCertificateCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `NDH-${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Two lessons "share" a video window when id/start/end all match (e.g. full-video courses). */
export function sameWindow(
  a: Pick<LessonRecord, "videoId" | "videoStart" | "videoEnd">,
  b: Pick<LessonRecord, "videoId" | "videoStart" | "videoEnd">,
): boolean {
  return (
    a.videoId !== null &&
    a.videoId === b.videoId &&
    a.videoStart === b.videoStart &&
    (a.videoEnd ?? null) === (b.videoEnd ?? null)
  );
}

/** Seconds a student must watch for a lesson's window to count as done. */
export function requiredWindowSeconds(
  lesson: Pick<LessonRecord, "videoStart" | "videoEnd" | "videoDuration">,
  playerDuration: number,
): number {
  const end = lesson.videoEnd ?? lesson.videoDuration ?? playerDuration;
  return Math.max(0, end - lesson.videoStart);
}

export const WATCH_COMPLETION_RATIO = 0.92;
