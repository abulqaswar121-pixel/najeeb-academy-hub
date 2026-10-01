import { Link, createFileRoute } from "@tanstack/react-router";
import { MessageCircleQuestion } from "lucide-react";

import { SectionHeading } from "../components/academy/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { seo } from "../lib/academy";

export const Route = createFileRoute("/faq")({
  head: () =>
    seo({
      title: "Frequently Asked Questions",
      description:
        "Answers about Najeeb Academy certificates, refunds, pacing, prerequisites, pricing and how courses work.",
      path: "/faq",
    }),
  component: FaqPage,
});

const faqs = [
  {
    group: "Certificates",
    items: [
      {
        q: "How do certificates work?",
        a: "Every course ends with a final assessment (70% pass mark, unlimited retakes) and a capstone project. When you pass, a signed Najeeb Academy certificate is issued instantly with a unique code like NDH-XXXX-XXXX. Anyone can verify it at academy.ndh.com.ng/verify — no account needed.",
      },
      {
        q: "Are the certificates recognised?",
        a: "Our certificates are proof-of-skill credentials, backed by public verification and — more importantly — by the capstone project you built to earn one. Employers and clients can check the code and see exactly what the course covered. We recommend linking your verification page from your CV and LinkedIn.",
      },
      {
        q: "Can I share my certificate on LinkedIn?",
        a: "Yes. Your dashboard gives you a one-click verification link for every certificate. Add it to your LinkedIn 'Licenses & certifications' section with the certificate code as the credential ID.",
      },
    ],
  },
  {
    group: "Payments & refunds",
    items: [
      {
        q: "How much do courses cost?",
        a: "Each course is a one-time fee in Nigerian Naira — currently between ₦15,000 and ₦50,000 depending on depth and tier. That includes the full course video, all guided lessons, the assessment, project review and your certificate. No subscriptions.",
      },
      {
        q: "What is your refund policy?",
        a: "If a course isn't what you expected, contact us within 7 days of enrollment and before completing more than 20% of the lessons, and we'll refund you in full. Refunds are returned to your original payment method within 5–10 business days.",
      },
      {
        q: "Do I keep access after finishing?",
        a: "Yes — enrollment is lifetime access. You keep the lessons, the exercises and every future update we make to the course, at no extra cost.",
      },
    ],
  },
  {
    group: "Pacing & format",
    items: [
      {
        q: "How long does a course take?",
        a: "Courses run 3–8 hours of guided work depending on the course — most students finish within a week at a casual pace, or in a weekend if they push. Everything is self-paced: there are no cohorts, deadlines or expiry dates.",
      },
      {
        q: "Are courses video-based?",
        a: "Courses are built as structured, hands-on lessons: step-by-step walkthroughs, worked examples and exercises you complete in the actual tools. This format is faster to learn from, easier to reference later, and friendlier to limited bandwidth.",
      },
      {
        q: "Can I learn on mobile?",
        a: "The academy works beautifully on mobile, and reading lessons on the go is a great way to keep momentum. For the hands-on exercises you'll get the most from a laptop or desktop, since you'll be working in real tools alongside the lessons.",
      },
    ],
  },
  {
    group: "Prerequisites",
    items: [
      {
        q: "Do I need technical experience?",
        a: "No. Beginner courses assume nothing beyond basic computer literacy and a browser. Intermediate and Advanced courses list their expectations on the course page — usually just comfort with the basics covered by earlier courses in the same track.",
      },
      {
        q: "Do I need paid AI tools?",
        a: "Almost every course can be completed on free tiers of the tools involved, and we flag clearly when a paid plan meaningfully improves the experience. You'll never discover a hidden mandatory cost mid-course.",
      },
      {
        q: "Which course should I start with?",
        a: "If you're brand new to AI, start with Prompt Engineering Fundamentals — every other track builds on prompting. Otherwise, pick the track closest to your work: the catalog's category filters will get you there in two clicks.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <div className="relative">
      <div
        className="bg-grid-pattern absolute inset-x-0 top-0 h-80 opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl space-y-12 px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Questions, <span className="text-gradient-brand">answered</span>
            </>
          }
          description="Everything students ask before enrolling. Still unsure about something? We reply fast."
        />

        <div className="space-y-10">
          {faqs.map((section) => (
            <section key={section.group}>
              <h2 className="text-brand-soft mb-3 font-mono text-xs font-bold tracking-wider uppercase">
                {section.group}
              </h2>
              <Accordion
                type="single"
                collapsible
                className="bg-card border-border rounded-2xl border px-5 shadow-xl"
              >
                {section.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger className="text-left text-sm font-bold">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        <div className="bg-brand-subtle/40 border-border flex flex-col items-center gap-4 rounded-3xl border p-8 text-center">
          <MessageCircleQuestion className="text-brand-soft h-8 w-8" aria-hidden="true" />
          <h2 className="text-foreground text-xl font-black">Still have a question?</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            Send us a message and a real human from the academy team will get back to you within one
            business day.
          </p>
          <Button asChild className="rounded-xl font-bold">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
