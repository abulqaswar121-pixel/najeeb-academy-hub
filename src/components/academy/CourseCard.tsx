import { Link } from "@tanstack/react-router";
import { BookOpen, Clock } from "lucide-react";

import { categoryBySlug } from "../../data/categories";
import { formatPrice, useCurrency } from "../../lib/currency";
import type { CourseRecord } from "../../server/types";
import { Badge } from "../ui/badge";

export function CourseCard({
  course,
  priority = false,
}: {
  course: CourseRecord;
  priority?: boolean;
}) {
  const { currency } = useCurrency();
  const category = categoryBySlug(course.category);
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group bg-card border-border hover:border-primary/50 hover:shadow-glow-primary flex h-full flex-col overflow-hidden rounded-2xl border shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="bg-surface relative aspect-[16/9] overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/80 border-border backdrop-blur">
            {category?.shortName ?? course.category}
          </Badge>
        </div>
        <div className="absolute right-3 bottom-3">
          <Badge className="bg-primary text-primary-foreground font-mono font-bold">
            {formatPrice(course.priceNgn, currency)}
          </Badge>
        </div>
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
          <span className="border-border text-muted-foreground ml-auto rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase">
            {course.level}
          </span>
        </div>
      </div>
    </Link>
  );
}
