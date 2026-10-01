import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Copy,
  GraduationCap,
  PlayCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "../components/academy/EmptyState";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { categoryBySlug } from "../data/categories";
import { ACADEMY_URL, formatDate, seo } from "../lib/academy";
import { fetchDashboard } from "../lib/server-fns";

const dashboardQuery = { queryKey: ["dashboard"], queryFn: () => fetchDashboard() };

export const Route = createFileRoute("/dashboard")({
  head: () =>
    seo({
      title: "Student Dashboard",
      description:
        "Your Najeeb Academy dashboard — enrolled courses, lesson progress and earned certificates.",
      path: "/dashboard",
    }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(dashboardQuery);
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useQuery(dashboardQuery);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={GraduationCap}
          title="Log in to see your dashboard"
          description="Your enrollments, lesson progress and certificates live here. Log in or create a free account to get started."
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

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-brand-soft font-mono text-xs tracking-wider uppercase">
            Student dashboard
          </p>
          <h1 className="text-foreground mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {enrollments.length} enrollment{enrollments.length === 1 ? "" : "s"} · {completedCount}{" "}
            completed · {certificates.length} certificate{certificates.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link to="/courses">
            <Search className="h-4 w-4" aria-hidden="true" /> Browse more courses
          </Link>
        </Button>
      </div>

      {/* Enrollments */}
      <section className="space-y-5">
        <h2 className="text-foreground text-xl font-black tracking-tight">My courses</h2>
        {enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No enrollments yet"
            description="Pick a course from the catalog — enrollment takes seconds, and your progress will show up here."
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
                  className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-xl sm:flex-row"
                >
                  <img
                    src={enrollment.course.image}
                    alt=""
                    className="h-32 w-full shrink-0 rounded-xl object-cover sm:h-auto sm:w-36"
                    loading="lazy"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="secondary" className="mb-1.5">
                          {category?.shortName}
                        </Badge>
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
                    <div className="mt-auto pt-4">
                      <Button
                        asChild
                        size="sm"
                        className={
                          done && !enrollment.certificate
                            ? "bg-gradient-cta w-full rounded-lg font-bold sm:w-auto"
                            : "w-full rounded-lg font-bold sm:w-auto"
                        }
                        variant={enrollment.certificate ? "outline" : "default"}
                      >
                        <Link to="/learn/$slug" params={{ slug: enrollment.course.slug }}>
                          {enrollment.certificate ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Review course
                            </>
                          ) : done ? (
                            <>
                              <Award className="h-4 w-4" aria-hidden="true" /> Take final assessment
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4" aria-hidden="true" />
                              {enrollment.progress > 0 ? "Resume lesson" : "Start course"}
                            </>
                          )}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Capstone projects */}
      {projects.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-foreground text-xl font-black tracking-tight">My projects</h2>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                  className="bg-card border-border rounded-2xl border p-5 shadow-xl"
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
                    <div className="bg-brand-subtle border-primary/30 mt-3 rounded-xl border p-3.5">
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

      {/* Certificates */}
      <section className="space-y-5">
        <h2 className="text-foreground text-xl font-black tracking-tight">My certificates</h2>
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
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-card border-gold/40 rounded-2xl border p-5 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gold/15 border-gold/40 text-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
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
                      View &amp; verify
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
