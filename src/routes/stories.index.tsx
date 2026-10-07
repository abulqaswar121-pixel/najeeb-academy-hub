import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";

import { courses as catalog } from "../data/courses";
import { seo } from "../lib/academy";
import { stories } from "../lib/stories";

export const Route = createFileRoute("/stories/")({
  head: () =>
    seo({
      title: "Graduate stories",
      description:
        "Real outcomes from Najeeb Academy graduates — the course they took, the project they shipped and the certificate they earned.",
      path: "/stories",
    }),
  component: StoriesPage,
});

const courseTitle = (slug: string | null) =>
  slug ? (catalog.find((course) => course.slug === slug)?.title ?? null) : null;

function StoriesPage() {
  return (
    <div className="relative">
      <div
        className="bg-grid-pattern absolute inset-x-0 top-0 h-80 opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl space-y-5 text-center">
          <p className="bg-brand-subtle border-primary/30 text-brand-soft inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <Quote className="h-3.5 w-3.5" aria-hidden="true" /> Graduate stories
          </p>
          <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl">
            Real people. <span className="text-gradient-brand">Real proof.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            Every story below follows the same arc — a skill chosen, a project shipped, a signed
            certificate anyone can verify.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => {
            const title = courseTitle(story.courseSlug);
            return (
              <Link
                key={story.slug}
                to="/stories/$slug"
                params={{ slug: story.slug }}
                className="group bg-card border-border hover:border-primary/50 flex flex-col rounded-2xl border p-6 shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Quote className="text-brand-soft h-5 w-5" aria-hidden="true" />
                <blockquote className="text-muted-foreground mt-3 line-clamp-4 flex-1 text-sm leading-relaxed">
                  "{story.quote}"
                </blockquote>
                <div className="border-border/60 mt-5 border-t pt-4">
                  <p className="text-foreground text-sm font-bold">{story.name}</p>
                  <p className="text-muted-foreground text-xs">{story.role}</p>
                  {title && (
                    <p className="text-brand-soft mt-1 font-mono text-[10px] tracking-wide uppercase">
                      {title}
                    </p>
                  )}
                </div>
                <span className="text-brand-soft mt-4 inline-flex items-center gap-2 text-xs font-bold">
                  Read the full story
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
