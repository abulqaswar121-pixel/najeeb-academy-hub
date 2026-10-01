/**
 * Generates supabase/migrations/20261001000400_video_meta.sql — per-lesson
 * video watch windows (video_id, video_start, video_end, video_duration)
 * backfilled from the course catalog. Lessons of courses whose original
 * bundle video was replaced play the full replacement video (no window).
 *
 * Run with: npx -y tsx scripts/generate-video-meta-sql.ts
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

import { courses } from "../src/data/courses";

const lines: string[] = [
  "-- ─────────────────────────────────────────────────────────────────────────",
  "-- Najeeb Academy — per-lesson video watch windows (generated file)",
  "-- Regenerate with: npx -y tsx scripts/generate-video-meta-sql.ts",
  "-- ─────────────────────────────────────────────────────────────────────────",
  "",
];

for (const course of courses) {
  lines.push(`-- ${course.title}`);
  course.lessons.forEach((_title, i) => {
    const detail = course.lessonDetails[i];
    const hasWindow = !course.videoReplaced && detail && detail.endSeconds > detail.startSeconds;
    const start = hasWindow ? detail.startSeconds : 0;
    const end = hasWindow ? String(detail.endSeconds) : "null";
    const duration = course.videoReplaced ? "null" : String(course.videoDurationSeconds);
    lines.push(
      `update public.lessons l set video_id = '${course.videoId}', video_start = ${start}, ` +
        `video_end = ${end}, video_duration = ${duration} ` +
        `from public.courses c where c.id = l.course_id and c.slug = '${course.slug}' and l.position = ${i + 1};`,
    );
  });
  lines.push("");
}

const outPath = path.join(process.cwd(), "supabase/migrations/20261001000400_video_meta.sql");
writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${outPath} (${lines.length} lines)`);
