import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Eye,
  EyeOff,
  FolderGit2,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  MessageSquareQuote,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
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
import { formatDate, formatNaira, meQueryOptions, seo, useMe } from "../lib/academy";
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
        "Najeeb Academy admin portal — manage courses, students, project submissions, testimonials and messages.",
      path: "/admin",
    }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(meQueryOptions);
  },
  component: AdminPage,
});

type Tab = "overview" | "students" | "courses" | "projects" | "testimonials" | "messages";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "messages", label: "Messages", icon: Inbox },
];

function AdminPage() {
  const { data: me, isLoading } = useMe();
  const [tab, setTab] = useState<Tab>("overview");

  if (isLoading) return null;

  if (!me || me.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={ShieldCheck}
          title="Admin access required"
          description="This is the Najeeb Academy admin portal. Log in with an administrator account to manage courses, students, projects and testimonials."
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-brand-soft font-mono text-xs tracking-wider uppercase">Admin portal</p>
          <h1 className="text-foreground mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Run the academy, {me.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Courses, students, capstone reviews, homepage testimonials and inbox — all in one place.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="no-scrollbar mt-8 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
              tab === id
                ? "bg-brand-subtle border-primary/40 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && <OverviewTab onNavigate={setTab} />}
        {tab === "students" && <StudentsTab />}
        {tab === "courses" && <CoursesTab />}
        {tab === "projects" && <ProjectsTab />}
        {tab === "testimonials" && <TestimonialsTab />}
        {tab === "messages" && <MessagesTab />}
      </div>
    </div>
  );
}

// ───────────────────────────── Overview ─────────────────────────────

function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data } = useQuery({ queryKey: ["admin", "overview"], queryFn: () => adminOverviewFn() });
  if (!data) return <TabSkeleton />;

  const stats: { label: string; value: string; icon: typeof Users; tab?: Tab }[] = [
    { label: "Students", value: String(data.students), icon: Users, tab: "students" },
    { label: "Enrollments", value: String(data.enrollments), icon: GraduationCap },
    { label: "Certificates issued", value: String(data.certificates), icon: Award },
    {
      label: "Live courses",
      value: `${data.courses - data.hiddenCourses}/${data.courses}`,
      icon: BookOpen,
      tab: "courses",
    },
    {
      label: "Projects awaiting review",
      value: String(data.pendingProjects),
      icon: FolderGit2,
      tab: "projects",
    },
    {
      label: "Testimonials pending",
      value: String(data.pendingTestimonials),
      icon: MessageSquareQuote,
      tab: "testimonials",
    },
    { label: "Inbox messages", value: String(data.messages), icon: Inbox, tab: "messages" },
    {
      label: "Average course rating",
      value: data.averageRating !== null ? `${data.averageRating}/5 (${data.reviews})` : "—",
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tab }) => (
        <button
          key={label}
          type="button"
          disabled={!tab}
          onClick={() => tab && onNavigate(tab)}
          className={`bg-card border-border rounded-2xl border p-5 text-left shadow-xl transition-colors ${
            tab ? "hover:border-primary/40 cursor-pointer" : "cursor-default"
          }`}
        >
          <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-10 w-10 items-center justify-center rounded-xl border">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-foreground mt-4 text-2xl font-black tracking-tight">{value}</p>
          <p className="text-muted-foreground mt-1 text-xs font-medium">{label}</p>
        </button>
      ))}
    </div>
  );
}

// ───────────────────────────── Students ─────────────────────────────

function StudentsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "students"], queryFn: () => adminStudentsFn() });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const deleteStudent = useMutation({
    mutationFn: (userId: string) => adminDeleteStudentFn({ data: { userId } }),
    onSuccess: async () => {
      toast.success("Student account deleted.");
      setConfirmDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed."),
  });

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
      <div className="bg-card border-border overflow-x-auto rounded-2xl border shadow-xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b font-mono text-[10px] tracking-wider uppercase">
              <th className="px-5 py-3.5 font-medium">Student</th>
              <th className="px-5 py-3.5 font-medium">Joined</th>
              <th className="px-5 py-3.5 font-medium">Enrollments</th>
              <th className="px-5 py-3.5 font-medium">Certificates</th>
              <th className="px-5 py-3.5 font-medium">Projects</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.user.id} className="border-border/60 border-b last:border-0">
                <td className="px-5 py-4">
                  <p className="text-foreground font-bold">{row.user.name}</p>
                  <p className="text-muted-foreground text-xs">{row.user.email}</p>
                </td>
                <td className="text-muted-foreground px-5 py-4 text-xs">
                  {row.joinedAt ? formatDate(row.joinedAt) : "—"}
                </td>
                <td className="text-foreground px-5 py-4 font-mono text-xs font-bold">
                  {row.enrollmentCount}
                </td>
                <td className="text-foreground px-5 py-4 font-mono text-xs font-bold">
                  {row.certificateCount}
                </td>
                <td className="text-foreground px-5 py-4 font-mono text-xs font-bold">
                  {row.projectCount}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive rounded-lg text-xs font-bold"
                    onClick={() => setConfirmDelete({ id: row.user.id, name: row.user.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    priceNgn: number;
  } | null>(null);

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
          priceNgn: editing!.priceNgn,
        },
      }),
    onSuccess: async () => {
      toast.success("Course updated.");
      setEditing(null);
      await invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed."),
  });

  if (!data) return <TabSkeleton />;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.map((course) => (
          <div
            key={course.id}
            className={`bg-card border-border flex gap-4 rounded-2xl border p-4 shadow-xl ${
              course.deleted ? "opacity-50" : ""
            }`}
          >
            <img
              src={course.image}
              alt=""
              loading="lazy"
              className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {course.deleted ? (
                  <Badge variant="destructive" className="text-[10px]">
                    Deleted
                  </Badge>
                ) : !course.isPublished ? (
                  <Badge variant="secondary" className="text-[10px]">
                    Hidden
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-success text-[10px]">
                    Live
                  </Badge>
                )}
                {course.isFeatured && (
                  <Badge variant="secondary" className="text-gold text-[10px]">
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="text-foreground mt-1.5 truncate text-sm font-bold">{course.title}</h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {formatNaira(course.priceNgn)} · {course.enrollmentCount} enrolled
                {course.ratingAvg !== null && ` · ★ ${course.ratingAvg} (${course.ratingCount})`}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                  onClick={() =>
                    setEditing({
                      id: course.id,
                      title: course.title,
                      summary: course.summary,
                      priceNgn: course.priceNgn,
                    })
                  }
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                  disabled={setHidden.isPending || course.deleted}
                  onClick={() =>
                    setHidden.mutate({ courseId: course.id, hidden: course.isPublished })
                  }
                >
                  {course.isPublished ? (
                    <>
                      <EyeOff className="h-3 w-3" aria-hidden="true" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" aria-hidden="true" /> Unhide
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                  disabled={setFeatured.isPending || course.deleted}
                  onClick={() =>
                    setFeatured.mutate({ courseId: course.id, isFeatured: !course.isFeatured })
                  }
                >
                  <Star
                    className={`h-3 w-3 ${course.isFeatured ? "fill-gold text-gold" : ""}`}
                    aria-hidden="true"
                  />
                  {course.isFeatured ? "Unfeature" : "Feature"}
                </Button>
                {course.deleted ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg px-2.5 text-[11px] font-bold"
                    disabled={setDeleted.isPending}
                    onClick={() => setDeleted.mutate({ courseId: course.id, deleted: false })}
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" /> Restore
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-8 rounded-lg px-2.5 text-[11px] font-bold"
                    disabled={setDeleted.isPending}
                    onClick={() => setDeleted.mutate({ courseId: course.id, deleted: true })}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" /> Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit course</DialogTitle>
            <DialogDescription>
              Changes go live immediately across the catalog, course page and checkout.
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
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₦)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min={0}
                  step={500}
                  value={editing.priceNgn}
                  onChange={(e) =>
                    setEditing({ ...editing, priceNgn: Math.max(0, Number(e.target.value)) })
                  }
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

// ───────────────────────────── Projects ─────────────────────────────

function ProjectsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "projects"], queryFn: () => adminProjectsFn() });
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

  if (!data) return <TabSkeleton />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No project submissions yet"
        description="When students finish their lessons and submit a capstone project, it lands here for review."
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.map((p) => {
          const badge =
            p.status === "approved"
              ? { label: "Approved", cls: "border-success/40 text-success" }
              : p.status === "changes_requested"
                ? { label: "Changes requested", cls: "border-destructive/40 text-destructive" }
                : { label: "Pending review", cls: "border-primary/40 text-brand-soft" };
          return (
            <div key={p.id} className="bg-card border-border rounded-2xl border p-5 shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-bold">
                    {p.studentName}{" "}
                    <span className="text-muted-foreground font-normal">· {p.studentEmail}</span>
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {p.courseTitle} · submitted {formatDate(p.submittedAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${badge.cls}`}
                >
                  {badge.label}
                </span>
              </div>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-soft mt-3 block text-xs font-bold break-all hover:underline"
              >
                {p.link}
              </a>
              {p.notes && (
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{p.notes}</p>
              )}
              {p.feedback && (
                <p className="text-muted-foreground mt-2 text-xs italic">
                  Your feedback: {p.feedback}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-lg text-xs font-bold"
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
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs font-bold"
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
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={reviewing !== null} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewing?.status === "approved" ? "Approve project" : "Request changes"}
            </DialogTitle>
            <DialogDescription>
              {reviewing?.student} · {reviewing?.course}. Your feedback appears in the student's
              dashboard and course player.
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
    </>
  );
}

// ─────────────────────────── Testimonials ───────────────────────────

function TestimonialsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: () => adminTestimonialsFn(),
  });

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
      toast.success("Testimonial deleted.");
      await invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed."),
  });

  if (!data) return <TabSkeleton />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title="No testimonials yet"
        description="When students share their story after finishing a course, it appears here for approval before going on the homepage."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.map((t) => {
        const badge =
          t.status === "published"
            ? { label: "Published", cls: "border-success/40 text-success" }
            : t.status === "pending"
              ? { label: "Pending approval", cls: "border-primary/40 text-brand-soft" }
              : { label: "Hidden", cls: "border-border text-muted-foreground" };
        return (
          <div key={t.id} className="bg-card border-border rounded-2xl border p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-foreground text-sm font-bold">{t.name}</p>
                <p className="text-muted-foreground text-xs">
                  {t.role}
                  {t.courseTitle ? ` · ${t.courseTitle}` : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${badge.cls}`}
              >
                {badge.label}
              </span>
            </div>
            <blockquote className="text-muted-foreground mt-3 text-sm leading-relaxed">
              “{t.quote}”
            </blockquote>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.status !== "published" && (
                <Button
                  size="sm"
                  className="rounded-lg text-xs font-bold"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ testimonialId: t.id, status: "published" })}
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Publish to homepage
                </Button>
              )}
              {t.status !== "hidden" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs font-bold"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ testimonialId: t.id, status: "hidden" })}
                >
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hide
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive rounded-lg text-xs font-bold"
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
    <div className="space-y-4">
      {data.map((m) => (
        <div key={m.id} className="bg-card border-border rounded-2xl border p-5 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-foreground text-sm font-bold">{m.name}</p>
              <a
                href={`mailto:${m.email}`}
                className="text-brand-soft text-xs font-bold hover:underline"
              >
                {m.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">{formatDate(m.createdAt)}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive h-8 rounded-lg px-2 text-xs font-bold"
                disabled={remove.isPending}
                onClick={() => remove.mutate(m.id)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-line">
            {m.message}
          </p>
        </div>
      ))}
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border-border h-36 animate-pulse rounded-2xl border" />
      ))}
    </div>
  );
}
