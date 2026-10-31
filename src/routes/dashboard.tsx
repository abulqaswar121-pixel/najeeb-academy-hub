import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  GraduationCap,
  Infinity as InfinityIcon,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "../components/academy/EmptyState";
import { walletQuery } from "../components/academy/PassPlans";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { categoryBySlug } from "../data/categories";
import { ACADEMY_URL, formatDate, meQueryOptions, seo } from "../lib/academy";
import { fetchDashboard } from "../lib/server-fns";

const dashboardQuery = { queryKey: ["dashboard"], queryFn: () => fetchDashboard() };

export const Route = createFileRoute("/dashboard")({
  head: () =>
    seo({
      title: "Student Dashboard — Credits, Courses & Certificates",
      description:
        "Your Najeeb Academy dashboard — credit wallet, enrolled courses, lesson progress and earned certificates.",
      path: "/dashboard",
    }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(dashboardQuery),
      context.queryClient.ensureQueryData(meQueryOptions),
      context.queryClient.ensureQueryData(walletQuery),
    ]);
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useQuery(dashboardQuery);
  const { data: wallet } = useQuery(walletQuery);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={GraduationCap}
          title="Log in to see your dashboard"
          description="Your credit wallet, enrollments, lesson progress and certificates live here. Log in or create a free account to get started."
          action={
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/login" search={{ redirect: "/dashboard" }}>
                  Log in
                </Link>
              </Button>
              <Button asChild>
                <Link to="/signup" search={{ redirect: "/dashboard" }}>
                  Create free account
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const { user, enrollments, certificates, projects } = data;
  const inProgress = enrollments.filter((e) => !e.certificate);
  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const pendingProjects = projects.filter((p) => p.status === "pending").length;

  const allAccess = Boolean(wallet?.allAccess);
  const creditsTotal = wallet?.creditsTotal ?? 0;
  const creditsUsed = wallet?.creditsUsed ?? 0;
  const creditsLeft = Math.max(0, creditsTotal - creditsUsed);
  const creditPct =
    creditsTotal > 0 ? Math.round(((creditsTotal - creditsLeft) / creditsTotal) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Greeting ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
            Student dashboard
          </p>
          <h1 className="text-foreground mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {enrollments.length} enrolled · {completedCount} completed · {certificates.length}{" "}
            certificate{certificates.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <Link to="/pricing">
              <Ticket className="h-4 w-4" aria-hidden="true" /> Passes
            </Link>
          </Button>
          <Button asChild className="rounded-xl font-bold">
            <Link to="/courses">
              <Search className="h-4 w-4" aria-hidden="true" /> Browse courses
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Credit wallet + snapshot ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-label="Credit wallet">
        <div className="band-dark relative overflow-hidden rounded-3xl border border-border shadow-2xl lg:col-span-2">
          <div className="bg-grid-pattern absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="hero-glow -top-24 -right-16 h-[240px] w-[380px]" aria-hidden="true" />
          <div className="relative z-10 space-y-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                  Credit wallet
                </p>
                {allAccess ? (
                  <>
                    <div className="border-gold/50 bg-gold/15 text-gold mt-2 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-black tracking-wider uppercase">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      All-Access VIP Member
                    </div>
                    <p className="text-foreground mt-3 flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
                      <InfinityIcon className="text-brand-soft h-7 w-7" aria-hidden="true" />
                      Every course unlocked
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      All 60+ courses plus every future release — no credits to count.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-foreground mt-2 flex items-end gap-2 font-mono text-4xl font-black tracking-tight sm:text-5xl">
                      {creditsLeft}
                      <span className="text-muted-foreground mb-1 text-sm font-bold">
                        credit{creditsLeft === 1 ? "" : "s"} remaining
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {creditsTotal === 0
                        ? "No credits yet — buy a pass to unlock your first course."
                        : `${creditsUsed} of ${creditsTotal} credits used · credits never expire.`}
                    </p>
                  </>
                )}
              </div>
              <Ticket className="text-brand-soft/40 h-9 w-9 shrink-0" aria-hidden="true" />
            </div>

            {!allAccess && (
              <div className="space-y-2">
                <div className="text-muted-foreground flex justify-between font-mono text-[10px] tracking-wider uppercase">
                  <span>Wallet usage</span>
                  <span>{creditPct}%</span>
                </div>
                <Progress value={creditPct} className="h-2" aria-label="Credits used" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                className="bg-gradient-cta shadow-glow-primary rounded-xl font-extrabold"
              >
                <Link to="/pricing">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {allAccess
                    ? "Manage your pass"
                    : creditsTotal === 0
                      ? "Get a pass"
                      : "Get More Credits"}
                </Link>
              </Button>
              <span className="text-muted-foreground text-[11px]">
                {allAccess
                  ? "All-Access is active"
                  : "Starter Pass ₦3,000 · Skill Pack ₦6,500 · Pro Track ₦12,000 · All-Access ₦25,000"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-3xl border p-6 shadow-xl">
          <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            Study snapshot
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "In progress", value: inProgress.length, icon: BookOpen },
              { label: "Completed", value: completedCount, icon: CheckCircle2 },
              { label: "Certificates", value: certificates.length, icon: Award },
              { label: "Pending projects", value: pendingProjects, icon: GraduationCap },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-brand-subtle/60 border-primary/15 rounded-2xl border p-3.5"
              >
                <stat.icon className="text-brand-soft h-4 w-4" aria-hidden="true" />
                <p className="text-foreground mt-2 font-mono text-xl font-black">{stat.value}</p>
                <p className="text-muted-foreground text-[10px] font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
          {pendingProjects > 0 && (
            <p className="text-muted-foreground mt-4 text-[11px] leading-relaxed">
              {pendingProjects} project{pendingProjects === 1 ? "" : "s"} awaiting mentor review.
            </p>
          )}
        </div>
      </section>

      {/* ── Enrolled courses ── */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-foreground text-xl font-black tracking-tight">My courses</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Pick up where you left off. Each completed course unlocks its certificate.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-brand-soft inline-flex items-center gap-1 text-xs font-bold hover:underline"
          >
            Add a course <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No enrollments yet"
            description="Pick a course from the catalog — it takes seconds, and your progress will show up here."
            action={
              <Button asChild>
                <Link to="/courses">Explore the catalog</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {enrollments.map((enrollment) => {
              const category = categoryBySlug(enrollment.course.category);
              const done = enrollment.progress === 100;
              return (
                <div
                  key={enrollment.id}
                  className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-4 shadow-lg transition-shadow hover:shadow-xl sm:flex-row sm:p-5"
                >
                  <img
                    src={enrollment.course.image}
                    alt=""
                    className="h-36 w-full shrink-0 rounded-xl object-cover sm:h-auto sm:w-32"
                    loading="lazy"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary">{category?.shortName}</Badge>
                          {done && (
                            <Badge variant="secondary" className="text-success text-[10px]">
                              <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                              Complete
                            </Badge>
                          )}
                        </div>
                        <Link
                          to="/courses/$slug"
                          params={{ slug: enrollment.course.slug }}
                          className="text-foreground hover:text-brand-soft block text-sm leading-snug font-bold transition-colors"
                        >
                          {enrollment.course.title}
                        </Link>
                      </div>
                      {enrollment.certificate && (
                        <Award className="text-gold h-5 w-5 shrink-0" aria-hidden="true" />
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="text-muted-foreground flex justify-between text-xs">
                        <span>
                          {enrollment.completedLessons}/{enrollment.course.lessonCount} lessons
                        </span>
                        <span className="text-brand-soft font-mono font-bold">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      <Button
                        asChild
                        size="sm"
                        className="rounded-lg font-bold"
                        variant={enrollment.certificate ? "outline" : "default"}
                      >
                        <Link to="/learn/$slug" params={{ slug: enrollment.course.slug }}>
                          {enrollment.certificate ? (
                            <>
                              <PlayCircle className="h-4 w-4" aria-hidden="true" /> Review course
                            </>
                          ) : done ? (
                            <>
                              <Award className="h-4 w-4" aria-hidden="true" /> Final assessment
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4" aria-hidden="true" />
                              {enrollment.progress > 0 ? "Resume Lesson" : "Start course"}
                            </>
                          )}
                        </Link>
                      </Button>
                      {enrollment.certificate && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-gold/40 text-gold hover:text-gold rounded-lg font-bold"
                        >
                          <Link to="/verify/$code" params={{ code: enrollment.certificate.code }}>
                            <Download className="h-4 w-4" aria-hidden="true" /> Download certificate
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-foreground text-xl font-black tracking-tight">My projects</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projects.map((project) => {
              const badge =
                project.status === "approved"
                  ? { label: "Approved", cls: "border-success/40 text-success" }
                  : project.status === "changes_requested"
                    ? { label: "Changes requested", cls: "border-destructive/40 text-destructive" }
                    : { label: "Awaiting review", cls: "border-primary/40 text-brand-soft" };
              return (
                <div
                  key={project.id}
                  className="bg-card border-border rounded-2xl border p-5 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-foreground text-sm font-bold">{project.courseTitle}</h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Submitted {formatDate(project.submittedAt)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-soft mt-3 block truncate text-xs font-bold hover:underline"
                  >
                    {project.link}
                  </a>
                  {project.feedback && (
                    <div className="bg-brand-subtle border-primary/25 mt-3 rounded-xl border p-3.5">
                      <p className="text-brand-soft font-mono text-[10px] tracking-wider uppercase">
                        Mentor feedback
                      </p>
                      <p className="text-foreground mt-1 text-xs leading-relaxed">
                        {project.feedback}
                      </p>
                    </div>
                  )}
                  {project.status === "changes_requested" && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-lg text-xs font-bold"
                    >
                      <Link to="/learn/$slug" params={{ slug: project.courseSlug }}>
                        Update submission
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Certificates ── */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-foreground text-xl font-black tracking-tight">My certificates</h2>
          <Link
            to="/verify"
            className="text-brand-soft inline-flex items-center gap-1 text-xs font-bold hover:underline"
          >
            Verify a certificate <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description={
              inProgress.length > 0
                ? "Finish your lessons and pass the final assessment to earn your first signed certificate."
                : "Enroll in a course, complete it, and your signed certificate will appear here."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-card border-gold/40 rounded-2xl border p-5 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gold/12 border-gold/40 text-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
                    <Award className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground text-sm font-bold">{cert.courseTitle}</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Issued {formatDate(cert.issuedAt)}
                    </p>
                    <p className="text-gold mt-1 font-mono text-xs font-bold">{cert.code}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-xs font-bold"
                  >
                    <Link to="/verify/$code" params={{ code: cert.code }}>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download certificate
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg text-xs font-bold"
                    onClick={() => {
                      navigator.clipboard.writeText(`${ACADEMY_URL}/verify/${cert.code}`);
                      toast.success("Verification link copied — share it anywhere.");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy verification link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
