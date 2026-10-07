import { courses as catalog } from "../data/courses";
import { testimonials, type TestimonialSeed } from "../data/testimonials";

/**
 * Graduate stories — derived from the same testimonial dataset that seeds the
 * marketing site, with stable URL slugs for the dossier pages.
 */

export type Story = TestimonialSeed & { slug: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const stories: Story[] = testimonials.map((entry) => ({
  ...entry,
  slug: slugify(entry.name),
}));

export function storyBySlug(slug: string): Story | undefined {
  return stories.find((story) => story.slug === slug);
}

export function courseForStory(story: Story) {
  if (!story.courseSlug) return null;
  return catalog.find((course) => course.slug === story.courseSlug) ?? null;
}
