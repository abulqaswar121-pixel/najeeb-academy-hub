import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderGit2,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "../components/academy/EmptyState";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { formatDate, meQueryOptions, seo, useMe } from "../lib/academy";
import type { AdminOverview } from "../server/types";
import {
  adminCoursesFn,
  adminDeleteMessageFn,
  adminDeleteStudentFn,
  adminDeleteTestimonialFn,
  adminMessagesFn,
  adminOverviewFn,
  adminProjectsFn,
  adminReviewProjectFn,
  adminSetCourseDeletedFn,
  adminSetCourseHiddenFn,
  adminSetTestimonialStatusFn,
  adminStudentsFn,
  adminTestimonialsFn,
  adminUpdateCourseFn,
} from "../lib/server-fns";

export const Route = createFileRoute("/admin")({
  head: () =>
    seo({
      title: "Admin Portal",
      description:
        "Najeeb Academy admin portal — grade capstone projects, approve student reviews and stories, read contact messages and manage the academy.",
      path: "/admin",
    }),
  loader: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions);
    // Prefetch the overview only for admins — the loader must not throw for
    // regular visitors who hit /admin and see the access gate.
    if (me?.role === "admin") {
      await context.queryClient.ensureQueryData(overviewQuery);
    }
  },
  component: AdminPage,
});

type Tab = "overview" | "projects" | "reviews" | "messages" | "students" | "courses";

const TABS: {
  id: Tab;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  hint: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "Overview",
    icon: LayoutDashboard,
    hint: "Platform stats & queues",
  },
  {
    id: "projects",
    label: "Project grading",
    shortLabel: "Projects",
    icon: FolderGit2,
    hint: "Review capstone submissions",
  },
  {
    id: "reviews",
    label: "Course reviews",
    shortLabel: "Reviews",
    icon: MessageSquareQuote,
    hint: "Approve student stories",
  },
  {
    id: "messages",
    label: "Contact messages",
    shortLabel: "Messages",
    icon: Inbox,
    hint: "Inbox from the contact form",
  },
  {
    id: "students",
    label: "Students",
    shortLabel: "Students",
    icon: Users,
    hint: "Accounts & activity",
  },
  {
    id: "courses",
    label: "Courses",
    shortLabel: "Courses",
    icon: BookOpen,
    hint: "Publish, feature, edit",
  },
];

const overviewQuery = { queryKey: ["admin", "overview"], queryFn: () => adminOverviewFn() };

function AdminPage() {
  const { data: me, isLoading } = useMe();
  const { data: overview } = useQuery({ ...overviewQuery, enabled: Boolean(me?.role === "admin") });
  const [tab, setTab] = useState<Tab>("overview");

  if (isLoading) return null;

  if (!me || me.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={ShieldCheck}
          title="Admin access required"
          description="This is the Najeeb Academy admin portal. Log in with an administrator account to grade projects, approve reviews and manage courses."
          action={
            <Button asChild>
              <Link to="/login" search={{ redirect: "/admin" }}>
                Log in as admin
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const counts: Partial<Record<Tab, number | undefined>> = {
    projects: overview?.pendingProjects,
    reviews: overview?.pendingTestimonials,
    messages: overview?.messages,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
            Admin portal
          </p>
          <h1 className="text-foreground mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
            Run the academy, {me.name.split(" ")[0]}
          </h1>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-xl font-bold">
          <Link to="/dashboard">
            <GraduationCap className="h-4 w-4" aria-hidden="true" /> Student view
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[236px_minmax(0,1fr)]">
        {/* Compact sidebar / mobile tab strip */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav
            className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible"
            aria-label="Admin sections"
          >
            {TABS.map(({ id, label, shortLabel, icon: Icon, hint }) => {
              const count = counts[id];
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? "page" : undefined}
                  onClick={() => setTab(id)}
                  className={`group flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors lg:w-full ${
                    tab === id
                      ? "border-primary/40 bg-brand-subtle text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${tab === id ? "text-brand-soft" : ""}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold">
                      <span className="lg:hidden">{shortLabel}</span>
                      <span className="hidden lg:inline">{label}</span>
                    </span>
                    <span className="text-muted-foreground/80 hidden truncate text-[10px] lg:block">
                      {hint}
                    </span>
                  </span>
                  {typeof count === "number" && count > 0 && (
                    <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="border-border mt-3 hidden border-t pt-3 lg:block">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors"
            >
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> Back to the academy
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          {tab === "overview" && <OverviewTab onNavigate={setTab} overview={overview} />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "students" && <StudentsTab />}
          {tab === "courses" && <CoursesTab />}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── Overview ─────────────────────────────

function OverviewTab({
  onNavigate,
  overview,
}: {
  onNavigate: (tab: Tab) => void;
  overview: AdminOverview | undefined;
}) {
  if (!overview) return <TabSkeleton />;

  const stats: { label: string; value: string; icon: typeof Users; tab?: Tab }[] = [
    { label: "Students", value: String(overview.students), icon: Users, tab: "students" },
    { label: "Enrollments", value: String(overview.enrollments), icon: GraduationCap },
    { label: "Certificates issued", value: String(overview.certificates), icon: Award },
    {
      label: "Live courses",
      value: `${overview.courses - overview.hiddenCourses}/${overview.courses}`,
      icon: BookOpen,
      tab: "courses",
    },
  ];

  const queue = [
    {
      tab: "projects" as Tab,
      label: "Projects to grade",
      value: overview.pendingProjects,
      icon: FolderGit2,
    },
    {
      tab: "reviews" as Tab,
      label: "Reviews to approve",
      value: overview.pendingTestimonials,
      icon: MessageSquareQuote,
    },
    {
      tab: "messages" as Tab,
      label: "Contact messages to read",
      value: overview.messages,
      icon: Mail,
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tab }) => (
          <button
            key={label}
            type="button"
            disabled={!tab}
            onClick={() => tab && onNavigate(tab)}
            className={`bg-card border-border rounded-2xl border p-4 text-left shadow-sm transition-colors ${
              tab ? "hover:border-primary/40 cursor-pointer" : "cursor-default"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="bg-brand-subtle border-primary/20 text-brand-soft flex h-8 w-8 items-center justify-center rounded-lg border">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              {tab && (
                <ArrowUpRight className="text-muted-foreground/50 h-3.5 w-3.5" aria-hidden="true" />
              )}
            </div>
            <p className="text-foreground mt-3 font-mono text-2xl font-black tracking-tight">
              {value}
            </p>
            <p className="text-muted-foreground mt-0.5 text-[11px] font-medium">{label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bg-card border-border rounded-2xl border p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-foreground text-sm font-black tracking-tight">Needs attention</h2>
            <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
              Queues
            </span>
          </div>
          {queue.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
              <CheckCircle2 className="text-success h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-muted-foreground text-xs">
                All clear — no projects, reviews or messages waiting.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {queue.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => onNavigate(item.tab)}
                  className="border-border hover:border-primary/40 hover:bg-accent/40 flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <item.icon className="text-brand-soft h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="text-foreground truncate text-xs font-bold">{item.label}</span>
                  </span>
                  <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                    {item.value}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
          <h2 className="text-foreground text-sm font-black tracking-tight">Quality</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Average rating
              </p>
              <p className="text-foreground mt-1 font-mono text-2xl font-black">
                {overview.averageRating !== null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="fill-gold text-gold h-4 w-4" aria-hidden="true" />
                    {overview.averageRating}
                  </span>
                ) : (
                  "—"
                )}
              </p>
              <p className="text-muted-foreground text-[11px]">
                across {overview.reviews} student review{overview.reviews === 1 ? "" : "s"}
              </p>
            </div>
            <div className="border-border border-t pt-3">
              <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Published stories
              </p>
              <p className="text-foreground mt-1 font-mono text-2xl font-black">
                {overview.publishedTestimonials}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Project grading ───────────────────────────

function ProjectsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "projects"], queryFn: () => adminProjectsFn() });
  const [filter, setFilter] = useState<"pending" | "all" | "approved" | "changes_requested">(
    "pending",
  );
  const [reviewing, setReviewing] = useState<{
    id: string;
    student: string;
    course: string;
    status: "approved" | "changes_requested";
  } | null>(null);
  const [feedback, setFeedback] = useState("");

  const review = useMutation({
    mutationFn: () =>
      adminReviewProjectFn({
        data: { submissionId: reviewing!.id, status: reviewing!.status, feedback },
      }),
    onSuccess: async () => {
      toast.success(reviewing?.status === "approved" ? "Project approved." : "Changes requested.");
      setReviewing(null);
      setFeedback("");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Review failed."),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((p) => p.status === filter);
  }, [data, filter]);

  if (!data) return <TabSkeleton />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No project submissions yet"
        description="When students finish their lessons and submit a capstone project, it lands here for grading."
      />
    );
  }

  const pendingCount = data.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-foreground text-base font-black tracking-tight">
            Capstone grading queue
          </h2>
          <p className="text-muted-foreground text-xs">
            {pendingCount} awaiting review · {data.length} total submission
            {data.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {(
            [
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["changes_requested", "Changes"],
              ["all", "All"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                filter === id
                  ? "border-primary/40 bg-brand-subtle text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
          <CheckCircle2 className="text-success mx-auto h-6 w-6" aria-hidden="true" />
          <p className="text-foreground mt-2 text-sm font-bold">Nothing in this queue</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Switch the filter to see other submissions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filtered.map((p) => {
            const badge =
              p.status === "approved"
                ? { label: "Approved", cls: "border-success/40 text-success" }
                : p.status === "changes_requested"
                  ? { label: "Changes requested", cls: "border-destructive/40 text-destructive" }
                  : { label: "Pending review", cls: "border-primary/40 text-brand-soft" };
            return (
              <div
                key={p.id}
                className="bg-card border-border flex flex-col rounded-2xl border p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-xs font-bold">
                      {p.studentName}{" "}
                      <span className="text-muted-foreground font-normal">· {p.studentEmail}</span>
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                      {p.courseTitle} · {formatDate(p.submittedAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-soft mt-2.5 block truncate text-xs font-bold hover:underline"
                >
                  {p.link}
                </a>
                {p.notes && (
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-[11px] leading-relaxed">
                    {p.notes}
                  </p>
                )}
                {p.feedback && (
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-[11px] italic">
                    Feedback: {p.feedback}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  <Button
                    size="sm"
                    className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                    onClick={() => {
                      setFeedback(p.feedback ?? "");
                      setReviewing({
                        id: p.id,
                        student: p.studentName,
                        course: p.courseTitle,
                        status: "approved",
                      });
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                    onClick={() => {
                      setFeedback(p.feedback ?? "");
                      setReviewing({
                        id: p.id,
                        student: p.studentName,
                        course: p.courseTitle,
                        status: "changes_requested",
                      });
                    }}
                  >
                    Request changes
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                  >
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      Open submission
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={reviewing !== null} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewing?.status === "approved" ? "Approve project" : "Request changes"}
            </DialogTitle>
            <DialogDescription>
              {reviewing?.student} · {reviewing?.course}. Your feedback appears in the
              student&apos;s dashboard and learning room.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder={
              reviewing?.status === "approved"
                ? "Great work! What stood out…"
                : "What should the student improve before resubmitting?"
            }
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button
              disabled={
                review.isPending ||
                (reviewing?.status === "changes_requested" && feedback.trim().length === 0)
              }
              onClick={() => review.mutate()}
            >
              {review.isPending
                ? "Saving…"
                : reviewing?.status === "approved"
                  ? "Approve & send feedback"
                  : "Send change request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────── Reviews & stories (approvals) ───────────────────────

function ReviewsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: () => adminTestimonialsFn(),
  });
  const [filter, setFilter] = useState<"pending" | "published" | "all">("pending");

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    await queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const setStatus = useMutation({
    mutationFn: (input: { testimonialId: string; status: "pending" | "published" | "hidden" }) =>
      adminSetTestimonialStatusFn({ data: input }),
    onSuccess: async (_r, v) => {
      toast.success(
        v.status === "published"
          ? "Published to the homepage."
          : v.status === "hidden"
            ? "Hidden from the homepage."
            : "Moved back to pending.",
      );
      await invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed."),
  });

  const remove = useMutation({
    mutationFn: (testimonialId: string) => adminDeleteTestimonialFn({ data: { testimonialId } }),
    onSuccess: async () => {
      toast.success("Review deleted.");
      await invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed."),
  });

  if (!data) return <TabSkeleton />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title="No student reviews yet"
        description="When students rate a course and share their story after certification, it appears here for approval before going on the homepage."
      />
    );
  }

  const filtered = data.filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return t.status === "pending";
    return t.status === "published";
  });
  const pendingCount = data.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-foreground text-base font-black tracking-tight">
            Course review approvals
          </h2>
          <p className="text-muted-foreground text-xs">
            {pendingCount} pending · {data.length} total. Course ratings show on course pages
            instantly; stories need your approval.
          </p>
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {(
            [
              ["pending", `Pending (${pendingCount})`],
              ["published", "Published"],
              ["all", "All"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                filter === id
                  ? "border-primary/40 bg-brand-subtle text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
          <CheckCircle2 className="text-success mx-auto h-6 w-6" aria-hidden="true" />
          <p className="text-foreground mt-2 text-sm font-bold">Nothing waiting here</p>
          <p className="text-muted-foreground mt-1 text-xs">
            New student stories will appear in this queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filtered.map((t) => {
            const badge =
              t.status === "published"
                ? { label: "Published", cls: "border-success/40 text-success" }
                : t.status === "pending"
                  ? { label: "Pending approval", cls: "border-primary/40 text-brand-soft" }
                  : { label: "Hidden", cls: "border-border text-muted-foreground" };
            return (
              <div key={t.id} className="bg-card border-border rounded-2xl border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-xs font-bold">{t.name}</p>
                    <p className="text-muted-foreground truncate text-[11px]">
                      {t.role}
                      {t.courseTitle ? ` · ${t.courseTitle}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <blockquote className="text-muted-foreground mt-2.5 line-clamp-4 text-xs leading-relaxed">
                  “{t.quote}”
                </blockquote>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.status !== "published" && (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                      disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ testimonialId: t.id, status: "published" })}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Approve & publish
                    </Button>
                  )}
                  {t.status !== "hidden" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                      disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ testimonialId: t.id, status: "hidden" })}
                    >
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hide
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-8 rounded-lg px-2.5 text-[11px] font-bold"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── Messages ─────────────────────────────

function MessagesTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "messages"], queryFn: () => adminMessagesFn() });

  const remove = useMutation({
    mutationFn: (messageId: string) => adminDeleteMessageFn({ data: { messageId } }),
    onSuccess: async () => {
      toast.success("Message deleted.");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed."),
  });

  if (!data) return <TabSkeleton />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Inbox zero"
        description="Messages from the contact page land here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-foreground text-base font-black tracking-tight">Contact messages</h2>
      {data.map((m) => (
        <div key={m.id} className="bg-card border-border rounded-2xl border p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-foreground text-xs font-bold">{m.name}</p>
              <a
                href={`mailto:${m.email}`}
                className="text-brand-soft text-[11px] font-bold hover:underline"
              >
                {m.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[11px]">{formatDate(m.createdAt)}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive h-8 rounded-lg px-2 text-xs font-bold"
                disabled={remove.isPending}
                onClick={() => remove.mutate(m.id)}
                aria-label={`Delete message from ${m.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed whitespace-pre-line">
            {m.message}
          </p>
          <div className="mt-3">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-lg text-[11px] font-bold"
            >
              <a href={`mailto:${m.email}?subject=Your%20message%20to%20Najeeb%20Academy`}>
                <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Reply by email
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────── Students ─────────────────────────────

function StudentsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "students"], queryFn: () => adminStudentsFn() });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState("");

  const deleteStudent = useMutation({
    mutationFn: (userId: string) => adminDeleteStudentFn({ data: { userId } }),
    onSuccess: async () => {
      toast.success("Student account deleted.");
      setConfirmDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed."),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (row) =>
        row.user.name.toLowerCase().includes(term) || row.user.email.toLowerCase().includes(term),
    );
  }, [data, search]);

  if (!data) return <TabSkeleton />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No students yet"
        description="Every account created on the signup page will appear here with enrollments, certificates and project activity."
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-foreground text-base font-black tracking-tight">
            Students{" "}
            <span className="text-muted-foreground font-mono text-xs font-bold">
              ({data.length})
            </span>
          </h2>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            aria-label="Search students"
            className="h-9 w-full max-w-xs rounded-lg text-xs"
          />
        </div>
        <div className="bg-card border-border overflow-x-auto rounded-2xl border shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b font-mono text-[10px] tracking-wider uppercase">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Courses</th>
                <th className="px-4 py-3 font-medium">Certs</th>
                <th className="px-4 py-3 font-medium">Projects</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.user.id} className="border-border/60 border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-foreground text-xs font-bold">{row.user.name}</p>
                    <p className="text-muted-foreground text-[11px]">{row.user.email}</p>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-[11px]">
                    {row.joinedAt ? formatDate(row.joinedAt) : "—"}
                  </td>
                  <td className="text-foreground px-4 py-3 font-mono text-xs font-bold">
                    {row.enrollmentCount}
                  </td>
                  <td className="text-foreground px-4 py-3 font-mono text-xs font-bold">
                    {row.certificateCount}
                  </td>
                  <td className="text-foreground px-4 py-3 font-mono text-xs font-bold">
                    {row.projectCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive h-8 rounded-lg px-2 text-[11px] font-bold"
                      onClick={() => setConfirmDelete({ id: row.user.id, name: row.user.name })}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-muted-foreground p-6 text-center text-xs">
              No students match “{search}”.
            </p>
          )}
        </div>
      </div>

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {confirmDelete?.name}?</DialogTitle>
            <DialogDescription>
              This permanently removes the account with all enrollments, watch progress,
              certificates, projects and reviews. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteStudent.isPending}
              onClick={() => confirmDelete && deleteStudent.mutate(confirmDelete.id)}
            >
              {deleteStudent.isPending ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ───────────────────────────── Courses ─────────────────────────────

function CoursesTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "courses"], queryFn: () => adminCoursesFn() });
  const [editing, setEditing] = useState<{
    id: string;
    title: string;
    summary: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    await queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const setHidden = useMutation({
    mutationFn: (input: { courseId: string; hidden: boolean }) =>
      adminSetCourseHiddenFn({ data: input }),
    onSuccess: async (_r, v) => {
      toast.success(v.hidden ? "Course hidden from the catalog." : "Course is live again.");
      await invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed."),
  });

  const setDeleted = useMutation({
    mutationFn: (input: { courseId: string; deleted: boolean }) =>
      adminSetCourseDeletedFn({ data: input }),
    onSuccess: async (_r, v) => {
      toast.success(
        v.deleted ? "Course deleted — you can restore it anytime." : "Course restored.",
      );
      await invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed."),
  });

  const setFeatured = useMutation({
    mutationFn: (input: { courseId: string; isFeatured: boolean }) =>
      adminUpdateCourseFn({ data: input }),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed."),
  });

  const saveEdit = useMutation({
    mutationFn: () =>
      adminUpdateCourseFn({
        data: {
          courseId: editing!.id,
          title: editing!.title,
          summary: editing!.summary,
        },
      }),
    onSuccess: async () => {
      toast.success("Course updated.");
      setEditing(null);
      await invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed."),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((course) => course.title.toLowerCase().includes(term));
  }, [data, search]);

  if (!data) return <TabSkeleton />;

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-foreground text-base font-black tracking-tight">
            Course catalog{" "}
            <span className="text-muted-foreground font-mono text-xs font-bold">
              ({data.filter((c) => !c.deleted).length} live)
            </span>
          </h2>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            aria-label="Search courses"
            className="h-9 w-full max-w-xs rounded-lg text-xs"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((course) => (
            <div
              key={course.id}
              className={`bg-card border-border flex items-center gap-3 rounded-2xl border p-3 shadow-sm ${
                course.deleted ? "opacity-50" : ""
              }`}
            >
              <img
                src={course.image}
                alt=""
                loading="lazy"
                className="hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {course.deleted ? (
                    <Badge variant="destructive" className="text-[9px]">
                      Deleted
                    </Badge>
                  ) : !course.isPublished ? (
                    <Badge variant="secondary" className="text-[9px]">
                      Hidden
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-success text-[9px]">
                      Live
                    </Badge>
                  )}
                  {course.isFeatured && (
                    <Badge variant="secondary" className="text-gold text-[9px]">
                      Featured
                    </Badge>
                  )}
                </div>
                <h3 className="text-foreground mt-1 truncate text-xs font-bold">{course.title}</h3>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  {course.enrollmentCount} enrolled
                  {course.ratingAvg !== null && ` · ★ ${course.ratingAvg} (${course.ratingCount})`}
                  {` · ${course.lessonCount} lessons`}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-2 text-[11px] font-bold"
                  onClick={() =>
                    setEditing({ id: course.id, title: course.title, summary: course.summary })
                  }
                  aria-label={`Edit ${course.title}`}
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-2 text-[11px] font-bold"
                  disabled={setHidden.isPending || course.deleted}
                  onClick={() =>
                    setHidden.mutate({ courseId: course.id, hidden: course.isPublished })
                  }
                  aria-label={
                    course.isPublished ? `Hide ${course.title}` : `Unhide ${course.title}`
                  }
                >
                  {course.isPublished ? (
                    <EyeOff className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3 w-3" aria-hidden="true" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-2 text-[11px] font-bold"
                  disabled={setFeatured.isPending || course.deleted}
                  onClick={() =>
                    setFeatured.mutate({ courseId: course.id, isFeatured: !course.isFeatured })
                  }
                  aria-label={
                    course.isFeatured ? `Unfeature ${course.title}` : `Feature ${course.title}`
                  }
                >
                  <Star
                    className={`h-3 w-3 ${course.isFeatured ? "fill-gold text-gold" : ""}`}
                    aria-hidden="true"
                  />
                </Button>
                {course.deleted ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg px-2 text-[11px] font-bold"
                    disabled={setDeleted.isPending}
                    onClick={() => setDeleted.mutate({ courseId: course.id, deleted: false })}
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span className="hidden sm:inline">Restore</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-8 rounded-lg px-2 text-[11px] font-bold"
                    disabled={setDeleted.isPending}
                    onClick={() => setDeleted.mutate({ courseId: course.id, deleted: true })}
                    aria-label={`Delete ${course.title}`}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground p-6 text-center text-xs">
              No courses match “{search}”.
            </p>
          )}
        </div>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit course</DialogTitle>
            <DialogDescription>
              Changes go live immediately across the catalog and course page. Courses are unlocked
              with pass credits — there is no per-course price to edit.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-summary">Summary</Label>
                <Textarea
                  id="edit-summary"
                  rows={3}
                  value={editing.summary}
                  onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={saveEdit.isPending} onClick={() => saveEdit.mutate()}>
              {saveEdit.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TabSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border-border h-28 animate-pulse rounded-2xl border" />
      ))}
    </div>
  );
}
