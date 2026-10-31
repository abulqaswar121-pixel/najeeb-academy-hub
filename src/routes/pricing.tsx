import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Check,
  CreditCard,
  Minus,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";

import { PassPlans } from "../components/academy/PassPlans";
import { SectionHeading } from "../components/academy/SectionHeading";
import { Button } from "../components/ui/button";
import { PASS_TIERS } from "../data/passes";
import { seo } from "../lib/academy";
import { formatPrice, useCurrency } from "../lib/currency";
import { passName } from "../lib/passes-ui";
import { fetchCourses } from "../lib/server-fns";

const coursesQuery = { queryKey: ["courses"], queryFn: () => fetchCourses() };

export const Route = createFileRoute("/pricing")({
  head: () =>
    seo({
      title: "Passes & Pricing — Starter ₦3,000 to All-Access ₦25,000",
      description:
        "One pass, any courses. Starter Pass ₦3,000 (3 Courses), Skill Pack ₦6,500 (8 Courses), Pro Track ₦12,000 (18 Courses) or All-Access ₦25,000 for every course plus future releases. Certificates included.",
      path: "/pricing",
    }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(coursesQuery);
  },
  component: PricingPage,
});

const steps = [
  {
    icon: Ticket,
    title: "Pick your pass",
    text: "Starter, Skill Pack, Pro Track or All-Access — a one-time payment, no subscription.",
  },
  {
    icon: CreditCard,
    title: "Credits land in your wallet",
    text: "Your dashboard shows the credits you own. Spend them on any course in the catalog.",
  },
  {
    icon: Award,
    title: "Learn, build, get certified",
    text: "Finish the lessons, pass the 70% assessment and ship a project — certificate issued instantly.",
  },
];

type Row = { label: string; values: (string | boolean)[] };

const COMPARISON: Row[] = [
  { label: "Course credits", values: ["3 courses", "8 courses", "18 courses", "Unlimited"] },
  { label: "All lessons, notes & exercises", values: [true, true, true, true] },
  { label: "Final assessment + retakes", values: [true, true, true, true] },
  { label: "Capstone project review", values: [true, true, true, true] },
  { label: "Signed, verifiable certificate", values: [true, true, true, true] },
  { label: "Lifetime access & updates", values: [true, true, true, true] },
  { label: "Priority mentor feedback", values: [false, false, true, true] },
  { label: "Future course releases", values: [false, false, false, true] },
  { label: "All-Access VIP badge", values: [false, false, false, true] },
];

function PricingPage() {
  const { data: courses = [] } = useQuery(coursesQuery);
  const { currency } = useCurrency();
  const courseCount = courses.length || 60;

  return (
    <div>
      {/* ───────── Hero ───────── */}
      <section className="band-dark relative overflow-hidden py-16 sm:py-20">
        <div className="bg-grid-pattern absolute inset-0 opacity-50" aria-hidden="true" />
        <div
          className="hero-glow top-0 left-1/2 h-[320px] w-[680px] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="bg-brand-subtle border-primary/30 text-brand-soft inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Passes, not per-course prices
          </div>
          <h1 className="text-foreground mx-auto mt-5 max-w-4xl text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl">
            One pass. <span className="text-gradient-brand">Any courses you choose.</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
            Every course in the catalog — {courseCount} and counting — is covered by a single pass.
            Buy once, spend your credits on the skills you actually need. Certificates included.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {PASS_TIERS.map((tier) => (
              <span
                key={tier.id}
                className="bg-card/80 text-foreground border-border rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur"
              >
                {passName(tier.id)} · {formatPrice(tier.priceNgn, currency)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── The four passes ───────── */}
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The four passes"
          title="Choose your credit budget"
          description="Not sure which to pick? Most learners start with the Starter Pass and top up later — credits never expire."
        />
        <PassPlans />
      </section>

      {/* ───────── Comparison ───────── */}
      <section className="bg-surface border-border border-y py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Compare"
            title="What every pass includes"
            description="Every tier gets the full academy experience — the difference is how many courses you unlock at once."
          />
          <div className="bg-card border-border overflow-hidden rounded-3xl border shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <caption className="sr-only">Pass comparison</caption>
                <thead>
                  <tr className="border-border bg-brand-subtle/50 border-b">
                    <th scope="col" className="text-muted-foreground px-5 py-4 text-xs font-bold">
                      Features
                    </th>
                    {PASS_TIERS.map((tier) => (
                      <th
                        key={tier.id}
                        scope="col"
                        className="text-foreground px-4 py-4 text-center"
                      >
                        <span className="block text-sm font-black">{passName(tier.id)}</span>
                        <span className="text-brand-soft mt-0.5 block font-mono text-[11px] font-bold">
                          {formatPrice(tier.priceNgn, currency)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.label} className="border-border/70 border-b last:border-0">
                      <th
                        scope="row"
                        className="text-muted-foreground px-5 py-3.5 text-left text-xs font-semibold"
                      >
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td key={i} className="px-4 py-3.5 text-center">
                          {typeof value === "string" ? (
                            <span className="text-foreground font-mono text-xs font-bold">
                              {value}
                            </span>
                          ) : value ? (
                            <Check className="text-success mx-auto h-4 w-4" aria-label="Included" />
                          ) : (
                            <Minus
                              className="text-muted-foreground/40 mx-auto h-4 w-4"
                              aria-label="Not included"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-border bg-background/50 border-t px-5 py-4 text-center">
              <p className="text-muted-foreground text-xs">
                Prices are in Nigerian Naira (₦). Nothing renews automatically — you only pay when
                you buy a pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── How credits work ───────── */}
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps from pass to certificate"
          description="No subscriptions, no surprise charges, no per-course price tags to compare. Just credits and courses."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-card border-border rounded-2xl border p-6 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-brand-subtle border-primary/25 text-brand-soft flex h-10 w-10 items-center justify-center rounded-xl border">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                  Step 0{i + 1}
                </span>
              </div>
              <h3 className="text-foreground mt-4 text-base font-black tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Closing CTA ───────── */}
      <section className="band-dark relative overflow-hidden py-14">
        <div
          className="hero-glow -top-24 left-1/2 h-[280px] w-[620px] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-4 text-center sm:px-6">
          <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            Still deciding? Browse first.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            The catalog is free to explore — every curriculum, project brief and lesson outline is
            public. Buy a pass only when a course is right for you.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-gradient-cta shadow-glow-primary w-full rounded-2xl px-8 font-extrabold sm:w-auto"
            >
              <Link to="/courses">
                Browse the catalog <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-2xl px-8 font-bold sm:w-auto"
            >
              <Link to="/faq">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Read the FAQ
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
