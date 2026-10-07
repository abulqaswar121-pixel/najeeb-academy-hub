import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Hammer,
  Quote,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { seo, formatNaira } from "../lib/academy";
import { courseForStory, stories, storyBySlug } from "../lib/stories";

export const Route = createFileRoute("/stories/$slug")({
  loader: ({ params }) => {
    const story = storyBySlug(params.slug);
    if (!story) throw notFound();
    return { story };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: `${loaderData.story.name} — graduate story`,
          description: loaderData.story.quote.slice(0, 150),
          path: `/stories/${loaderData.story.slug}`,
        })
      : {},
  component: StoryPage,
});

function StoryPage() {
  const { story } = Route.useLoaderData();
  const course = courseForStory(story);
  const firstName = story.name.split(" ")[0]!;
  const others = stories.filter((entry) => entry.slug !== story.slug).slice(0, 3);

  return (
    <div className="relative">
      <div
        className="bg-grid-pattern absolute inset-x-0 top-0 h-80 opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          to="/stories"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All graduate stories
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main dossier */}
          <article className="space-y-10 lg:col-span-2">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-brand-subtle border-primary/30 text-brand-soft rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                  Graduate story
                </span>
                {course && (
                  <Link
                    to="/courses/$slug"
                    params={{ slug: course.slug }}
                    className="bg-card border-border text-muted-foreground hover:text-foreground rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors"
                  >
                    {course.title}
                  </Link>
                )}
              </div>
              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                How {firstName} turned one course into{" "}
                <span className="text-gradient-brand">provable skill</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {story.name} · {story.role}
              </p>
            </header>

            <section className="space-y-3">
              <p className="text-brand-soft font-mono text-xs font-bold tracking-wider">
                01 · The challenge
              </p>
              <h2 className="text-foreground text-xl font-black">
                The gap between watching and doing
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                Like most working professionals, {firstName} didn't need more passive video hours —
                the market pays for what you can do, not what you've watched. The need was a
                practical skill that could be applied immediately{" "}
                {course
                  ? `in ${course.title.toLowerCase().includes("ai") ? "an AI workflow" : "real work"}`
                  : "in real work"}
                , with proof an employer or client could check.
              </p>
            </section>

            {course && (
              <section className="space-y-3">
                <p className="text-brand-soft font-mono text-xs font-bold tracking-wider">
                  02 · The academy approach
                </p>
                <h2 className="text-foreground text-xl font-black">{course.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  {course.summary}
                </p>
                <ul className="text-muted-foreground grid gap-2.5 text-sm sm:grid-cols-2">
                  <li className="bg-card border-border flex items-center gap-2.5 rounded-xl border px-4 py-3">
                    <BookOpen className="text-brand-soft h-4 w-4 shrink-0" aria-hidden="true" />
                    {course.lessons.length} guided lessons
                  </li>
                  <li className="bg-card border-border flex items-center gap-2.5 rounded-xl border px-4 py-3">
                    <Clock className="text-brand-soft h-4 w-4 shrink-0" aria-hidden="true" />~
                    {course.durationHours} hours, self-paced
                  </li>
                  <li className="bg-card border-border flex items-center gap-2.5 rounded-xl border px-4 py-3">
                    <Hammer className="text-brand-soft h-4 w-4 shrink-0" aria-hidden="true" />
                    Capstone project reviewed against a real brief
                  </li>
                  <li className="bg-card border-border flex items-center gap-2.5 rounded-xl border px-4 py-3">
                    <Award className="text-brand-soft h-4 w-4 shrink-0" aria-hidden="true" />
                    Final assessment — 70% pass bar, free retakes
                  </li>
                </ul>
              </section>
            )}

            <section className="space-y-4">
              <p className="text-brand-soft font-mono text-xs font-bold tracking-wider">
                03 · The outcome, in {firstName}'s words
              </p>
              <figure className="bg-brand-subtle/40 border-border rounded-3xl border p-8">
                <Quote className="text-brand-soft h-6 w-6" aria-hidden="true" />
                <blockquote className="text-foreground mt-4 text-lg leading-relaxed font-medium">
                  "{story.quote}"
                </blockquote>
                <figcaption className="mt-5">
                  <p className="text-foreground text-sm font-bold">{story.name}</p>
                  <p className="text-muted-foreground text-xs">{story.role}</p>
                </figcaption>
              </figure>
            </section>
          </article>

          {/* Metadata sidebar */}
          <aside className="space-y-6">
            <div className="band-dark sticky top-24 space-y-5 rounded-3xl p-7">
              <p className="text-brand-soft text-[11px] font-bold tracking-wider uppercase">
                Story metadata
              </p>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                    Graduate
                  </dt>
                  <dd className="text-foreground mt-1 font-bold">{story.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                    Role
                  </dt>
                  <dd className="text-foreground mt-1 font-bold">{story.role}</dd>
                </div>
                {course && (
                  <>
                    <div>
                      <dt className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                        Course taken
                      </dt>
                      <dd className="text-foreground mt-1 font-bold">{course.title}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                        Tuition (one-time)
                      </dt>
                      <dd className="text-foreground mt-1 font-mono font-bold">
                        {formatNaira(course.priceNgn)}
                      </dd>
                    </div>
                  </>
                )}
                <div>
                  <dt className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                    Credential
                  </dt>
                  <dd className="text-foreground mt-1 font-bold">
                    Signed certificate, publicly verifiable
                  </dd>
                </div>
              </dl>
              {course && (
                <Button
                  asChild
                  className="bg-gradient-cta shadow-glow-primary w-full rounded-xl font-extrabold"
                >
                  <Link to="/courses/$slug" params={{ slug: course.slug }}>
                    Take the same course <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="w-full rounded-xl font-bold">
                <Link to="/courses">Browse all courses</Link>
              </Button>
            </div>
          </aside>
        </div>

        {/* More stories */}
        <section className="border-border/60 mt-16 border-t pt-10">
          <h2 className="text-foreground text-xl font-black">More graduate stories</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {others.map((entry) => (
              <Link
                key={entry.slug}
                to="/stories/$slug"
                params={{ slug: entry.slug }}
                className="group bg-card border-border hover:border-primary/50 rounded-2xl border p-5 shadow-lg transition-all hover:-translate-y-0.5"
              >
                <GraduationCap className="text-brand-soft h-4 w-4" aria-hidden="true" />
                <p className="text-muted-foreground mt-3 line-clamp-3 text-xs leading-relaxed">
                  "{entry.quote}"
                </p>
                <p className="text-foreground mt-3 text-sm font-bold">{entry.name}</p>
                <p className="text-muted-foreground text-xs">{entry.role}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
