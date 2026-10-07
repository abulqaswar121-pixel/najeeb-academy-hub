import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  FileCheck,
  Hammer,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import { ComparisonStrip } from "../components/academy/ComparisonStrip";
import { SectionHeading } from "../components/academy/SectionHeading";
import { Button } from "../components/ui/button";
import { seo } from "../lib/academy";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Najeeb Academy",
      description:
        "Najeeb Academy is the learning arm of Najeeb Digital Hub — short, practical AI courses taught from real agency work, ending in assessments, projects and signed certificates.",
      path: "/about",
    }),
  component: AboutPage,
});

const method = [
  {
    icon: BookOpen,
    step: "01 · Learn",
    text: "Courses are short on purpose — 3 to 8 hours of focused, tool-first lessons. Each lesson teaches one skill and ends with an exercise you complete immediately.",
  },
  {
    icon: FileCheck,
    step: "02 · Assess",
    text: "The final assessment tests judgement — the decisions a practitioner makes — not memorised definitions. 70% passes, and retakes are unlimited.",
  },
  {
    icon: Hammer,
    step: "03 · Build",
    text: "Every course defines a capstone project with real deliverables. By graduation you have work you can show, not just a watch history.",
  },
  {
    icon: Award,
    step: "04 · Certify",
    text: "Pass and you receive a signed certificate with a unique code. Anyone — employer, client, school — can verify it publicly in seconds.",
  },
];

function AboutPage() {
  return (
    <div className="relative">
      <div
        className="bg-grid-pattern absolute inset-x-0 top-0 h-96 opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* Mission */}
        <section className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="bg-brand-subtle border-primary/30 text-brand-soft inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" /> Our mission
          </div>
          <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl">
            Practical AI skills, <span className="text-gradient-brand">provable results.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            Most online courses optimise for hours watched. We optimise for what you can do
            afterwards. Najeeb Academy exists to help African professionals, freelancers and
            founders learn the AI skills the market pays for — fast, hands-on, and with proof at the
            end.
          </p>
        </section>

        {/* Values */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Practical over theoretical",
              text: "Every course is built around real tools and real deliverables. If a lesson doesn't change what you can do, it doesn't make the cut.",
            },
            {
              icon: Users,
              title: "Built for our market",
              text: "Priced in Naira, designed for self-paced learning on real-world connections, with examples drawn from businesses like yours.",
            },
            {
              icon: ShieldCheck,
              title: "Proof you can share",
              text: "Certificates are signed and verifiable by code — so the credential actually means something to the person checking it.",
            },
          ].map((v) => (
            <div key={v.title} className="bg-card border-border rounded-2xl border p-6 shadow-xl">
              <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-11 w-11 items-center justify-center rounded-xl border">
                <v.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-foreground mt-4 text-base font-bold">{v.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{v.text}</p>
            </div>
          ))}
        </section>

        {/* Problem vs solution */}
        <section className="space-y-10">
          <SectionHeading
            eyebrow="Why the academy exists"
            title="Watching isn't doing — and the market knows it"
            description="The internet is full of courses. It's proof that's scarce. Here's the difference in one glance."
          />
          <ComparisonStrip />
        </section>

        {/* How learning works */}
        <section className="space-y-10">
          <SectionHeading
            eyebrow="How learning works"
            title={
              <>
                Learn → Assess → Build → <span className="text-gradient-brand">Certify</span>
              </>
            }
            description="Four steps, every course, no exceptions. It's the structure that turns 'I took a course' into 'here's what I built'."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {method.map((m) => (
              <div
                key={m.step}
                className="bg-card border-border flex gap-5 rounded-2xl border p-6 shadow-xl"
              >
                <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
                  <m.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-brand-soft font-mono text-xs font-bold tracking-wider uppercase">
                    {m.step}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-6 text-center">
          <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            Ready to start?
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-gradient-cta shadow-glow-primary rounded-2xl px-10 font-extrabold transition-transform hover:scale-105"
          >
            <Link to="/courses">
              Browse the catalog <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
