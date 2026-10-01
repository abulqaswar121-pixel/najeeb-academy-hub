import type { CourseSeed } from "./courses";
import { categoryBySlug } from "./categories";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Full course description — same text lands in the DB seed and the local store. */
export function buildDescription(course: CourseSeed): string {
  const cat = categoryBySlug(course.category);
  const lessonCount = course.lessons.length;
  return [
    course.summary,
    `This is a hands-on, self-paced course in the ${cat?.name ?? course.category} track, built around the verified flagship tutorial "${course.videoTitle}"${
      course.videoAuthor ? ` by ${course.videoAuthor}` : ""
    }. Across ${lessonCount} guided lessons (about ${course.durationHours} hours of structured work), you'll follow the full video while working in ${formatList(
      course.tools,
    )} — every lesson pairs the walkthrough with notes, a practical activity and a reflection check, so you're building from day one rather than just watching.`,
    `Who it's for: ${course.whoFor.map(lowerFirst).join("; ")}.`,
    `The course finishes with a final assessment and a practical capstone — ${course.projectTitle}. ${course.project} Submit it, pass the assessment, and you'll earn a signed, verifiable Najeeb Academy certificate you can share with employers and clients.`,
    `Level: ${course.level}. ${course.prerequisites} Lifetime access, learn at your own pace, and all future updates to the course are included in the one-time ${naira(
      course.priceNgn,
    )} fee.`,
  ].join("\n\n");
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Lesson body content (HTML). Composed from the bundle's per-lesson notes,
 * activity and reflection, plus the watch window inside the flagship tutorial.
 */
export function buildLessonContent(
  course: CourseSeed,
  title: string,
  index: number,
  total: number,
): string {
  const detail = course.lessonDetails[index];
  const parts: string[] = [];

  const watch = detail
    ? course.videoReplaced
      ? `<p><strong>Watch:</strong> the section of the course video above that covers this milestone. Work along in ${escapeHtml(
          formatList(course.tools),
        )} as you watch — pause freely and repeat steps until each one feels natural.</p>`
      : `<p><strong>Watch:</strong> ${mmss(detail.startSeconds)}–${mmss(
          detail.endSeconds,
        )} in the course video above (it starts at the right moment automatically). Work along in ${escapeHtml(
          formatList(course.tools),
        )} as you watch — pause freely and repeat steps until each one feels natural.</p>`
    : "";

  parts.push(
    `<p>Lesson <strong>${index + 1} of ${total}</strong> in <strong>${escapeHtml(course.title)}</strong>: ${escapeHtml(stripTrailing(title))}.</p>`,
  );
  if (watch) parts.push(watch);

  if (detail) {
    parts.push(`<p>${escapeHtml(detail.notes)}</p>`);
    parts.push(`<h3>Practical activity</h3><p>${escapeHtml(detail.activity)}</p>`);
    parts.push(`<h3>Reflection check</h3><p>${escapeHtml(detail.reflection)}</p>`);
  }

  if (index === total - 1) {
    parts.push(
      `<h3>Wrapping up the lessons</h3><p>That completes the guided portion of the course. Next up: the final assessment (70% pass mark, unlimited retakes) and your capstone — <strong>${escapeHtml(
        course.projectTitle,
      )}</strong>. Pass both and your signed certificate is issued instantly.</p>`,
    );
  } else {
    parts.push(
      `<h3>Next up</h3><p>When your activity output looks solid, mark this lesson complete and continue to <em>${escapeHtml(
        course.lessons[index + 1] ?? "",
      )}</em> — your progress is saved to your dashboard automatically.</p>`,
    );
  }

  return parts.join("");
}

function stripTrailing(s: string): string {
  return s.replace(/[.:!?]+$/, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "5 hours" / "1 hour" display string used in course cards and the DB seed. */
export function formatDuration(hours: number): string {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

/** URL-safe lesson slug derived from the lesson title. */
export function lessonSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Embeddable player URL for a lesson (privacy-enhanced YouTube embed). */
export function lessonVideoUrl(course: CourseSeed, index: number): string {
  const detail = course.lessonDetails[index];
  const base = `https://www.youtube-nocookie.com/embed/${course.videoId}`;
  // Timestamped jumps only when the bundle's chapter times match the actual video.
  if (!course.videoReplaced && detail && detail.startSeconds > 0) {
    return `${base}?start=${detail.startSeconds}`;
  }
  return base;
}
