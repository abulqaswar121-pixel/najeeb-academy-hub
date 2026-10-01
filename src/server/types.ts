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

export interface LessonRecord {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  content: string;
  videoUrl: string | null;
  position: number;
}

export type LessonMeta = Omit<LessonRecord, "content">;

export interface UserRecord {
  id: string;
  name: string;
  email: string;
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

export interface TestimonialRecord {
  id: string;
  name: string;
  role: string;
  quote: string;
  courseId: string | null;
  courseTitle?: string | null;
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

export interface DataBackend {
  // public
  listCourses(): Promise<CourseRecord[]>;
  getCourseBySlug(slug: string): Promise<{ course: CourseRecord; lessons: LessonMeta[] } | null>;
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
  getLearnState(
    userId: string,
    courseSlug: string,
  ): Promise<{
    course: CourseRecord;
    lessons: LessonRecord[];
    enrollment: EnrollmentRecord;
    completedLessonIds: string[];
    certificate: CertificateRecord | null;
  } | null>;
  completeLesson(userId: string, lessonId: string): Promise<{ progress: number; courseId: string }>;
  issueCertificate(userId: string, courseId: string): Promise<CertificateRecord>;
  getCertificate(userId: string, courseId: string): Promise<CertificateRecord | null>;
  listCertificates(userId: string): Promise<CertificateWithDetails[]>;
}

export function generateCertificateCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `NDH-${code.slice(0, 4)}-${code.slice(4)}`;
}
