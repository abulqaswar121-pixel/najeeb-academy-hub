import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Lock, Trash2, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "../components/academy/EmptyState";
import { Button } from "../components/ui/button";
import { formatDate, seo } from "../lib/academy";
import {
  listOfflineCourses,
  removeOfflineCourse,
  type OfflineCourse,
} from "../lib/offline-courses";

export const Route = createFileRoute("/offline")({
  head: () => {
    const base = seo({
      title: "My offline courses",
      description:
        "Read the NDH Academy course notes you saved on this device — even with no internet connection.",
      path: "/offline",
    });
    return { ...base, meta: [...base.meta, { name: "robots", content: "noindex" }] };
  },
  component: OfflinePage,
});

function OfflinePage() {
  const [courses, setCourses] = useState<OfflineCourse[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);

  useEffect(() => {
    const load = () => setCourses(listOfflineCourses());
    load();
    window.addEventListener("ndh-offline-changed", load);
    return () => window.removeEventListener("ndh-offline-changed", load);
  }, []);

  const open = courses.find((c) => c.slug === openSlug) ?? null;

  if (open) {
    const lesson = open.lessons[lessonIndex];
    return (
      <div className="band-dark learning-room min-h-[70vh] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <button
            type="button"
            onClick={() => setOpenSlug(null)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All saved courses
          </button>
          <h1 className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
            {open.title}
          </h1>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {open.lessons.map((l, i) => (
              <button
                key={l.position}
                type="button"
                onClick={() => setLessonIndex(i)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
                  i === lessonIndex
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                Lesson {l.position}
              </button>
            ))}
          </div>
          {lesson && (
            <article className="border-border bg-card rounded-2xl border p-5 shadow-xl sm:p-7">
              <h2 className="text-foreground text-lg font-black">{lesson.title}</h2>
              {lesson.content ? (
                <div
                  className="lesson-prose mt-4 text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              ) : (
                <div className="border-border mt-4 rounded-2xl border border-dashed p-6 text-center">
                  <Lock className="text-muted-foreground mx-auto h-6 w-6" aria-hidden="true" />
                  <p className="text-foreground mt-2 text-sm font-bold">Notes not saved yet</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Watch this lesson's video online first, then save the course again.
                  </p>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <p className="text-brand-soft inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider uppercase">
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" /> Works without internet
        </p>
        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
          My offline courses
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Course notes you saved stay inside the app on this device. Videos need internet.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No saved courses yet"
          description="Open a course you're enrolled in and tap “Save for offline”."
          action={
            <Button asChild>
              <Link to="/dashboard">Go to my courses</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => {
            const ready = c.lessons.filter((l) => l.content).length;
            return (
              <li
                key={c.slug}
                className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4 shadow-md"
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenSlug(c.slug);
                    setLessonIndex(0);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="text-foreground block truncate text-sm font-bold">
                    {c.title}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {ready}/{c.lessons.length} lessons saved · {formatDate(c.savedAt)}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${c.title}`}
                  onClick={() => removeOfflineCourse(c.slug)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
