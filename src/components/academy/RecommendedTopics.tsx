import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, BookOpen, Clock, Compass, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { categories } from "../../data/categories";
import { courses as catalog, type CourseLevel, type CourseSeed } from "../../data/courses";
import { formatPrice, useCurrency } from "../../lib/currency";
import { Button } from "../ui/button";
import { CategoryIcon } from "./CategoryIcon";

/**
 * Recommended Topics — a guided pick for students who don't know what to
 * learn. Choose a goal track and your starting level and the academy
 * recommends exactly ONE course. Every level maps to a different course
 * (a real ladder through the track); where a track has no verbatim course
 * for a level, the closest unused course is recommended and clearly labelled.
 */

const ORDER: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

const LEVEL_LABELS: Record<CourseLevel, string> = {
  Beginner: "Complete beginner",
  Intermediate: "Some experience",
  Advanced: "Ready to go deep",
};

interface Pick {
  course: CourseSeed;
  exact: boolean;
}

const levelDistance = (wanted: CourseLevel, candidate: CourseLevel) =>
  Math.abs(ORDER.indexOf(wanted) - ORDER.indexOf(candidate));

const bestOf = (pool: CourseSeed[]) =>
  [...pool].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))[0];

function buildLadder(track: string): Partial<Record<CourseLevel, Pick>> {
  const pool = catalog.filter((c) => c.category === track);
  const used = new Set<string>();
  const ladder: Partial<Record<CourseLevel, Pick>> = {};

  // Pass 1 — exact level matches (each course belongs to exactly one level).
  for (const level of ORDER) {
    const candidates = pool.filter((c) => c.level === level && !used.has(c.slug));
    const pick = bestOf(candidates);
    if (pick) {
      ladder[level] = { course: pick, exact: true };
      used.add(pick.slug);
    }
  }

  // Pass 2 — closest-fit fallback for missing levels, never reusing a course.
  for (const level of ORDER) {
    if (ladder[level]) continue;
    const candidates = pool
      .filter((c) => !used.has(c.slug))
      .sort(
        (a, b) =>
          levelDistance(level, a.level) - levelDistance(level, b.level) ||
          Number(b.featured ?? false) - Number(a.featured ?? false),
      );
    const pick = candidates[0];
    if (pick) {
      ladder[level] = { course: pick, exact: false };
      used.add(pick.slug);
    }
  }

  return ladder;
}

export function RecommendedTopics() {
  const { currency } = useCurrency();
  const [track, setTrack] = useState<string>("business-operations");
  const [level, setLevel] = useState<CourseLevel>("Beginner");

  const ladder = useMemo(() => buildLadder(track), [track]);
  const pick = ladder[level];
  const trackInfo = categories.find((cat) => cat.slug === track);

  const nextLevel = ORDER[ORDER.indexOf(level) + 1];
  const nextPick = nextLevel ? ladder[nextLevel] : undefined;

  return (
    <div className="bg-card border-border overflow-hidden rounded-3xl border shadow-2xl">
      <div className="bg-gradient-cta p-[1.5px]">
        <div className="bg-card grid grid-cols-1 rounded-t-[calc(1.5rem-1px)] lg:grid-cols-5">
          {/* Selectors */}
          <div className="space-y-8 p-8 sm:p-10 lg:col-span-3">
            <div>
              <p className="text-brand-soft flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <span className="bg-brand-subtle border-primary/30 flex h-5 w-5 items-center justify-center rounded font-mono text-[10px]">
                  1
                </span>
                What do you want to achieve?
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setTrack(cat.slug)}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                      track === cat.slug
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                    aria-pressed={track === cat.slug}
                  >
                    <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-brand-soft flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <span className="bg-brand-subtle border-primary/30 flex h-5 w-5 items-center justify-center rounded font-mono text-[10px]">
                  2
                </span>
                Where are you starting from?
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ORDER.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLevel(option)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                      level === option
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                    aria-pressed={level === option}
                  >
                    {LEVEL_LABELS[option]}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-muted-foreground flex items-start gap-2 pt-1 text-xs leading-relaxed">
              <Compass className="text-brand-soft mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Every level gets its own deliberate pick — change the level and the recommendation
              changes with you, never repeating the same course.
            </p>
          </div>

          {/* Recommendation */}
          <div className="band-dark flex flex-col gap-5 p-8 sm:p-10 lg:col-span-2 lg:rounded-r-[calc(1.5rem-1px)]">
            <p className="text-brand-soft flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Recommended for you
            </p>

            {pick ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-brand-subtle border-primary/30 text-brand-soft rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                    {trackInfo?.name}
                  </span>
                  <span className="bg-card border-border text-muted-foreground rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                    {pick.course.level}
                  </span>
                </div>

                <div>
                  <h3 className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
                    {pick.course.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
                    {pick.course.summary}
                  </p>
                </div>

                {!pick.exact && (
                  <p className="bg-card border-border text-muted-foreground rounded-xl border px-4 py-2.5 text-xs leading-relaxed">
                    This track has no true {level.toLowerCase()} course yet — so we recommend the
                    closest fit, at {pick.course.level.toLowerCase()} level.
                  </p>
                )}

                <ul className="text-muted-foreground grid grid-cols-3 gap-3 text-xs">
                  <li className="bg-card border-border flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3">
                    <BookOpen className="text-brand-soft h-4 w-4" aria-hidden="true" />
                    <span className="text-foreground font-bold">
                      {pick.course.lessons.length} lessons
                    </span>
                  </li>
                  <li className="bg-card border-border flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3">
                    <Clock className="text-brand-soft h-4 w-4" aria-hidden="true" />
                    <span className="text-foreground font-bold">
                      ~{pick.course.durationHours} hours
                    </span>
                  </li>
                  <li className="bg-card border-border flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3">
                    <Award className="text-brand-soft h-4 w-4" aria-hidden="true" />
                    <span className="text-foreground font-bold">Certificate</span>
                  </li>
                </ul>

                <div className="border-border flex items-center justify-between gap-4 border-t pt-5">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                      One-time fee
                    </p>
                    <p className="text-foreground mt-0.5 font-mono text-2xl font-black">
                      {formatPrice(pick.course.priceNgn, currency)}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-gradient-cta shadow-glow-primary rounded-xl font-extrabold"
                  >
                    <Link to="/courses/$slug" params={{ slug: pick.course.slug }}>
                      Start here <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                {nextPick && nextPick.course.slug !== pick.course.slug && (
                  <button
                    type="button"
                    onClick={() => setLevel(nextLevel!)}
                    className="text-muted-foreground hover:text-brand-soft -mt-1 text-left text-xs transition-colors"
                  >
                    Next step after this —{" "}
                    <span className="font-bold underline underline-offset-2">
                      {nextPick.course.title}
                    </span>{" "}
                    ({nextLevel!.toLowerCase()})
                  </button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No courses in this track yet — browse the full catalog instead.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
