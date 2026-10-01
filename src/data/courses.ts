/**
 * Course catalog — generated from the NDH Academy 60-course bundle
 * (content/bundle/academy-catalog.json, mirrored at src/data/academy-catalog.json).
 *
 * Every course is built around one verified flagship YouTube tutorial,
 * split into six guided lessons with notes, a practical activity and a
 * reflection prompt, then finished with a final assessment and capstone.
 *
 * All 60 video IDs were checked against YouTube on 2026-10-01; 21 dead or
 * invalid IDs from the original bundle were replaced with live, verified
 * tutorials (flagged `videoReplaced`).
 */
import rawCatalog from "./academy-catalog.json";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface LessonDetail {
  title: string;
  notes: string;
  activity: string;
  reflection: string;
  startSeconds: number;
  endSeconds: number;
}

export interface CourseSeed {
  slug: string;
  title: string;
  category: string; // category slug from categories.ts
  summary: string;
  priceNgn: number;
  durationHours: number;
  level: CourseLevel;
  featured?: boolean;
  tools: string[];
  project: string;
  lessons: string[];
  // Video-first delivery
  videoId: string;
  videoTitle: string;
  videoAuthor: string;
  videoReplaced: boolean;
  videoDurationSeconds: number;
  lessonDetails: LessonDetail[];
  // Rich course-page content
  projectTitle: string;
  deliverables: string[];
  whoFor: string[];
  outcomes: string[];
  prerequisites: string;
  keyTerms: [string, string][];
}

interface RawCourse {
  num: number;
  slug: string;
  title: string;
  track: string;
  level: CourseLevel;
  durationHours: number;
  priceNgn: number;
  featured: boolean;
  tools: string[];
  videoId: string;
  videoTitle: string;
  videoAuthor: string;
  videoReplaced: boolean;
  durationSeconds: number;
  coverSrc: string;
  projectTitle: string;
  projectScenario: string;
  deliverables: string[];
  whoFor: string[];
  outcomes: string[];
  prerequisites: string;
  keyTerms: [string, string][];
  lessons: LessonDetail[];
}

/** Short, course-specific catalog summary (rotated per track so cards read naturally). */
function makeSummary(c: RawCourse): string {
  const topic = c.title.replace(/^AI /, "").replace(/^Build /, "");
  const tool = c.tools[0] ?? "ChatGPT";
  const toolList = c.tools.length > 1 ? `${c.tools.slice(0, 2).join(" and ")}` : tool;
  const byTrack: Record<string, string[]> = {
    "video-media": [
      `Produce commercial-grade ${topic.toLowerCase()} with ${toolList} — follow the full flagship tutorial, then ship a portfolio-ready capstone.`,
      `A hands-on ${topic.toLowerCase()} production course built on ${toolList}: six guided lessons, real deliverables, and a certified capstone project.`,
    ],
    "design-brand": [
      `Design client-ready ${topic.toLowerCase()} using ${toolList} — guided lessons, quality-control standards and a certified portfolio capstone.`,
      `Master ${topic.toLowerCase()} end to end with ${toolList}: from first concept to polished, commercial deliverables you can sell.`,
    ],
    "writing-content": [
      `Write ${topic.toLowerCase()} that converts — ${toolList} drafting workflows plus the human editing pass that makes it publishable.`,
      `A practical ${topic.toLowerCase()} system built on ${toolList}: structured prompts, editorial quality control and a certified capstone.`,
    ],
    "marketing-growth": [
      `Build a working ${topic.toLowerCase()} system with ${toolList} — set it up, measure it, and scale what converts.`,
      `Hands-on ${topic.toLowerCase()} training with ${toolList}: real campaign workflows, optimization habits and a certified capstone.`,
    ],
    "business-operations": [
      `Streamline ${topic.toLowerCase()} with ${toolList} — practical workflows you can deploy in a real business the same week.`,
      `Turn ${topic.toLowerCase()} into a repeatable system using ${toolList}: templates, quality checks and a certified capstone project.`,
    ],
    "ai-engineering": [
      `Build and ship ${topic.toLowerCase()} with ${toolList} — architecture, hands-on implementation and a deployed, certified capstone.`,
      `A builder's course on ${topic.toLowerCase()}: follow the full ${toolList} workflow from zero to a working, production-ready result.`,
    ],
  };
  const variants = byTrack[c.track] ?? byTrack["business-operations"]!;
  return variants[c.num % variants.length]!;
}

const catalog = rawCatalog as unknown as RawCourse[];

export const courses: CourseSeed[] = catalog.map((c) => ({
  slug: c.slug,
  title: c.title,
  category: c.track,
  summary: makeSummary(c),
  priceNgn: c.priceNgn,
  durationHours: c.durationHours,
  level: c.level,
  ...(c.featured ? { featured: true } : {}),
  tools: c.tools,
  project: c.projectScenario,
  lessons: c.lessons.map((l) => l.title),
  videoId: c.videoId,
  videoTitle: c.videoTitle,
  videoAuthor: c.videoAuthor,
  videoReplaced: c.videoReplaced,
  videoDurationSeconds: c.durationSeconds,
  lessonDetails: c.lessons,
  projectTitle: c.projectTitle,
  deliverables: c.deliverables,
  whoFor: c.whoFor,
  outcomes: c.outcomes,
  prerequisites: c.prerequisites,
  keyTerms: c.keyTerms,
}));

export function courseBySlug(slug: string): CourseSeed | undefined {
  return courses.find((c) => c.slug === slug);
}
