import type { CourseSeed } from "./courses";
import { categoryBySlug } from "./categories";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** Full course description — same text lands in the DB seed and the local store. */
export function buildDescription(course: CourseSeed): string {
  const cat = categoryBySlug(course.category);
  const lessonCount = course.lessons.length;
  return [
    course.summary,
    `This is a hands-on, self-paced course in the ${cat?.name ?? course.category} track. Across ${lessonCount} focused lessons (about ${course.durationHours} hours of guided work), you'll work directly in ${formatList(
      course.tools,
    )} — every lesson ends with a concrete exercise, so you're building from day one rather than just watching.`,
    `The course finishes with a final assessment and a practical capstone: ${lowerFirst(course.project)} Submit it, pass the assessment, and you'll earn a signed, verifiable Najeeb Academy certificate you can share with employers and clients.`,
    `Level: ${course.level}. No prior AI experience is assumed beyond basic computer literacy${
      course.level === "Advanced"
        ? ", though earlier courses in this track will make the ride smoother"
        : ""
    }. Lifetime access, learn at your own pace, and all future updates to the course are included in the one-time ${naira(
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
 * Lesson body content. Deterministic, course-specific composition: weaves the
 * lesson title, course tools and capstone project into a structured lesson page.
 */
export function buildLessonContent(
  course: CourseSeed,
  lessonTitle: string,
  index: number,
  total: number,
): string {
  const cat = categoryBySlug(course.category);
  const tool = course.tools[index % course.tools.length] ?? course.tools[0] ?? "your AI toolkit";
  const nextTitle = index + 1 < total ? (course.lessons[index + 1] ?? null) : null;

  const intro =
    index === 0
      ? `<p>Welcome to <strong>${escapeHtml(course.title)}</strong>. This opening lesson sets the foundation for everything that follows in the ${escapeHtml(
          cat?.name ?? course.category,
        )} track: ${escapeHtml(lowerFirst(stripTrailing(lessonTitle)))}. Before touching any tool, you'll build the mental model that separates people who get lucky results from people who get repeatable ones.</p>`
      : `<p>In this lesson we focus on <strong>${escapeHtml(stripTrailing(lessonTitle))}</strong>. It builds directly on what you've done so far, and the exercise at the end feeds into your capstone project, so keep your working files from previous lessons open.</p>`;

  const body = `<p>You'll work primarily in ${escapeHtml(tool)} for this lesson. We walk through the workflow step by step on a realistic scenario, flag the mistakes that cost beginners the most time, and show you how professionals verify their output before shipping it. Pause at each checkpoint and reproduce the result yourself — the skill is in your hands, not your notes.</p>`;

  const checklist = `<h3>In this lesson</h3><ul><li>The core idea: ${escapeHtml(lowerFirst(stripTrailing(lessonTitle)))} — explained with worked examples</li><li>A guided walkthrough in ${escapeHtml(tool)}</li><li>Common pitfalls and how to recover from them</li><li>A practice exercise with a model answer to compare against</li></ul>`;

  const outro =
    index === total - 1
      ? `<h3>Wrapping up the lessons</h3><p>That completes the taught portion of the course. Next up: the final assessment, and your capstone project — ${escapeHtml(
          lowerFirst(course.project),
        )} Review your exercise files from each lesson; they're the building blocks of your submission.</p>`
      : `<h3>Next up</h3><p>Complete the practice exercise, mark this lesson as done, and continue to <em>${escapeHtml(
          nextTitle ?? "",
        )}</em>.</p>`;

  return [intro, body, checklist, outro].join("");
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

/** Stable slug for a lesson within a course. */
export function lessonSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

/** Display duration, e.g. "4 hours". */
export function formatDuration(hours: number): string {
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}
