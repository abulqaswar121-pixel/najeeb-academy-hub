/**
 * Builds a unique cover image for every course.
 *
 * Priority 1: bespoke per-course artwork in public/images/course-art/<slug>.jpg
 *             (normalized to 1280x720).
 * Priority 2: derived from the track's base artwork
 *             (public/images/categories/<cat>.jpg + optional <cat>-b.jpg)
 *             using a distinct base/mirror/hue/zoom combination per course,
 *             so no two courses share the same cover.
 *
 *   bunx tsx scripts/generate-course-covers.ts   (requires ImageMagick)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { courses } from "../src/data/courses";

const OUT_DIR = path.join(process.cwd(), "public/images/courses");
const CAT_DIR = path.join(process.cwd(), "public/images/categories");
const ART_DIR = path.join(process.cwd(), "public/images/course-art");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Variant recipes: [useAltBase, flop, modulate(brightness,saturation,hue), zoomCrop]
type Recipe = { alt: boolean; flop: boolean; modulate: string | null; zoom: boolean };

const withAlt: Recipe[] = [
  { alt: false, flop: false, modulate: null, zoom: false },
  { alt: true, flop: false, modulate: null, zoom: false },
  { alt: false, flop: true, modulate: "100,106,94", zoom: false },
  { alt: true, flop: true, modulate: "100,102,108", zoom: false },
  { alt: false, flop: false, modulate: "103,112,112", zoom: true },
];

const withoutAlt: Recipe[] = [
  { alt: false, flop: false, modulate: null, zoom: false },
  { alt: false, flop: true, modulate: null, zoom: false },
  { alt: false, flop: false, modulate: "100,108,88", zoom: false },
  { alt: false, flop: true, modulate: "100,104,114", zoom: false },
  { alt: false, flop: false, modulate: "104,112,100", zoom: true },
];

const counters = new Map<string, number>();

for (const course of courses) {
  const out = path.join(OUT_DIR, `${course.slug}.jpg`);

  // Bespoke per-course artwork wins; just normalize it.
  const bespoke = path.join(ART_DIR, `${course.slug}.jpg`);
  if (existsSync(bespoke)) {
    execFileSync("convert", [
      bespoke,
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
    console.log(`✓ ${course.slug} ← course-art (bespoke)`);
    continue;
  }

  const idx = counters.get(course.category) ?? 0;
  counters.set(course.category, idx + 1);

  const altBase = path.join(CAT_DIR, `${course.category}-b.jpg`);
  const hasAlt = existsSync(altBase);
  const recipes = hasAlt ? withAlt : withoutAlt;
  const recipe = recipes[idx % recipes.length]!;

  const source = recipe.alt && hasAlt ? altBase : path.join(CAT_DIR, `${course.category}.jpg`);

  const args: string[] = [source];
  if (recipe.zoom) {
    // zoom into a slightly off-centre 82% region for a different composition
    args.push("-gravity", "east", "-crop", "82%x82%+0+0", "+repage");
  }
  if (recipe.flop) args.push("-flop");
  if (recipe.modulate) args.push("-modulate", recipe.modulate);
  args.push(
    "-resize",
    "1280x720^",
    "-gravity",
    "center",
    "-extent",
    "1280x720",
    "-quality",
    "82",
    out,
  );

  execFileSync("convert", args);
  console.log(
    `✓ ${course.slug} ← ${path.basename(source)}${recipe.flop ? " flop" : ""}${recipe.modulate ? ` hue(${recipe.modulate})` : ""}${recipe.zoom ? " zoom" : ""}`,
  );
}

console.log(`\nGenerated ${courses.length} unique course covers in public/images/courses/`);
