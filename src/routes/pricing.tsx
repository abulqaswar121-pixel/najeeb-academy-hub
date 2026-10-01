import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  FileCheck,
  Hammer,
  Infinity as InfinityIcon,
  ShieldCheck,
} from "lucide-react";

import { SectionHeading } from "../components/academy/SectionHeading";
import { Button } from "../components/ui/button";
import { categories } from "../data/categories";
import { formatNaira, seo } from "../lib/academy";
import { fetchCourses } from "../lib/server-fns";

const coursesQuery = { queryKey: ["courses"], queryFn: () => fetchCourses() };

export const Route = createFileRoute("/pricing")({
  head: () =>
    seo({
      title: "Pricing — Simple Per-Course Fees in ₦ NGN",
      description:
        "One transparent price per course in Nigerian Naira. Every course includes all lessons, the final assessment, project review and a signed, verifiable certificate.",
      path: "/pricing",
    }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(coursesQuery);
  },
  component: PricingPage,
});

const included = [
  {
    icon: BookOpen,
    title: "All lessons & exercises",
    text: "Every lesson in the course, with hands-on exercises and model answers.",
  },
  {
    icon: FileCheck,
    title: "Final assessment",
    text: "A practical assessment with a 70% pass mark and unlimited retakes.",
  },
  {
    icon: Hammer,
    title: "Capstone project",
    text: "A real portfolio project with clear requirements — the proof that you can do the work.",
  },
  {
    icon: Award,
    title: "Signed certificate",
    text: "A signed Najeeb Academy certificate with a unique, publicly verifiable code.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime access",
    text: "Pay once. Keep the course, every exercise and all future updates forever.",
  },
  {
    icon: ShieldCheck,
    title: "Secure NGN payments",
    text: "Priced in Naira for African learners. No subscriptions, no hidden fees.",
  },
];

function PricingPage() {
  const { data: courses = [] } = useQuery(coursesQuery);
  const prices = courses.map((c) => c.priceNgn);
  const minPrice = prices.length ? Math.min(...prices) : 12500;
  const maxPrice = prices.length ? Math.max(...prices) : 26000;

  return (
    <div className="relative">
      <div
        className="bg-grid-pattern absolute inset-x-0 top-0 h-96 opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              One course. One price.{" "}
              <span className="text-gradient-brand">Everything included.</span>
            </>
          }
          description={`No subscriptions and no upsells. Each course is a one-time fee between ${formatNaira(minPrice)} and ${formatNaira(maxPrice)}, set by its depth and length — and every course includes the same complete package.`}
        />

        {/* Price band card */}
        <div className="bg-card border-border mx-auto max-w-4xl overflow-hidden rounded-3xl border shadow-2xl">
          <div className="bg-gradient-cta p-[1px]">
            <div className="bg-card grid grid-cols-1 gap-0 rounded-t-3xl sm:grid-cols-3">
              {[
                {
                  label: "Core essentials",
                  range: `from ${formatNaira(minPrice)}`,
                  sub: "Beginner foundations",
                },
                {
                  label: "Practitioner & agency",
                  range: `${formatNaira(25000)}–${formatNaira(35000)}`,
                  sub: "Hands-on professional tracks",
                  highlight: true,
                },
                {
                  label: "AI engineering flagship",
                  range: `up to ${formatNaira(maxPrice)}`,
                  sub: "Build & ship real products",
                },
              ].map((tier) => (
                <div
                  key={tier.label}
                  className={`p-8 text-center ${tier.highlight ? "bg-brand-subtle/50" : ""}`}
                >
                  <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    {tier.label}
                  </p>
                  <p className="text-foreground mt-3 font-mono text-2xl font-black">{tier.range}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{tier.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-border border-t p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {included.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-bold">{item.title}</h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-track price list */}
        <section className="space-y-8">
          <SectionHeading
            title="Browse prices by track"
            description="Exact prices are shown on every course card and course page — browse the catalog free, pay only when you enroll."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const tracked = courses.filter((c) => c.category === cat.slug);
              if (tracked.length === 0) return null;
              const lo = Math.min(...tracked.map((c) => c.priceNgn));
              const hi = Math.max(...tracked.map((c) => c.priceNgn));
              return (
                <Link
                  key={cat.slug}
                  to="/courses"
                  search={{ category: cat.slug }}
                  className="group bg-card border-border hover:border-primary/50 flex items-center justify-between gap-4 rounded-2xl border p-5 shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <h3 className="text-foreground group-hover:text-brand-soft truncate text-sm font-bold transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">{tracked.length} courses</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-brand-soft font-mono text-sm font-black">
                      {lo === hi ? formatNaira(lo) : `${formatNaira(lo)}+`}
                    </p>
                    <BadgeCheck
                      className="text-success mt-1 ml-auto h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-cta shadow-glow-primary rounded-2xl px-10 font-extrabold transition-transform hover:scale-105"
          >
            <Link to="/courses">
              Find your course <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
