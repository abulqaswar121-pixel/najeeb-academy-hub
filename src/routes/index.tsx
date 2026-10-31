import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  FileCheck,
  Hammer,
  Infinity as InfinityIcon,
  Quote,
  Sparkles,
  Ticket,
} from "lucide-react";

import { CategoryIcon } from "../components/academy/CategoryIcon";
import { RecommendedTopics } from "../components/academy/RecommendedTopics";
import { SectionHeading } from "../components/academy/SectionHeading";
import { Button } from "../components/ui/button";
import { categories } from "../data/categories";
import { PASS_TIERS } from "../data/passes";
import { seo } from "../lib/academy";
import { formatPrice, useCurrency } from "../lib/currency";
import { passName } from "../lib/passes-ui";
import { fetchCourses, fetchTestimonials } from "../lib/server-fns";

const coursesQuery = { queryKey: ["courses"], queryFn: () => fetchCourses() };
const testimonialsQuery = { queryKey: ["testimonials"], queryFn: () => fetchTestimonials() };

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Learn a practical AI skill, then prove it",
      description:
        "60+ short, project-based AI courses in prompt engineering, content, automation, no-code apps and more — each ending with an assessment, a project and a signed, verifiable certificate.",
      path: "/",
    }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(coursesQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
    ]);
  },
  component: HomePage,
});

const steps = [
  {
    icon: BookOpen,
    title: "Learn",
    text: "Short lessons with real tools.",
  },
  {
    icon: FileCheck,
    title: "Assess",
    text: "70% pass mark, retake anytime.",
  },
  {
    icon: Hammer,
    title: "Build",
    text: "Ship a real portfolio project.",
  },
  {
    icon: Award,
    title: "Certify",
    text: "Signed, verifiable certificate.",
  },
];

function HomePage() {
  const { data: courses = [] } = useQuery(coursesQuery);
  const { data: testimonials = [] } = useQuery(testimonialsQuery);
  const { currency } = useCurrency();

  return (
    <div>
      {/* ───────── Hero — the deep navy gateway band ───────── */}
      <section className="band-dark relative overflow-hidden pt-16 pb-20">
        <div className="bg-grid-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div
          className="hero-glow top-0 left-1/2 h-[350px] w-[700px] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <div className="bg-brand-subtle border-primary/30 text-brand-soft animate-rise-in inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              The AI skills academy of Najeeb Digital Hub
            </div>
            <h1 className="text-foreground text-4xl leading-[1.08] font-black tracking-tight sm:text-6xl lg:text-7xl">
              Learn a practical AI skill,{" "}
              <span className="text-gradient-brand">then prove it.</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed sm:text-xl">
              Short, self-paced courses across {categories.length} AI tracks. Every course ends with
              a final assessment, a real portfolio project and a signed certificate anyone can
              verify.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-cta shadow-glow-primary w-full rounded-2xl px-8 font-extrabold transition-transform hover:scale-105 sm:w-auto"
              >
                <Link to="/courses">
                  Browse all {courses.length || 60} courses
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-2xl px-8 font-bold sm:w-auto"
              >
                <Link to="/about">How the academy works</Link>
              </Button>
            </div>
          </div>

          {/* Learn → Assess → Build → Certify, compact */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="bg-card/90 border-border flex items-start gap-3 rounded-2xl border p-4 shadow-xl"
              >
                <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                  <step.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-foreground text-sm font-bold">
                    0{i + 1} · {step.title}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Passes — one payment, any courses ───────── */}
      <section className="mx-auto max-w-7xl space-y-8 px-4 pt-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Passes, not price tags"
          title="One pass. Any courses you choose."
          description="Every course is unlocked with a pass credit — no per-course prices to compare. Start with 3 courses or unlock the whole academy."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PASS_TIERS.map((tier) => (
            <Link
              key={tier.id}
              to="/pricing"
              className={`group bg-card flex flex-col rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${
                tier.highlight
                  ? "border-primary/50 shadow-xl"
                  : tier.id === "all"
                    ? "border-gold/40 shadow-lg"
                    : "border-border shadow-md"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-foreground text-sm font-black tracking-tight">
                  {passName(tier.id)}
                </h3>
                {tier.highlight && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                    Popular
                  </span>
                )}
                {tier.id === "all" && (
                  <span className="border-gold/40 bg-gold/10 text-gold rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                    Best value
                  </span>
                )}
              </div>
              <p className="text-foreground mt-2 font-mono text-2xl font-black tracking-tight">
                {formatPrice(tier.priceNgn, currency)}
              </p>
              <p className="text-brand-soft mt-1 flex items-center gap-1 text-xs font-bold">
                {tier.courses === null ? (
                  <InfinityIcon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {tier.courses === null ? "All 60+ courses" : `Any ${tier.courses} courses`}
              </p>
              <p className="text-muted-foreground mt-2 flex-1 text-[11px] leading-relaxed">
                {tier.blurb}
              </p>
              <span className="text-foreground mt-3 inline-flex items-center gap-1 text-[11px] font-bold group-hover:underline">
                Choose {passName(tier.id)}
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          {["One payment — no subscription", "Credits never expire", "Certificates included"].map(
            (item) => (
              <span
                key={item}
                className="text-muted-foreground inline-flex items-center gap-1.5 font-semibold"
              >
                <Check className="text-success h-3.5 w-3.5" aria-hidden="true" />
                {item}
              </span>
            ),
          )}
          <Link
            to="/pricing"
            className="text-brand-soft inline-flex items-center gap-1 font-bold hover:underline"
          >
            Compare all four passes <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ───────── Recommended topics — one deliberate pick per level ───────── */}
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Recommended topics"
          title="Not sure what to learn? Start here"
          description="Tell us the goal you're chasing and where you're starting from — we'll point you to the single right course. Every level gets its own deliberate pick, never the same course twice."
        />
        <RecommendedTopics />
      </section>

      {/* ───────── Category showcase — pure-white strip ───────── */}
      <section className="bg-surface border-border border-y py-14">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={`${categories.length} skill tracks`}
            title="Pick your track"
            description="From prompt engineering to AI agents — practical skills employers and clients pay for right now."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((cat) => {
              const count = courses.filter((c) => c.category === cat.slug).length;
              return (
                <Link
                  key={cat.slug}
                  to="/courses"
                  search={{ category: cat.slug }}
                  className="group bg-card border-border hover:border-primary/50 flex items-start gap-4 rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-110">
                    <CategoryIcon name={cat.icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground group-hover:text-brand-soft truncate text-sm font-bold transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                      {cat.blurb}
                    </p>
                    <span className="text-brand-soft mt-2 inline-block font-mono text-[10px] font-bold tracking-wider uppercase">
                      {count} course{count === 1 ? "" : "s"} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center">
            <Link
              to="/courses"
              className="text-brand-soft inline-flex items-center gap-2 text-sm font-bold hover:underline"
            >
              See all {categories.length} tracks{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Testimonials — pure-white strip ───────── */}
      <section className="bg-surface border-border border-y py-14">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Student stories"
            title="Real people, real proof"
            description="Graduates who took a course, shipped the project and put the certificate to work."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure
                key={t.id}
                className="bg-card border-border flex flex-col rounded-2xl border p-6 shadow-xl"
              >
                <Quote className="text-brand-soft h-5 w-5" aria-hidden="true" />
                <blockquote className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <figcaption className="border-border/60 mt-4 border-t pt-4">
                  <div className="text-foreground text-sm font-bold">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                  {t.courseTitle && (
                    <div className="text-brand-soft mt-1 font-mono text-[10px] tracking-wide uppercase">
                      {t.courseTitle}
                    </div>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/stories"
              className="text-brand-soft inline-flex items-center gap-2 text-sm font-bold transition-colors hover:underline"
            >
              Read all graduate stories <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Final CTA — navy anchor before the footer ───────── */}
      <section className="band-dark relative overflow-hidden py-14">
        <div
          className="hero-glow -top-24 left-1/2 h-[300px] w-[640px] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-4 text-center sm:px-6">
          <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-5xl">
            Your next skill is <span className="text-gradient-brand">one course away</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            Browse the full catalog free. Pick a pass when you're ready. Certificate when you've
            earned it.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-cta shadow-glow-primary rounded-2xl px-10 font-extrabold transition-transform hover:scale-105"
          >
            <Link to="/courses">
              Explore the catalog <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
