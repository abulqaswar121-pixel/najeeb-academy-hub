import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SearchX, Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { CategoryIcon } from "../components/academy/CategoryIcon";
import { CourseCard } from "../components/academy/CourseCard";
import { EmptyState } from "../components/academy/EmptyState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { categories } from "../data/categories";
import { seo } from "../lib/academy";
import { fetchCourses } from "../lib/server-fns";

const coursesQuery = { queryKey: ["courses"], queryFn: () => fetchCourses() };

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/courses/")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "AI Course Catalog — 60+ Practical Courses",
      description:
        "Browse the full Najeeb Academy catalog: prompt engineering, AI content, video, design, automation, no-code apps, marketing, data and more. Prices in ₦ NGN, certificates included.",
      path: "/courses",
    }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(coursesQuery);
  },
  component: CatalogPage,
});

function CatalogPage() {
  const { data: courses = [] } = useQuery(coursesQuery);
  const { q, category } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [searchInput, setSearchInput] = useState(q ?? "");

  const filtered = useMemo(() => {
    const term = (q ?? "").trim().toLowerCase();
    return courses.filter((course) => {
      if (category && course.category !== category) return false;
      if (!term) return true;
      const haystack =
        `${course.title} ${course.summary} ${course.category} ${course.tools.join(" ")}`.toLowerCase();
      return term.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [courses, q, category]);

  const setCategory = (slug: string | undefined) => {
    navigate({ search: (prev) => ({ ...prev, category: slug }), resetScroll: false });
  };

  const submitSearch = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, q: value.trim() || undefined }), resetScroll: false });
  };

  return (
    <div className="relative">
      <div
        className="bg-grid-pattern absolute inset-x-0 top-0 h-80 opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="bg-brand-subtle border-primary/30 text-brand-soft inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            Course catalog
          </div>
          <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl">
            Every course. <span className="text-gradient-brand">Browse free.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
            {courses.length} practical AI courses across {categories.length} tracks. Search, filter,
            and open any course to see the full curriculum before you enroll.
          </p>
        </div>

        {/* Search */}
        <form
          className="flex max-w-xl gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(searchInput);
          }}
          role="search"
        >
          <div className="relative flex-1">
            <SearchIcon
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === "") submitSearch("");
              }}
              placeholder="Search courses, tools or topics…"
              className="bg-card h-11 rounded-xl pl-9"
              aria-label="Search courses"
            />
          </div>
          <Button type="submit" className="h-11 rounded-xl px-5 font-bold">
            Search
          </Button>
        </form>

        {/* Category chips */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
              !category
                ? "bg-primary border-primary text-primary-foreground shadow-glow-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            All tracks
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCategory(category === cat.slug ? undefined : cat.slug)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                category === cat.slug
                  ? "bg-primary border-primary text-primary-foreground shadow-glow-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
              {cat.shortName}
            </button>
          ))}
        </div>

        {/* Count */}
        <p
          className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          aria-live="polite"
        >
          {filtered.length} course{filtered.length === 1 ? "" : "s"}
          {category ? ` in ${categories.find((c) => c.slug === category)?.name ?? category}` : ""}
          {q ? ` matching "${q}"` : ""}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} priority={i < 4} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No courses match that search"
            description="Try a broader keyword, or clear the filters to see the full catalog — new courses are added regularly."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  navigate({ search: {}, resetScroll: false });
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
