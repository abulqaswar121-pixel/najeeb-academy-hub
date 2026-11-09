import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck,
  FolderGit2,
  GraduationCap,
  ListChecks,
  Loader2,
  Lock,
  PartyPopper,
  PlayCircle,
  Star,
  Target,
  Unlock,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { printCertificate } from "../lib/print-certificate";
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
import { categoryBySlug } from "../data/categories";
import { NDH_PROMO_OPTION, ndhBriefFor, type NdhBrief } from "../data/ndh-briefs";
import { saveOfflineCourse, type OfflineLesson } from "../lib/offline-courses";
import { warmOfflinePage } from "../lib/pwa";
import { meQueryOptions, seo } from "../lib/academy";
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
        "Watch the full NDH Academy course video, then unlock every chapter note, exercise, capstone project and the final assessment.",
      path: `/learn/${params.slug}`,
    }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(learnQuery(params.slug)),
      context.queryClient.ensureQueryData(meQueryOptions),
    ]);
  },
  component: LearnPage,
});

type Panel = "project" | "assessment" | null;

function LearnPage() {
  const { slug } = Route.useParams();
  const { data } = useQuery(learnQuery(slug));
  const queryClient = useQueryClient();
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ passed: boolean; correct: number; total: number } | null>(
    null,
  );
  const [liveWatched, setLiveWatched] = useState(0);
  const [masterDuration, setMasterDuration] = useState(0);
  const [masterEnded, setMasterEnded] = useState(false);

  const lessons = useMemo(() => (data?.status === "ok" ? data.lessons : []), [data]);
  const completedIds = useMemo(
    () => new Set(data?.status === "ok" ? data.completedLessonIds : []),
    [data],
  );
  const stateByLesson = useMemo(
    () =>
      new Map(data?.status === "ok" ? data.lessonStates.map((s) => [s.lessonId, s] as const) : []),
    [data],
  );

  const certificate = data?.status === "ok" ? data.certificate : null;
  const projectSubmission = data?.status === "ok" ? data.projectSubmission : null;
  const allLessonsDone = lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));

  /** Furthest point already watched in the master timeline, rebuilt from the
   *  chapter progress the server persists. */
  const initialWatched = useMemo(() => {
    return lessons.reduce((max, lesson) => {
      const state = stateByLesson.get(lesson.id);
      if (!state || state.watchedSeconds <= 0) return max;
      const point =
        state.videoDone && lesson.videoEnd !== null
          ? lesson.videoEnd
          : lesson.videoStart + state.watchedSeconds;
      return Math.max(max, point);
    }, 0);
  }, [lessons, stateByLesson]);

  /** Fallback duration before the player reports its own (e.g. on first paint). */
  const estimatedDuration = useMemo(() => {
    const ends = lessons.map((l) => l.videoEnd).filter((v): v is number => v !== null);
    return ends.length > 0 ? Math.max(...ends) : 0;
  }, [lessons]);
  const effectiveDuration = masterDuration > 0 ? masterDuration : estimatedDuration;

  const masterComplete =
    lessons.length === 0 ||
    allLessonsDone ||
    masterEnded ||
    certificate !== null ||
    (effectiveDuration > 0 && initialWatched >= effectiveDuration - 2);
  const masterVideoId = lessons.find((lesson) => lesson.videoId)?.videoId ?? null;

  const masterPct = masterComplete
    ? 100
    : effectiveDuration > 0
      ? Math.min(99, Math.round((Math.max(liveWatched, initialWatched) / effectiveDuration) * 100))
      : 0;

  const completeStore = useRef(new Set<string>());
  useEffect(() => {
    completeStore.current = new Set(completedIds);
  }, [completedIds]);

  /**
   * Master-video progress is stored in the existing per-chapter lesson state:
   * as the playhead passes through a chapter window, that chapter's watched
   * seconds are saved. Rewinding and returning later resumes from the furthest
   * point the server has seen.
   */
  const handleMasterProgress = useCallback(
    (watchedSeconds: number, duration: number, ended: boolean) => {
      setMasterDuration(duration > 0 ? duration : 0);
      setLiveWatched(watchedSeconds);
      if (ended) setMasterEnded(true);
      if (!lessons.length || masterComplete) return;

      const index = lessons.findIndex((lesson, i) => {
        const end = lesson.videoEnd ?? duration;
        const inside = watchedSeconds >= lesson.videoStart && watchedSeconds < end;
        const atLastEnd =
          i === lessons.length - 1 && duration > 0 && watchedSeconds >= duration - 2;
        return inside || atLastEnd;
      });
      if (index < 0) return;

      const lesson = lessons[index]!;
      const start = lesson.videoStart;
      const end = lesson.videoEnd ?? duration;
      const windowLength = Math.max(1, end - start);
      const relativeWatched = Math.max(0, Math.min(watchedSeconds - start, windowLength));
      const chapterEnded =
        ended || (duration > 0 && watchedSeconds >= duration - 2) || watchedSeconds >= end - 2;

      void saveVideoProgressFn({
        data: {
          lessonId: lesson.id,
          watchedSeconds: relativeWatched,
          playerDuration: windowLength,
          ended: chapterEnded,
        },
      })
        .then((res) => {
          if (res.videoDone && !completeStore.current.has(lesson.id)) {
            completeStore.current.add(lesson.id);
            void queryClient.invalidateQueries({ queryKey: ["learn", slug] });
          }
        })
        .catch(() => {
          /* the player keeps reporting — a retry follows on the next tick */
        });
    },
    [lessons, masterComplete, queryClient, slug],
  );

  /**
   * Once the master video is complete, permanently unlock every chapter on the
   * server by marking each chapter window watched and each lesson complete —
   * all through the existing server functions, in curriculum order.
   */
  const unlockStarted = useRef(false);
  const unlockChapters = useMutation({
    mutationFn: async () => {
      const done = new Set(completedIds);
      for (const lesson of lessons) {
        if (done.has(lesson.id)) continue;
        const state = stateByLesson.get(lesson.id);
        if (!state?.videoDone) {
          const windowLength =
            lesson.videoEnd !== null
              ? lesson.videoEnd - lesson.videoStart
              : Math.max(1, masterDuration || 1);
          await saveVideoProgressFn({
            data: {
              lessonId: lesson.id,
              watchedSeconds: windowLength,
              playerDuration: Math.max(1, windowLength),
              ended: true,
            },
          });
        }
        await completeLessonFn({ data: { lessonId: lesson.id } });
        done.add(lesson.id);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Full video complete — every chapter, note and exercise is now unlocked.");
    },
    onError: (err) => {
      unlockStarted.current = false;
      toast.error(err instanceof Error ? err.message : "Could not unlock the chapters yet.");
    },
  });

  useEffect(() => {
    if (!masterComplete || allLessonsDone || unlockStarted.current || !lessons.length) return;
    unlockStarted.current = true;
    unlockChapters.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterComplete, allLessonsDone, lessons.length]);

  const openPanelRef = useRef<((p: "project" | "assessment") => void) | null>(null);
  const submitAssessment = useMutation({
    mutationFn: (payload: number[]) =>
      submitAssessmentFn({ data: { courseSlug: slug, answers: payload } }),
    onSuccess: async (res) => {
      setResult({ passed: res.passed, correct: res.correct, total: res.total });
      if (res.passed) {
        toast.success("Quiz passed — your NDH Agency assignment is now open!");
        await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
        openPanelRef.current?.("project");
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not submit the assessment."),
  });

  if (!data) {
    return (
      <div className="band-dark learning-room min-h-[60vh] px-4 py-24">
        <p className="text-muted-foreground text-center font-mono text-xs">Loading your course…</p>
      </div>
    );
  }

  if (data.status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={Lock}
          title="Log in to access this course"
          description="This is the student learning room. Log in to continue your lessons."
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
          description="Unlock it from the course page with one course credit and it will open here instantly."
          action={
            <Button asChild>
              <Link to="/courses/$slug" params={{ slug }}>
                View course &amp; unlock
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { course, enrollment, assessment } = data;
  const category = categoryBySlug(course.category);
  const assessmentPassed = data.assessmentPassed;
  const assessmentUnlocked = allLessonsDone;
  const projectUnlocked = allLessonsDone && assessmentPassed;
  const ndhBrief = ndhBriefFor({
    slug,
    title: course.title,
    category: course.category,
    tools: course.tools,
  });
  const chapter = activeChapter !== null && masterComplete ? lessons[activeChapter] : null;
  const chapterState = chapter ? stateByLesson.get(chapter.id) : undefined;

  const openPanel = (next: Exclude<Panel, null>) => {
    setPanel(next);
    setActiveChapter(null);
    requestAnimationFrame(() => {
      document
        .getElementById("course-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  openPanelRef.current = openPanel;

  const openChapter = (index: number) => {
    setPanel(null);
    setActiveChapter(index);
    requestAnimationFrame(() => {
      document
        .getElementById("chapter-notes")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="band-dark learning-room min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* ── Course strip ── */}
        <div className="flex flex-col gap-4 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Exit to dashboard
            </Link>
            <h1 className="text-foreground mt-2 truncate text-xl font-black tracking-tight sm:text-2xl">
              {course.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px]">
                {category?.shortName ?? course.category}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {course.level}
              </Badge>
              <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px] font-semibold">
                <BookOpen className="h-3 w-3" aria-hidden="true" />
                {lessons.length} chapters
              </span>
              {certificate && (
                <Badge variant="secondary" className="text-gold border-gold/40 text-[10px]">
                  <Award className="mr-1 h-3 w-3" aria-hidden="true" /> Certified
                </Badge>
              )}
            </div>
          </div>
          <div className="w-full shrink-0 lg:w-72">
            <div className="text-muted-foreground mb-1.5 flex justify-between font-mono text-[10px] tracking-wider uppercase">
              <span>Full video watched</span>
              <span className="text-brand-soft font-bold">{masterPct}%</span>
            </div>
            <Progress value={masterPct} className="h-2" aria-label="Full course video watched" />
            <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px] font-semibold">
              <span>
                {completedIds.size} of {lessons.length} chapters complete
              </span>
              <span>{enrollment.progress}% course</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 pb-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ── Main column: master video, chapters, notes, capstone, assessment ── */}
          <div className="min-w-0 space-y-5">
            <article
              id="master-video"
              className="border-border bg-card -mx-4 overflow-hidden border-x-0 border-y shadow-xl sm:mx-0 sm:rounded-2xl sm:border"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
                <div className="min-w-0">
                  <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
                    Master course video
                  </p>
                  <h2 className="text-foreground mt-1 text-xl font-black tracking-tight sm:text-2xl">
                    Watch the full course once
                  </h2>
                  <p className="text-muted-foreground mt-1.5 max-w-2xl text-xs leading-relaxed">
                    One video, 0:00 to the very end. Rewind any time to review — but you can never
                    skip ahead of your furthest watched point. Watching to the end permanently
                    unlocks every chapter below.
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
                    masterComplete
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-primary/40 bg-brand-subtle text-brand-soft"
                  }`}
                >
                  {masterComplete ? (
                    <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {masterComplete ? "Chapters unlocked" : `${masterPct}% watched`}
                </span>
              </div>

              <div
                className={
                  masterVideoId ? "px-0 pb-0 sm:px-4 sm:pb-4" : "px-3 pb-3 sm:px-4 sm:pb-4"
                }
              >
                {masterVideoId ? (
                  <GatedVideoPlayer
                    key={`master-${slug}`}
                    videoId={masterVideoId}
                    start={0}
                    end={null}
                    initialWatched={masterComplete ? 0 : initialWatched}
                    revisionMode={masterComplete}
                    title={`${course.title} — full course`}
                    watermark={data.user.email}
                    onProgress={handleMasterProgress}
                  />
                ) : (
                  <div className="border-border bg-background/50 rounded-2xl border border-dashed p-6 text-center">
                    <Video className="text-muted-foreground mx-auto h-6 w-6" aria-hidden="true" />
                    <p className="text-foreground mt-3 text-sm font-bold">
                      This course is text-first
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      There is no master video — every chapter and its notes are open below.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-border border-t px-5 py-4 sm:px-6">
                <div className="text-muted-foreground flex justify-between font-mono text-[10px] tracking-wider uppercase">
                  <span>Watch progress</span>
                  <span>{masterPct}%</span>
                </div>
                <Progress value={masterPct} className="mt-1.5 h-1.5" aria-label="Watch progress" />
                {masterComplete ? (
                  <p className="text-success mt-3 flex items-start gap-2 text-xs font-semibold">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Full video complete. Every chapter, written note and exercise is unlocked for
                    revision — rewatch any section as often as you like.
                  </p>
                ) : (
                  <p className="text-muted-foreground mt-3 flex items-start gap-2 text-xs leading-relaxed">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Watch the full course video to unlock individual chapter notes and exercises.
                  </p>
                )}
                {unlockChapters.isPending && (
                  <p className="text-brand-soft mt-3 flex items-center gap-2 text-xs font-bold">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Unlocking every chapter and exercise…
                  </p>
                )}
              </div>
            </article>

            {/* ── Chapters below the master player ── */}
            <section
              id="course-chapters"
              aria-label="Course chapters"
              className="border-border bg-card overflow-hidden rounded-2xl border shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
                    Chapters &amp; exercises
                  </p>
                  <h2 className="text-foreground mt-0.5 text-lg font-black tracking-tight">
                    Chapter notes &amp; quizzes
                  </h2>
                </div>
                <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-wider uppercase">
                  {completedIds.size}/{lessons.length} complete
                </span>
              </div>

              <ol className="border-border divide-border divide-y border-t">
                {lessons.map((lesson, index) => {
                  const state = stateByLesson.get(lesson.id);
                  const done = completedIds.has(lesson.id);
                  const active = activeChapter === index;
                  const minutes =
                    lesson.videoEnd !== null
                      ? Math.max(1, Math.round((lesson.videoEnd - lesson.videoStart) / 60))
                      : null;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        disabled={!masterComplete || unlockChapters.isPending}
                        onClick={() => openChapter(index)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-6 ${
                          active
                            ? "bg-brand-subtle"
                            : masterComplete
                              ? "hover:bg-accent/60"
                              : "cursor-not-allowed"
                        }`}
                      >
                        <span className="text-muted-foreground/70 w-6 shrink-0 font-mono text-[11px]">
                          {String(lesson.position).padStart(2, "0")}
                        </span>
                        {!masterComplete ? (
                          <Lock
                            className="text-muted-foreground/60 h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : done ? (
                          <CheckCircle2
                            className="text-success h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <PlayCircle
                            className="text-brand-soft h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                            masterComplete ? "text-foreground" : "text-muted-foreground/70"
                          }`}
                        >
                          {lesson.title}
                        </span>
                        {minutes !== null && (
                          <span className="text-muted-foreground hidden shrink-0 font-mono text-[10px] sm:inline">
                            {minutes} min
                          </span>
                        )}
                        {masterComplete && (
                          <span className="text-brand-soft shrink-0 font-mono text-[10px] font-bold uppercase">
                            {done ? "Notes" : "Open"}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="border-border border-t">
                <button
                  type="button"
                  disabled={!assessmentUnlocked}
                  onClick={() => openPanel("assessment")}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-6 ${
                    assessmentUnlocked ? "hover:bg-accent/60" : "cursor-not-allowed"
                  }`}
                >
                  <span className="text-muted-foreground/70 w-6 shrink-0 text-center font-mono text-[11px]">
                    <FileCheck className="mx-auto h-4 w-4" aria-hidden="true" />
                  </span>
                  {assessmentUnlocked ? (
                    <Unlock className="text-brand-soft h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock
                      className="text-muted-foreground/60 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`min-w-0 flex-1 text-sm font-semibold ${
                      assessmentUnlocked ? "text-foreground" : "text-muted-foreground/70"
                    }`}
                  >
                    1. Final quiz
                  </span>
                  <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                    {assessmentPassed ? "Passed" : "70% pass mark"}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!projectUnlocked}
                  onClick={() => openPanel("project")}
                  className={`border-border flex w-full items-center gap-3 border-t px-4 py-3.5 text-left transition-colors sm:px-6 ${
                    projectUnlocked ? "hover:bg-accent/60" : "cursor-not-allowed"
                  }`}
                >
                  <span className="text-muted-foreground/70 w-6 shrink-0 text-center font-mono text-[11px]">
                    <FolderGit2 className="mx-auto h-4 w-4" aria-hidden="true" />
                  </span>
                  {projectUnlocked ? (
                    <Unlock className="text-brand-soft h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock className="text-muted-foreground/60 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span
                    className={`min-w-0 flex-1 text-sm font-semibold ${
                      projectUnlocked ? "text-foreground" : "text-muted-foreground/70"
                    }`}
                  >
                    2. NDH Agency assignment
                  </span>
                  <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                    {certificate ? "Approved" : projectSubmission ? "Sent" : "NDH reviews"}
                  </span>
                </button>
              </div>

              {!masterComplete && (
                <p className="border-border text-muted-foreground flex items-start gap-2 border-t px-5 py-4 text-xs leading-relaxed sm:px-6">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Watch the full course video to unlock individual chapter notes and exercises.
                </p>
              )}
            </section>

            {/* ── Selected chapter notes ── */}
            {chapter && (
              <article
                id="chapter-notes"
                className="border-border bg-card rounded-2xl border p-5 shadow-xl sm:p-7"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
                    Chapter {chapter.position} of {lessons.length}
                  </p>
                  {completedIds.has(chapter.id) && (
                    <Badge variant="secondary" className="text-success text-[10px]">
                      <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" /> Complete —
                      revision mode
                    </Badge>
                  )}
                  {chapterState?.videoDone && (
                    <Badge variant="outline" className="text-brand-soft text-[10px]">
                      Video section watched
                    </Badge>
                  )}
                </div>
                <h2 className="text-foreground mt-2 text-xl font-black tracking-tight sm:text-2xl">
                  {chapter.title}
                </h2>

                {chapter.content ? (
                  <div
                    className="lesson-prose mt-5 text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                  />
                ) : (
                  <div className="border-border bg-background/50 mt-5 rounded-2xl border border-dashed p-6 text-center">
                    <Lock className="text-muted-foreground mx-auto h-5 w-5" aria-hidden="true" />
                    <p className="text-foreground mt-2 text-sm font-bold">
                      Written notes unlock after the full video
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Finish the master video above and this chapter&apos;s notes, activity and
                      reflection will open here permanently.
                    </p>
                  </div>
                )}

                <div className="border-border mt-6 flex flex-wrap gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl font-bold"
                    disabled={activeChapter === 0}
                    onClick={() => openChapter((activeChapter ?? 0) - 1)}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous chapter
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl font-bold"
                    disabled={activeChapter === lessons.length - 1}
                    onClick={() => openChapter((activeChapter ?? 0) + 1)}
                  >
                    Next chapter <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </article>
            )}

            {/* ── Capstone project / final assessment panels ── */}
            <div id="course-panel">
              {panel === "project" && (
                <ProjectPanel
                  slug={slug}
                  brief={ndhBrief}
                  submission={projectSubmission}
                  hasCertificate={certificate !== null}
                  onOpenCertificate={() => openPanel("assessment")}
                />
              )}

              {panel === "assessment" && (
                <div className="space-y-5">
                  {certificate ? (
                    <div className="space-y-5">
                      <div className="border-success/30 bg-success/10 flex items-center gap-3 rounded-2xl border p-5">
                        <PartyPopper className="text-success h-6 w-6 shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-foreground text-sm font-bold">
                            Course complete — congratulations!
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Your signed certificate is below. Download it, share the verification
                            link anywhere.
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
                        <Button
                          className="bg-gradient-cta shadow-glow-primary rounded-xl font-bold"
                          onClick={printCertificate}
                        >
                          <Download className="h-4 w-4" aria-hidden="true" /> Download certificate
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl font-bold">
                          <Link to="/verify/$code" params={{ code: certificate.code }}>
                            Open public verification page
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl font-bold">
                          <Link to="/courses">Find your next course</Link>
                        </Button>
                      </div>
                      <ReviewPanel slug={slug} existing={data.myReview} />
                    </div>
                  ) : assessmentPassed ? (
                    <div className="border-success/30 bg-success/10 rounded-2xl border p-5">
                      <p className="text-foreground text-sm font-bold">
                        Quiz passed — well done!
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        Your last step is the NDH Agency assignment. When NDH approves your work,
                        your signed certificate appears here.
                      </p>
                      <Button
                        className="mt-4 rounded-xl font-bold"
                        onClick={() => openPanel("project")}
                      >
                        <FolderGit2 className="h-4 w-4" aria-hidden="true" /> Open NDH assignment
                      </Button>
                    </div>
                  ) : (
                    <article className="border-border bg-card rounded-2xl border p-5 shadow-xl sm:p-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
                            Final assessment
                          </p>
                          <h2 className="text-foreground mt-1 text-2xl font-black tracking-tight">
                            Prove what you&apos;ve learned
                          </h2>
                        </div>
                        <span className="border-highlight/40 bg-highlight/10 text-highlight inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase">
                          <Target className="h-3.5 w-3.5" aria-hidden="true" /> 70% to pass
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {assessment.length} questions · unlimited retakes. Passing opens your NDH
                        Agency assignment — the last step before your certificate.
                      </p>

                      <div className="mt-5 space-y-1.5">
                        <div className="text-muted-foreground flex justify-between font-mono text-[10px] tracking-wider uppercase">
                          <span>Answered</span>
                          <span>
                            {Object.keys(answers).length}/{assessment.length}
                          </span>
                        </div>
                        <Progress
                          value={
                            (Object.keys(answers).length / Math.max(1, assessment.length)) * 100
                          }
                          className="h-1.5"
                        />
                      </div>

                      {result && (
                        <div
                          className={`mt-5 rounded-2xl border p-4 ${
                            result.passed
                              ? "border-success/30 bg-success/10"
                              : "border-destructive/30 bg-destructive/10"
                          }`}
                          role="status"
                        >
                          <p className="text-foreground text-sm font-bold">
                            {result.passed
                              ? `Passed — ${result.correct}/${result.total} correct!`
                              : `Not quite — ${result.correct}/${result.total} correct. You need ${Math.ceil(result.total * 0.7)} to pass.`}
                          </p>
                          {!result.passed && (
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <p className="text-muted-foreground text-xs">
                                Review the chapters and try again — your answers are kept so you can
                                adjust them.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg text-xs font-bold"
                                onClick={() => openChapter(Math.max(0, lessons.length - 1))}
                              >
                                Review the last chapter
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-6 space-y-5">
                        {assessment.map((q) => (
                          <fieldset
                            key={q.index}
                            className="border-border bg-background/40 rounded-2xl border p-4 sm:p-5"
                          >
                            <legend className="text-foreground px-1 text-sm font-bold">
                              {q.index + 1}. {q.question}
                            </legend>
                            <div className="mt-3 space-y-2">
                              {q.options.map((option, oi) => {
                                const selected = answers[q.index] === oi;
                                return (
                                  <label
                                    key={oi}
                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                                      selected
                                        ? "border-primary/50 bg-brand-subtle text-foreground"
                                        : "border-border text-muted-foreground hover:border-primary/30"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${q.index}`}
                                      className="accent-primary mt-0.5"
                                      checked={selected}
                                      onChange={() =>
                                        setAnswers((prev) => ({ ...prev, [q.index]: oi }))
                                      }
                                    />
                                    <span className="leading-snug">{option}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>
                        ))}
                      </div>

                      <div className="border-border mt-7 flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground text-xs">
                          {Object.keys(answers).length < assessment.length
                            ? `Answer all ${assessment.length} questions to submit.`
                            : "All questions answered — good luck!"}
                        </p>
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
                              ? `Answer all ${assessment.length} questions`
                              : "Submit assessment"}
                        </Button>
                      </div>
                    </article>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar: course steps, offline ── */}
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
            <nav
              aria-label="Course steps"
              className="border-border bg-card/80 overflow-hidden rounded-2xl border shadow-xl backdrop-blur"
            >
              <div className="border-border border-b px-4 py-3.5">
                <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                  Course steps
                </p>
                <p className="text-foreground text-sm font-bold">
                  {completedIds.size}/{lessons.length} chapters · {masterPct}% video
                </p>
              </div>
              <div className="space-y-1 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setPanel(null);
                    requestAnimationFrame(() =>
                      document
                        .getElementById("master-video")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                    );
                  }}
                  className="text-brand-soft hover:bg-accent/60 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors"
                >
                  <Video className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Master video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPanel(null);
                    requestAnimationFrame(() =>
                      document
                        .getElementById("course-chapters")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                    );
                  }}
                  className="text-foreground hover:bg-accent/60 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors"
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Chapters &amp; notes
                </button>
                <button
                  type="button"
                  disabled={!assessmentUnlocked}
                  onClick={() => openPanel("assessment")}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                    assessmentUnlocked
                      ? panel === "assessment"
                        ? "bg-brand-subtle text-foreground"
                        : "text-foreground hover:bg-accent/60"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  {certificate ? (
                    <Award className="text-gold h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : assessmentUnlocked ? (
                    <FileCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock
                      className="text-muted-foreground/50 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  Final quiz
                </button>
                <button
                  type="button"
                  disabled={!projectUnlocked}
                  onClick={() => openPanel("project")}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                    projectUnlocked
                      ? panel === "project"
                        ? "bg-brand-subtle text-foreground"
                        : "text-foreground hover:bg-accent/60"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  {projectSubmission ? (
                    <CheckCircle2 className="text-success h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : projectUnlocked ? (
                    <FolderGit2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock
                      className="text-muted-foreground/50 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  NDH assignment
                </button>
              </div>
            </nav>

            <div className="border-border bg-card/80 rounded-2xl border p-4 shadow-lg">
              <p className="text-muted-foreground flex items-start gap-2 text-[11px] leading-relaxed">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Chapters, notes and quizzes stay locked until the master video reaches 100%. After
                that they unlock permanently for revision.
              </p>
              <SaveOfflineButton
                course={{ slug, title: course.title, level: course.level }}
                lessons={lessons.map((l) => ({
                  title: l.title,
                  position: l.position,
                  content: stateByLesson.get(l.id)?.videoDone && l.content ? l.content : null,
                }))}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── Project panel ─────────────────────────────

function ProjectPanel({
  slug,
  brief,
  submission,
  hasCertificate,
  onOpenCertificate,
}: {
  slug: string;
  brief: NdhBrief;
  hasCertificate: boolean;
  onOpenCertificate: () => void;
  submission: {
    link: string;
    notes: string;
    status: "pending" | "approved" | "changes_requested";
    feedback: string | null;
    submittedAt: string;
  } | null;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(submission === null);
  const [link, setLink] = useState(submission?.link ?? "");
  const [notes, setNotes] = useState(submission?.notes ?? "");

  const submit = useMutation({
    mutationFn: () => submitProjectFn({ data: { courseSlug: slug, link, notes } }),
    onSuccess: async () => {
      toast.success("Sent to NDH for review — you'll see the result here.");
      await queryClient.invalidateQueries({ queryKey: ["learn", slug] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditing(false);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not submit the project."),
  });

  const statusBadge =
    submission?.status === "approved"
      ? { label: "Approved by NDH", cls: "border-success/40 text-success" }
      : submission?.status === "changes_requested"
        ? { label: "Changes requested", cls: "border-destructive/40 text-destructive" }
        : { label: "Waiting for NDH review", cls: "border-primary/40 text-brand-soft" };

  return (
    <article className="border-border bg-card rounded-2xl border p-5 shadow-xl sm:p-7">
      <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
        NDH Agency assignment
      </p>
      <h2 className="text-foreground mt-1 text-2xl font-black tracking-tight">{brief.title}</h2>

      <div className="border-highlight/30 bg-highlight/5 mt-4 rounded-2xl border p-4">
        <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
          Client brief from NDH
        </p>
        <p className="text-foreground mt-1.5 text-sm leading-relaxed font-medium">{brief.brief}</p>
      </div>

      <div className="mt-4">
        <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
          What NDH needs from you
        </p>
        <ol className="text-foreground mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          {brief.tasks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </div>

      <div className="border-primary/30 bg-brand-subtle mt-4 rounded-2xl border p-4">
        <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
          How to send it · {brief.format.label}
        </p>
        <p className="text-foreground mt-1.5 text-sm font-semibold">{brief.format.accepts}</p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{brief.format.howTo}</p>
      </div>

      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">{NDH_PROMO_OPTION}</p>
      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
        NDH reviews every assignment. When it is approved, your signed certificate is issued.
      </p>

      {submission && !editing ? (
        <div className="mt-5 space-y-4">
          <div className="border-border bg-background/50 rounded-2xl border border-dashed p-5">
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
              <div className="border-primary/30 bg-brand-subtle mt-4 rounded-xl border p-4">
                <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
                  Feedback from NDH
                </p>
                <p className="text-foreground mt-1 text-sm leading-relaxed">
                  {submission.feedback}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {submission.status !== "approved" && (
            <Button
              variant="outline"
              className="rounded-xl font-bold"
              onClick={() => setEditing(true)}
            >
              Update submission
            </Button>
            )}
            {hasCertificate && (
              <Button className="rounded-xl font-bold" onClick={onOpenCertificate}>
                See my certificate <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <form
          className="border-border bg-background/40 mt-5 space-y-4 rounded-2xl border border-dashed p-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="project-link">Link to your work ({brief.format.label})</Label>
            <Input
              id="project-link"
              type="url"
              required
              placeholder={brief.format.placeholder}
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-notes">Notes for NDH (optional)</Label>
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
                  ? "Send again to NDH"
                  : "Send to NDH"}
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
    <article className="border-border bg-card rounded-2xl border p-5 shadow-xl sm:p-7">
      <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
        Rate this course
      </p>
      <h3 className="text-foreground mt-1 text-lg font-black tracking-tight">
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

function SaveOfflineButton({
  course,
  lessons,
}: {
  course: { slug: string; title: string; level: string };
  lessons: OfflineLesson[];
}) {
  const ready = lessons.filter((l) => l.content).length;
  return (
    <button
      type="button"
      onClick={() => {
        try {
          saveOfflineCourse({ ...course, savedAt: new Date().toISOString(), lessons });
          warmOfflinePage();
          toast.success(
            `Saved for offline — ${ready}/${lessons.length} chapters' notes. Find it in “My offline courses”.`,
          );
        } catch {
          toast.error("Not enough space on this device to save the course.");
        }
      }}
      className="text-brand-soft mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold hover:underline"
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" /> Save for offline ({ready}/
      {lessons.length} notes)
    </button>
  );
}
