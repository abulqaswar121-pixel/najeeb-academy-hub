import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  FileCheck,
  GraduationCap,
  ListChecks,
  Lock,
  PartyPopper,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CertificateView } from "../components/academy/CertificateView";
import { EmptyState } from "../components/academy/EmptyState";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { seo } from "../lib/academy";
import { completeLessonFn, fetchLearn, submitAssessmentFn } from "../lib/server-fns";

const learnQuery = (slug: string) => ({
  queryKey: ["learn", slug],
  queryFn: () => fetchLearn({ data: { slug } }),
});

export const Route = createFileRoute("/learn/$slug")({
  head: ({ params }) =>
    seo({
      title: "Course Player",
      description:
        "Work through your Najeeb Academy course lessons, complete the final assessment and earn your certificate.",
      path: `/learn/${params.slug}`,
    }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(learnQuery(params.slug));
  },
  component: LearnPage,
});

type View = { kind: "lesson"; index: number } | { kind: "assessment" };

function LearnPage() {
  const { slug } = Route.useParams();
  const { data } = useQuery(learnQuery(slug));
  const queryClient = useQueryClient();
  const [view, setView] = useState<View | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ passed: boolean; correct: number; total: number } | null>(
    null,
  );

  const completedIds = useMemo(
    () => new Set(data?.status === "ok" ? data.completedLessonIds : []),
    [data],
  );

  // Pick the initial view: first incomplete lesson, or the assessment when all done.
  useEffect(() => {
    if (view !== null || !data || data.status !== "ok") return;
    const firstIncomplete = data.lessons.findIndex((l) => !completedIds.has(l.id));
    setView(
      firstIncomplete === -1 ? { kind: "assessment" } : { kind: "lesson", index: firstIncomplete },
    );
  }, [data, view, completedIds]);

  const completeLesson = useMutation({
    mutationFn: (lessonId: string) => completeLessonFn({ data: { lessonId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save progress."),
  });

  const submitAssessment = useMutation({
    mutationFn: (payload: number[]) =>
      submitAssessmentFn({ data: { courseSlug: slug, answers: payload } }),
    onSuccess: async (res) => {
      setResult({ passed: res.passed, correct: res.correct, total: res.total });
      if (res.passed) {
        toast.success("Assessment passed — certificate issued!");
        await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not submit the assessment."),
  });

  if (!data) return null;

  if (data.status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={Lock}
          title="Log in to access this course"
          description="This is the student course player. Log in to continue your lessons."
          action={
            <Button asChild>
              <Link to="/login" search={{ redirect: `/learn/${slug}` }}>
                Log in
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (data.status === "not-enrolled") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={GraduationCap}
          title="You're not enrolled in this course yet"
          description="Enroll from the course page and it will unlock here instantly."
          action={
            <Button asChild>
              <Link to="/courses/$slug" params={{ slug }}>
                View course &amp; enroll
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { course, lessons, enrollment, certificate, assessment } = data;
  const allLessonsDone = lessons.every((l) => completedIds.has(l.id));
  const currentLesson = view?.kind === "lesson" ? lessons[view.index] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to dashboard
          </Link>
          <h1 className="text-foreground mt-2 truncate text-xl font-black tracking-tight sm:text-2xl">
            {course.title}
          </h1>
        </div>
        <div className="w-full sm:w-64">
          <div className="text-muted-foreground mb-1.5 flex justify-between text-xs">
            <span>Course progress</span>
            <span className="text-brand-soft font-mono font-bold">{enrollment.progress}%</span>
          </div>
          <Progress value={enrollment.progress} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <nav
            className="bg-card border-border rounded-2xl border p-3 shadow-xl"
            aria-label="Course lessons"
          >
            <p className="text-muted-foreground px-2 pt-1 pb-2 font-mono text-[10px] tracking-wider uppercase">
              Curriculum
            </p>
            <ol className="space-y-1">
              {lessons.map((lesson, i) => {
                const isDone = completedIds.has(lesson.id);
                const isActive = view?.kind === "lesson" && view.index === i;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setView({ kind: "lesson", index: i });
                        setResult(null);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                        isActive
                          ? "bg-brand-subtle text-foreground border-primary/30 border"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2
                          className="text-success mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="text-muted-foreground/40 mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="leading-snug font-medium">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => setView({ kind: "assessment" })}
                  disabled={!allLessonsDone}
                  className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                    view?.kind === "assessment"
                      ? "bg-brand-subtle text-foreground border-primary/30 border"
                      : allLessonsDone
                        ? "text-brand-soft hover:bg-accent/50 border border-transparent"
                        : "text-muted-foreground/50 cursor-not-allowed border border-transparent"
                  }`}
                >
                  {certificate ? (
                    <Award className="text-gold mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : allLessonsDone ? (
                    <FileCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="leading-snug">Final assessment &amp; certificate</span>
                </button>
              </li>
            </ol>
          </nav>
        </aside>

        {/* Main panel */}
        <div className="lg:col-span-3">
          {currentLesson && view?.kind === "lesson" && (
            <article className="bg-card border-border rounded-3xl border p-6 shadow-xl sm:p-10">
              <p className="text-brand-soft font-mono text-xs tracking-wider uppercase">
                Lesson {currentLesson.position} of {lessons.length}
              </p>
              <h2 className="text-foreground mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {currentLesson.title}
              </h2>
              <div
                className="lesson-content mt-6 text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
              />
              <div className="border-border mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  className="rounded-xl font-bold"
                  disabled={view.index === 0}
                  onClick={() => setView({ kind: "lesson", index: view.index - 1 })}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous
                </Button>
                {completedIds.has(currentLesson.id) ? (
                  <Button
                    className="rounded-xl font-bold"
                    onClick={() =>
                      view.index + 1 < lessons.length
                        ? setView({ kind: "lesson", index: view.index + 1 })
                        : setView({ kind: "assessment" })
                    }
                  >
                    {view.index + 1 < lessons.length ? "Next lesson" : "Go to final assessment"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-cta shadow-glow-primary rounded-xl font-extrabold"
                    disabled={completeLesson.isPending}
                    onClick={() =>
                      completeLesson.mutate(currentLesson.id, {
                        onSuccess: () => {
                          if (view.index + 1 < lessons.length) {
                            setView({ kind: "lesson", index: view.index + 1 });
                          } else {
                            setView({ kind: "assessment" });
                          }
                        },
                      })
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {completeLesson.isPending ? "Saving…" : "Mark complete & continue"}
                  </Button>
                )}
              </div>
            </article>
          )}

          {view?.kind === "assessment" && (
            <div className="space-y-8">
              {certificate ? (
                <div className="space-y-6">
                  <div className="bg-success/10 border-success/30 flex items-center gap-3 rounded-2xl border p-5">
                    <PartyPopper className="text-success h-6 w-6 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-foreground text-sm font-bold">
                        Course complete — congratulations!
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Your signed certificate is below. Share the verification link anywhere.
                      </p>
                    </div>
                  </div>
                  <CertificateView
                    studentName={data.user.name}
                    courseTitle={course.title}
                    issuedAt={certificate.issuedAt}
                    code={certificate.code}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" className="rounded-xl font-bold">
                      <Link to="/verify/$code" params={{ code: certificate.code }}>
                        Open public verification page
                      </Link>
                    </Button>
                    <Button asChild className="rounded-xl font-bold">
                      <Link to="/courses">Find your next course</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <article className="bg-card border-border rounded-3xl border p-6 shadow-xl sm:p-10">
                  <p className="text-brand-soft font-mono text-xs tracking-wider uppercase">
                    Final assessment
                  </p>
                  <h2 className="text-foreground mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    Prove what you've learned
                  </h2>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {assessment.length} questions · pass mark 70% · unlimited retakes. Passing
                    issues your signed certificate instantly. Before you submit, make sure you've
                    completed your capstone project:{" "}
                    <span className="text-foreground font-medium">{course.project}</span>
                  </p>

                  {result && (
                    <div
                      className={`mt-6 rounded-2xl border p-5 ${
                        result.passed
                          ? "bg-success/10 border-success/30"
                          : "bg-destructive/10 border-destructive/30"
                      }`}
                      role="status"
                    >
                      <p className="text-foreground text-sm font-bold">
                        {result.passed
                          ? `Passed — ${result.correct}/${result.total} correct!`
                          : `Not quite — ${result.correct}/${result.total} correct. You need ${Math.ceil(result.total * 0.7)} to pass.`}
                      </p>
                      {!result.passed && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Review the lessons and try again — your answers below are kept so you can
                          adjust them.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-8 space-y-8">
                    {assessment.map((q) => (
                      <fieldset key={q.index}>
                        <legend className="text-foreground text-sm font-bold">
                          {q.index + 1}. {q.question}
                        </legend>
                        <div className="mt-3 space-y-2">
                          {q.options.map((option, oi) => (
                            <label
                              key={oi}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ${
                                answers[q.index] === oi
                                  ? "bg-brand-subtle border-primary/40 text-foreground"
                                  : "bg-background/40 border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.index}`}
                                className="accent-primary mt-0.5"
                                checked={answers[q.index] === oi}
                                onChange={() => setAnswers((prev) => ({ ...prev, [q.index]: oi }))}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>

                  <div className="border-border mt-10 border-t pt-6">
                    <Button
                      size="lg"
                      className="bg-gradient-cta shadow-glow-primary w-full rounded-xl font-extrabold sm:w-auto"
                      disabled={
                        Object.keys(answers).length < assessment.length ||
                        submitAssessment.isPending
                      }
                      onClick={() =>
                        submitAssessment.mutate(assessment.map((q) => answers[q.index] ?? -1))
                      }
                    >
                      <ListChecks className="h-5 w-5" aria-hidden="true" />
                      {submitAssessment.isPending
                        ? "Grading…"
                        : Object.keys(answers).length < assessment.length
                          ? `Answer all ${assessment.length} questions to submit`
                          : "Submit assessment"}
                    </Button>
                  </div>
                </article>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
