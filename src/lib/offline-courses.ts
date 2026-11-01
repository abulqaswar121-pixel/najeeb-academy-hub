/**
 * Courses saved for offline reading. Stored inside the app (browser storage),
 * never as files on the phone. Only notes the student has already unlocked
 * (video watched) are saved; YouTube videos themselves cannot be stored.
 */
export interface OfflineLesson {
  title: string;
  position: number;
  content: string | null; // null = notes still locked when saved
}

export interface OfflineCourse {
  slug: string;
  title: string;
  level: string;
  savedAt: string;
  lessons: OfflineLesson[];
}

const KEY = "ndh-offline-courses";

export function listOfflineCourses(): OfflineCourse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as OfflineCourse[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: OfflineCourse[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("ndh-offline-changed"));
}

export function saveOfflineCourse(course: OfflineCourse) {
  const rest = listOfflineCourses().filter((c) => c.slug !== course.slug);
  write([course, ...rest]);
}

export function removeOfflineCourse(slug: string) {
  write(listOfflineCourses().filter((c) => c.slug !== slug));
}

export function isSavedOffline(slug: string): boolean {
  return listOfflineCourses().some((c) => c.slug === slug);
}
