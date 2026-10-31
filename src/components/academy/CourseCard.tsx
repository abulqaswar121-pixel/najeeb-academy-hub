import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, Infinity as InfinityIcon } from "lucide-react";

import { categoryBySlug } from "../../data/categories";
import type { CourseRecord } from "../../server/types";
import { Badge } from "../ui/badge";

export function CourseCard({
  course,
  priority = false,
}: {
  course: CourseRecord;
  priority?: boolean;
}) {
  const category = categoryBySlug(course.category);
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group bg-card border-border hover:border-primary/45 flex h-full flex-col overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="bg-surface relative aspect-[16/9] overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="from-primary/50 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-card/90 border-border backdrop-blur">
            {category?.shortName ?? course.category}
          </Badge>
        </div>
        <span className="bg-primary/85 text-primary-foreground absolute right-3 bottom-3 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase backdrop-blur">
          {course.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-foreground group-hover:text-brand-soft line-clamp-2 text-base font-bold transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 flex-1 text-sm leading-relaxed">
          {course.summary}
        </p>

        <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <BookOpen className="text-brand-soft h-3.5 w-3.5" aria-hidden="true" />
            {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="text-brand-soft h-3.5 w-3.5" aria-hidden="true" />
            {course.duration}
          </span>
        </div>

        <div className="border-border/80 mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <span className="text-brand-soft inline-flex min-w-0 items-start gap-1.5 text-[10px] leading-snug font-bold tracking-wide uppercase">
            <InfinityIcon className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
            Included in All-Access or 1 Course Credit
          </span>
          <ArrowRight
            className="text-foreground h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
