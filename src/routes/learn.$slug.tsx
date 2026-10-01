import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileCheck,
  FolderGit2,
  GraduationCap,
  ListChecks,
  Lock,
  PartyPopper,
  PlayCircle,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { CertificateView } from "../components/academy/CertificateView";
import { EmptyState } from "../components/academy/EmptyState";
import { GatedVideoPlayer } from "../components/academy/GatedVideoPlayer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { seo } from "../lib/academy";
import {
  completeLessonFn,
  fetchLearn,
  saveVideoProgressFn,
  submitAssessmentFn,
  submitProjectFn,
  submitReviewFn,
} from "../lib/server-fns";

const learnQuery = (slug: string) => ({
  queryKey: ["learn", slug],
  queryFn: () => fetchLearn({ data: { slug } }),
});

export const Route = createFileRoute("/learn/$slug")({
  head: ({ params }) =>
    seo({
      title: "Course Player",
      description:
        "Work through your Najeeb Academy course lessons, submit your capstone project, pass the final assessment and earn your certificate.",
      path: `/learn/${params.slug}`,
    }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(learnQuery(params.slug));
  },
  component: LearnPage,
});

type View = { kind: "lesson"; index: number } | { kind: "project" } | { kind: "assessment" };

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
  const stateByLesson = useMemo(
    () =>
      new Map(data?.status === "ok" ? data.lessonStates.map((s) => [s.lessonId, s] as const) : []),
    [data],
  );

  // Pick the initial view: first incomplete lesson → project → assessment.
  useEffect(() => {
    if (view !== null || !data || data.status !== "ok") return;
    const firstIncomplete = data.lessons.findIndex((l) => !completedIds.has(l.id));
    if (firstIncomplete !== -1) setView({ kind: "lesson", index: firstIncomplete });
    else if (!data.projectSubmission) setView({ kind: "project" });
    else setView({ kind: "assessment" });
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

  const { course, lessons, enrollment, certificate, assessment, projectSubmission } = data;
  const allLessonsDone = lessons.every((l) => completedIds.has(l.id));
  const assessmentUnlocked = allLessonsDone && projectSubmission?.status === "approved";
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
                const s = stateByLesson.get(lesson.id);
                const isDone = completedIds.has(lesson.id);
                const isUnlocked = s?.unlocked ?? i === 0;
                const isActive = view?.kind === "lesson" && view.index === i;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        setView({ kind: "lesson", index: i });
                        setResult(null);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                        isActive
                          ? "bg-brand-subtle text-foreground border-primary/30 border"
                          : isUnlocked
                            ? "text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent"
                            : "text-muted-foreground/40 cursor-not-allowed border border-transparent"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2
                          className="text-success mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      ) : isUnlocked ? (
                        <Circle
                          className="text-muted-foreground/40 mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Lock
                          className="text-muted-foreground/40 mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="leading-snug font-medium">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
              {/* Capstone project */}
              <li>
                <button
                  type="button"
                  onClick={() => setView({ kind: "project" })}
                  disabled={!allLessonsDone}
                  className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                    view?.kind === "project"
                      ? "bg-brand-subtle text-foreground border-primary/30 border"
                      : allLessonsDone
                        ? "text-brand-soft hover:bg-accent/50 border border-transparent"
                        : "text-muted-foreground/50 cursor-not-allowed border border-transparent"
                  }`}
                >
                  {projectSubmission ? (
                    <CheckCircle2
                      className="text-success mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  ) : allLessonsDone ? (
                    <FolderGit2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="leading-snug">Capstone project</span>
                </button>
              </li>
              {/* Final assessment */}
              <li>
                <button
                  type="button"
                  onClick={() => setView({ kind: "assessment" })}
                  disabled={!assessmentUnlocked}
                  className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                    view?.kind === "assessment"
                      ? "bg-brand-subtle text-foreground border-primary/30 border"
                      : assessmentUnlocked
                        ? "text-brand-soft hover:bg-accent/50 border border-transparent"
                        : "text-muted-foreground/50 cursor-not-allowed border border-transparent"
                  }`}
                >
                  {certificate ? (
                    <Award className="text-gold mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : assessmentUnlocked ? (
                    <FileCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="leading-snug">Final assessment &amp; certificate</span>
                </button>
              </li>
            </ol>
          </nav>
          <p className="text-muted-foreground mt-3 px-2 text-[11px] leading-relaxed">
            Lessons unlock in order. Notes open after each video is fully watched — completed
            lessons stay open for revision with free seeking.
          </p>
        </aside>

        {/* Main panel */}
        <div className="lg:col-span-3">
          {currentLesson && view?.kind === "lesson" && (
            <LessonPanel
              key={currentLesson.id}
              slug={slug}
              lesson={currentLesson}
              lessonCount={lessons.length}
              index={view.index}
              state={stateByLesson.get(currentLesson.id)}
              userEmail={data.user.email}
              isCompleted={completedIds.has(currentLesson.id)}
              completePending={completeLesson.isPending}
              onPrev={() => setView({ kind: "lesson", index: view.index - 1 })}
              onNext={() =>
                view.index + 1 < lessons.length
                  ? setView({ kind: "lesson", index: view.index + 1 })
                  : setView({ kind: "project" })
              }
              onComplete={() =>
                completeLesson.mutate(currentLesson.id, {
                  onSuccess: () => {
                    if (view.index + 1 < lessons.length) {
                      setView({ kind: "lesson", index: view.index + 1 });
                    } else {
                      setView({ kind: "project" });
                    }
                  },
                })
              }
            />
          )}

          {view?.kind === "project" && (
            <ProjectPanel
              slug={slug}
              projectBrief={course.project}
              submission={projectSubmission}
              onSubmitted={() => setView({ kind: "assessment" })}
            />
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
                  <ReviewPanel slug={slug} existing={data.myReview} />
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
                    issues your signed certificate instantly.
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

// ───────────────────────────── Lesson panel ─────────────────────────────

interface LessonPanelProps {
  slug: string;
  lesson: {
    id: string;
    title: string;
    position: number;
    content: string;
    videoId: string | null;
    videoStart: number;
    videoEnd: number | null;
  };
  lessonCount: number;
  index: number;
  state:
    | { unlocked: boolean; videoDone: boolean; watchedSeconds: number; completed: boolean }
    | undefined;
  userEmail: string;
  isCompleted: boolean;
  completePending: boolean;
  onPrev: () => void;
  onNext: () => void;
  onComplete: () => void;
}

function LessonPanel({
  slug,
  lesson,
  lessonCount,
  index,
  state,
  userEmail,
  isCompleted,
  completePending,
  onPrev,
  onNext,
  onComplete,
}: LessonPanelProps) {
  const queryClient = useQueryClient();
  const videoDoneRef = useRef(state?.videoDone ?? false);
  const [videoDone, setVideoDone] = useState(state?.videoDone ?? false);

  const saveProgress = useMutation({
    mutationFn: (input: { watchedSeconds: number; playerDuration: number; ended: boolean }) =>
      saveVideoProgressFn({ data: { lessonId: lesson.id, ...input } }),
    onSuccess: async (res) => {
      if (res.videoDone && !videoDoneRef.current) {
        videoDoneRef.current = true;
        setVideoDone(true);
        toast.success("Video complete — lesson notes unlocked!");
        await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
      }
    },
  });
  const saveRef = useRef(saveProgress.mutate);
  saveRef.current = saveProgress.mutate;

  const handleProgress = useCallback(
    (watchedSeconds: number, windowDuration: number, ended: boolean) => {
      if (videoDoneRef.current) return; // revision mode — nothing left to track
      saveRef.current({
        watchedSeconds,
        playerDuration: lesson.videoStart + windowDuration,
        ended,
      });
    },
    [lesson.videoStart],
  );

  const notesUnlocked = videoDone && lesson.content.length > 0;

  return (
    <article className="bg-card border-border rounded-3xl border p-6 shadow-xl sm:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-brand-soft font-mono text-xs tracking-wider uppercase">
          Lesson {lesson.position} of {lessonCount}
        </p>
        {isCompleted && (
          <Badge variant="secondary" className="text-success text-[10px]">
            Completed — revision mode
          </Badge>
        )}
      </div>
      <h2 className="text-foreground mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {lesson.title}
      </h2>

      {lesson.videoId && (
        <div className="mt-6">
          <GatedVideoPlayer
            key={lesson.id}
            videoId={lesson.videoId}
            start={lesson.videoStart}
            end={lesson.videoEnd}
            initialWatched={state?.watchedSeconds ?? 0}
            revisionMode={videoDone}
            title={lesson.title}
            watermark={userEmail}
            onProgress={handleProgress}
          />
        </div>
      )}

      {notesUnlocked ? (
        <div
          className="lesson-content mt-6 text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      ) : (
        <div className="bg-background/60 border-border mt-6 rounded-2xl border border-dashed p-6 text-center">
          <Lock className="text-muted-foreground mx-auto h-6 w-6" aria-hidden="true" />
          <p className="text-foreground mt-3 text-sm font-bold">
            Lesson notes are locked until you finish the video
          </p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs leading-relaxed">
            Watch the lesson video above to the end — the written notes, activity and reflection
            then unlock for reference anytime. Rewinding is allowed; skipping ahead is not.
          </p>
        </div>
      )}

      <div className="border-border mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          className="rounded-xl font-bold"
          disabled={index === 0}
          onClick={onPrev}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous
        </Button>
        {isCompleted ? (
          <Button className="rounded-xl font-bold" onClick={onNext}>
            {index + 1 < lessonCount ? "Next lesson" : "Go to capstone project"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            className="bg-gradient-cta shadow-glow-primary rounded-xl font-extrabold"
            disabled={completePending || !videoDone}
            onClick={onComplete}
          >
            {videoDone ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
            )}
            {completePending
              ? "Saving…"
              : videoDone
                ? "Mark complete & continue"
                : "Finish the video to continue"}
          </Button>
        )}
      </div>
    </article>
  );
}

// ───────────────────────────── Project panel ─────────────────────────────

function ProjectPanel({
  slug,
  projectBrief,
  submission,
  onSubmitted,
}: {
  slug: string;
  projectBrief: string;
  submission: {
    link: string;
    notes: string;
    status: "pending" | "approved" | "changes_requested";
    feedback: string | null;
    submittedAt: string;
  } | null;
  onSubmitted: () => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(submission === null);
  const [link, setLink] = useState(submission?.link ?? "");
  const [notes, setNotes] = useState(submission?.notes ?? "");

  const submit = useMutation({
    mutationFn: () => submitProjectFn({ data: { courseSlug: slug, link, notes } }),
    onSuccess: async () => {
      toast.success("Project submitted — the final assessment unlocks after mentor approval.");
      await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditing(false);
      onSubmitted();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not submit the project."),
  });

  const statusBadge =
    submission?.status === "approved"
      ? { label: "Approved by mentor", cls: "border-success/40 text-success" }
      : submission?.status === "changes_requested"
        ? { label: "Changes requested", cls: "border-destructive/40 text-destructive" }
        : { label: "Awaiting mentor review", cls: "border-primary/40 text-brand-soft" };

  return (
    <article className="bg-card border-border rounded-3xl border p-6 shadow-xl sm:p-10">
      <p className="text-brand-soft font-mono text-xs tracking-wider uppercase">Capstone project</p>
      <h2 className="text-foreground mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        Build it, ship it, submit it
      </h2>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        Your project brief: <span className="text-foreground font-medium">{projectBrief}</span>
      </p>
      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
        Upload your work anywhere public or shareable — Google Drive, GitHub, Figma, a live URL —
        and paste the link below. A mentor reviews every submission and leaves feedback in your
        dashboard; approval unlocks the final assessment.
      </p>

      {submission && !editing ? (
        <div className="mt-6 space-y-4">
          <div className="bg-background/60 border-border rounded-2xl border p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${statusBadge.cls}`}
              >
                {statusBadge.label}
              </span>
            </div>
            <a
              href={submission.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-soft mt-3 flex items-center gap-1.5 text-sm font-bold break-all hover:underline"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              {submission.link}
            </a>
            {submission.notes && (
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                {submission.notes}
              </p>
            )}
            {submission.feedback && (
              <div className="bg-brand-subtle border-primary/30 mt-4 rounded-xl border p-4">
                <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
                  Mentor feedback
                </p>
                <p className="text-foreground mt-1 text-sm leading-relaxed">
                  {submission.feedback}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-xl font-bold"
              onClick={() => setEditing(true)}
            >
              Update submission
            </Button>
            <Button className="rounded-xl font-bold" onClick={onSubmitted}>
              Go to final assessment <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="project-link">Project link</Label>
            <Input
              id="project-link"
              type="url"
              required
              placeholder="https://drive.google.com/… or https://github.com/…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-notes">Notes for your reviewer (optional)</Label>
            <Textarea
              id="project-notes"
              rows={4}
              placeholder="What you built, the tools you used, anything you'd like feedback on…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              className="bg-gradient-cta shadow-glow-primary rounded-xl font-extrabold"
              disabled={submit.isPending || link.trim().length === 0}
            >
              <FolderGit2 className="h-4 w-4" aria-hidden="true" />
              {submit.isPending
                ? "Submitting…"
                : submission
                  ? "Resubmit project"
                  : "Submit project"}
            </Button>
            {submission && (
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl font-bold"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </article>
  );
}

// ───────────────────────────── Review panel ─────────────────────────────

function ReviewPanel({
  slug,
  existing,
}: {
  slug: string;
  existing: { rating: number; comment: string } | null;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [asTestimonial, setAsTestimonial] = useState(false);
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      submitReviewFn({
        data: { courseSlug: slug, rating, comment, asTestimonial, testimonialRole: role },
      }),
    onSuccess: async (res) => {
      setSaved(true);
      toast.success(
        res.testimonialSubmitted
          ? "Review saved — your story was sent for homepage review. Thank you!"
          : "Review saved — thank you!",
      );
      await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not save your review."),
  });

  return (
    <article className="bg-card border-border rounded-3xl border p-6 shadow-xl sm:p-8">
      <p className="text-brand-soft font-mono text-xs tracking-wider uppercase">Rate this course</p>
      <h3 className="text-foreground mt-2 text-xl font-black tracking-tight">
        {existing ? "Update your review" : "How was it? Help the next student decide"}
      </h3>
      <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 ${
                (hover || rating) >= n ? "fill-gold text-gold" : "text-muted-foreground/40"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-muted-foreground ml-2 text-xs font-bold">{rating}/5</span>
        )}
      </div>
      <div className="mt-4 space-y-4">
        <Textarea
          rows={3}
          placeholder="What did you build? What surprised you? Would you recommend it?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            checked={asTestimonial}
            onCheckedChange={(v) => setAsTestimonial(v === true)}
            className="mt-0.5"
          />
          <span className="text-muted-foreground text-xs leading-relaxed">
            Share my review as a public testimonial. Our team reviews every story before it appears
            on the homepage.
          </span>
        </label>
        {asTestimonial && (
          <Input
            placeholder="Your role or title, e.g. Freelance designer, Lagos"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        )}
        <Button
          className="rounded-xl font-bold"
          disabled={rating === 0 || submit.isPending}
          onClick={() => submit.mutate()}
        >
          <Star className="h-4 w-4" aria-hidden="true" />
          {submit.isPending ? "Saving…" : saved || existing ? "Update review" : "Submit review"}
        </Button>
      </div>
    </article>
  );
}
