/**
 * Builds the cover image for every course from the NDH Academy bundle
 * artwork (content/bundle/cover_images/course_NN_cover.jpg), normalized
 * to 1280x720 at quality 82 and written to public/images/courses/<slug>.jpg.
 *
 *   bunx tsx scripts/generate-course-covers.ts   (requires ImageMagick)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import rawCatalog from "../src/data/academy-catalog.json";

interface CatalogEntry {
  num: number;
  slug: string;
  coverSrc: string;
}

const catalog = rawCatalog as unknown as CatalogEntry[];

const OUT_DIR = path.join(process.cwd(), "public/images/courses");
const SRC_DIR = path.join(process.cwd(), "content/bundle/cover_images");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

for (const course of catalog) {
  const source = path.join(SRC_DIR, course.coverSrc);
  if (!existsSync(source)) {
    throw new Error(`Missing bundle cover: ${course.coverSrc} for ${course.slug}`);
  }
  const out = path.join(OUT_DIR, `${course.slug}.jpg`);
  execFileSync("convert", [
    source,
    "-resize",
    "1280x720^",
    "-gravity",
    "center",
    "-extent",
    "1280x720",
    "-quality",
    "82",
    out,
  ]);
  console.log(`✓ ${course.slug} ← ${course.coverSrc}`);
}

console.log(`\nGenerated ${catalog.length} course covers in public/images/courses/`);
