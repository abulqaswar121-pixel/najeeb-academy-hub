/**
 * Generates supabase/migrations/20261001000200_academy_seed.sql from the
 * canonical course data in src/data/. Re-run after editing the seed data:
 *
 *   bunx tsx scripts/generate-seed-sql.ts
 *
 * The output is committed so the migration contains literal INSERT statements.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

import { courses } from "../src/data/courses";
import { testimonials } from "../src/data/testimonials";
import {
  buildDescription,
  buildLessonContent,
  formatDuration,
  lessonSlug,
} from "../src/data/content";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (items: string[]) => `array[${items.map(q).join(", ")}]::text[]`;

const lines: string[] = [
  "-- ─────────────────────────────────────────────────────────────────────────",
  "-- Najeeb Academy — catalog seed (generated from src/data via scripts/generate-seed-sql.ts)",
  `-- ${courses.length} courses, ${courses.reduce((n, c) => n + c.lessons.length, 0)} lessons, ${testimonials.length} testimonials`,
  "-- ─────────────────────────────────────────────────────────────────────────",
  "",
];

for (const course of courses) {
  const image = `/images/courses/${course.slug}.jpg`;
  lines.push(
    `insert into public.courses (title, slug, summary, description, category, price_ngn, duration, image, is_published, level, is_featured, tools, project) values (` +
      [
        q(course.title),
        q(course.slug),
        q(course.summary),
        q(buildDescription(course)),
        q(course.category),
        String(course.priceNgn),
        q(formatDuration(course.durationHours)),
        q(image),
        "true",
        q(course.level),
        course.featured ? "true" : "false",
        arr(course.tools),
        q(course.project),
      ].join(", ") +
      `);`,
  );
  course.lessons.forEach((title, i) => {
    lines.push(
      `insert into public.lessons (course_id, title, slug, content, video_url, position) values (` +
        `(select id from public.courses where slug = ${q(course.slug)}), ` +
        [
          q(title),
          q(lessonSlug(title)),
          q(buildLessonContent(course, title, i, course.lessons.length)),
          "null",
          String(i + 1),
        ].join(", ") +
        `);`,
    );
  });
  lines.push("");
}

lines.push("-- Testimonials");
for (const t of testimonials) {
  const courseRef = t.courseSlug
    ? `(select id from public.courses where slug = ${q(t.courseSlug)})`
    : "null";
  lines.push(
    `insert into public.testimonials (name, role, quote, course_id) values (${q(t.name)}, ${q(t.role)}, ${q(t.quote)}, ${courseRef});`,
  );
}
lines.push("");

const outPath = path.join(process.cwd(), "supabase/migrations/20261001000200_academy_seed.sql");
writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${outPath} (${(lines.join("\n").length / 1024).toFixed(1)} KB)`);
