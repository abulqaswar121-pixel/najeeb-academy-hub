import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck,
  GraduationCap,
  Hammer,
  Lock,
  PlayCircle,
  Star,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { CourseCard } from "../components/academy/CourseCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { categoryBySlug } from "../data/categories";
import { formatNaira, meQueryOptions, seo, useMe } from "../lib/academy";
import { enrollFn, fetchCourseDetail, fetchDashboard } from "../lib/server-fns";

const detailQuery = (slug: string) => ({
  queryKey: ["course", slug],
  queryFn: () => fetchCourseDetail({ data: { slug } }),
});
const dashboardQuery = { queryKey: ["dashboard"], queryFn: () => fetchDashboard() };

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ context, params }) => {
    const detail = await context.queryClient.ensureQueryData(detailQuery(params.slug));
    if (!detail) throw notFound();
    return { title: detail.course.title, summary: detail.course.summary, slug: params.slug };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: loaderData.title,
          description: loaderData.summary,
          path: `/courses/${loaderData.slug}`,
        })
      : seo({ title: "Course", description: "Najeeb Academy course details.", path: "/courses" }),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const { data: detail } = useQuery(detailQuery(slug));
  const { data: me } = useMe();
  const { data: dashboard } = useQuery({ ...dashboardQuery, enabled: Boolean(me) });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const enroll = useMutation({
    mutationFn: (courseId: string) => enrollFn({ data: { courseId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("You're enrolled! Your course is ready in the dashboard.");
      navigate({ to: "/learn/$slug", params: { slug } });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Enrollment failed. Please try again."),
  });

  if (!detail) return null;
  const { course, lessons, related } = detail;
  const category = categoryBySlug(course.category);
  const enrollment = dashboard?.enrollments.find((e) => e.courseId === course.id);

  const handleEnroll = () => {
    if (!me) {
      toast.info("Create a free account to enroll.");
      navigate({ to: "/signup", search: { redirect: `/courses/${slug}` } });
      return;
    }
    enroll.mutate(course.id);
  };

  const outcomes = lessons.slice(0, 6).map((l) => l.title);

  return (
    <div>
      {/* Hero */}
      <section className="from-surface via-background to-background relative overflow-hidden bg-gradient-to-b">
        <div className="bg-grid-pattern absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="hero-glow top-0 right-0 h-[300px] w-[500px]" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="space-y-5 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/courses" search={{ category: course.category }}>
                <Badge
                  variant="secondary"
                  className="hover:border-primary/40 border border-transparent"
                >
                  {category?.name ?? course.category}
                </Badge>
              </Link>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {course.level}
              </Badge>
            </div>
            <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-5xl">
              {course.title}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
              {course.summary}
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-5 text-sm">
              <span className="flex items-center gap-2">
                <BookOpen className="text-brand-soft h-4 w-4" aria-hidden="true" />{" "}
                {course.lessonCount} lessons
              </span>
              <span className="flex items-center gap-2">
                <Clock className="text-brand-soft h-4 w-4" aria-hidden="true" /> {course.duration}{" "}
                of guided work
              </span>
              <span className="flex items-center gap-2">
                <Award className="text-gold h-4 w-4" aria-hidden="true" /> Signed certificate
              </span>
              {detail.ratings.count > 0 && detail.ratings.average !== null && (
                <span className="flex items-center gap-2">
                  <Star className="fill-gold text-gold h-4 w-4" aria-hidden="true" />
                  {detail.ratings.average}/5 ({detail.ratings.count} review
                  {detail.ratings.count === 1 ? "" : "s"})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {course.tools.map((tool) => (
                <span
                  key={tool}
                  className="bg-card border-border text-muted-foreground flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                >
                  <Wrench className="text-brand-soft h-3 w-3" aria-hidden="true" /> {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Enroll card */}
          <div className="lg:col-span-2">
            <div className="bg-card border-border overflow-hidden rounded-3xl border shadow-2xl">
              <div className="relative aspect-[16/9]">
                <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                <div className="from-card absolute inset-0 bg-gradient-to-t to-transparent" />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-foreground font-mono text-3xl font-black">
                      {formatNaira(course.priceNgn)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      One-time fee · lifetime access
                    </div>
                  </div>
                </div>
                {enrollment ? (
                  <Button
                    size="lg"
                    className="bg-gradient-cta shadow-glow-primary w-full rounded-xl font-extrabold"
                    onClick={() => navigate({ to: "/learn/$slug", params: { slug } })}
                  >
                    <PlayCircle className="h-5 w-5" aria-hidden="true" />
                    {enrollment.progress > 0
                      ? `Continue learning (${enrollment.progress}%)`
                      : "Start learning"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-gradient-cta shadow-glow-primary w-full rounded-xl font-extrabold transition-transform hover:scale-[1.02]"
                    onClick={handleEnroll}
                    disabled={enroll.isPending}
                  >
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    {enroll.isPending ? "Enrolling…" : "Enroll now"}
                  </Button>
                )}
                <ul className="text-muted-foreground space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="text-success h-3.5 w-3.5" aria-hidden="true" />{" "}
                    {course.lessonCount} hands-on lessons with exercises
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck className="text-success h-3.5 w-3.5" aria-hidden="true" /> Final
                    assessment (70% pass mark, unlimited retakes)
                  </li>
                  <li className="flex items-center gap-2">
                    <Hammer className="text-success h-3.5 w-3.5" aria-hidden="true" /> Practical
                    capstone project
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="text-gold h-3.5 w-3.5" aria-hidden="true" /> Signed, publicly
                    verifiable certificate
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-12 lg:col-span-2">
          {/* What you'll learn */}
          <section className="space-y-5">
            <h2 className="text-foreground text-2xl font-black tracking-tight">
              What you'll learn
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outcomes.map((item) => (
                <div
                  key={item}
                  className="bg-card/60 border-border flex items-start gap-3 rounded-xl border p-4"
                >
                  <BadgeCheck className="text-success mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="space-y-4">
            <h2 className="text-foreground text-2xl font-black tracking-tight">
              About this course
            </h2>
            {course.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                {para}
              </p>
            ))}
          </section>

          {/* Curriculum */}
          <section className="space-y-5">
            <h2 className="text-foreground text-2xl font-black tracking-tight">Curriculum</h2>
            <ol className="space-y-2">
              {lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="bg-card border-border flex items-center gap-4 rounded-xl border px-4 py-3.5"
                >
                  <span className="bg-brand-subtle border-primary/30 text-brand-soft flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold">
                    {String(lesson.position).padStart(2, "0")}
                  </span>
                  <span className="text-foreground flex-1 text-sm font-medium">{lesson.title}</span>
                  <Lock
                    className="text-muted-foreground/50 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </li>
              ))}
              <li className="bg-brand-subtle/40 border-primary/30 flex items-center gap-4 rounded-xl border px-4 py-3.5">
                <span className="bg-primary/20 border-primary/40 text-brand-soft flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                  <FileCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-foreground flex-1 text-sm font-bold">
                  Final assessment + capstone project
                </span>
                <Award className="text-gold h-4 w-4 shrink-0" aria-hidden="true" />
              </li>
            </ol>
          </section>

          {/* Capstone & requirements */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-card border-border rounded-2xl border p-6">
              <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                <Hammer className="text-brand-soft h-4 w-4" aria-hidden="true" /> Your capstone
                project
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{course.project}</p>
            </div>
            <div className="bg-card border-border rounded-2xl border p-6">
              <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                <BadgeCheck className="text-brand-soft h-4 w-4" aria-hidden="true" /> Requirements
              </h3>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed">
                <li>• A computer with a modern browser and stable internet</li>
                <li>• Free accounts on the tools used ({course.tools.slice(0, 2).join(", ")}…)</li>
                <li>
                  •{" "}
                  {course.level === "Advanced"
                    ? "Comfort with the basics from earlier courses in this track"
                    : "No prior AI experience needed"}
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Related */}
        <aside className="space-y-5">
          <h2 className="text-foreground text-xl font-black tracking-tight">Related courses</h2>
          <div className="space-y-5">
            {related.map((rc) => (
              <CourseCard key={rc.id} course={rc} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
