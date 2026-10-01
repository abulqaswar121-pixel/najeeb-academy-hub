# Najeeb Academy — academy.ndh.com.ng

The standalone AI-skills learning platform of **Najeeb Digital Hub (NDH)**, sister product to
[NDH Agency](https://agency.ndh.com.ng). Learners browse a 60-course catalog of practical AI
skills, enroll, work through hands-on lessons, pass a final assessment, ship a capstone project
and earn a **signed, publicly verifiable certificate**.

## Stack

- **TanStack Start v1** (React 19, SSR) + Vite — file-based routing in `src/routes/`
- **@tanstack/react-router** + **@tanstack/react-query** + `createServerFn` server functions
- **Tailwind CSS v4** (`src/styles.css`, `@theme inline` semantic tokens — no hardcoded colors in components)
- shadcn-style components on Radix UI, lucide-react, CVA
- **Lovable Cloud (Supabase)**: Postgres + RLS, email/password auth
- TypeScript, zod, react-hook-form — package manager: **bun**

## Backend modes

All data access flows through server functions (`src/lib/server-fns.ts` → `src/server/api.ts`):

- **Lovable Cloud (production):** activates automatically when `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_PUBLISHABLE_KEY` are present. Schema + full 60-course seed live in
  `supabase/migrations/` (apply them when enabling Cloud).
- **Local fallback (dev/preview):** without Supabase env vars, a file-backed local store
  (`.data/academy-local.json`, gitignored) serves the same catalog and powers the full
  auth → enroll → progress → certificate flow so the preview works end to end.

## Content pipeline

Courses/lessons/testimonials are **data-driven**, sourced from the NDH Academy 60-course
bundle in `content/bundle/`:

- `content/bundle/coursesData.verified.json` — the bundle catalog with every YouTube video
  verified live (2026-10-01); 21 dead/invalid IDs were replaced with verified tutorials
  (flagged `videoReplaced`, originals kept in `originalVideoId`).
- `content/bundle/academy-catalog.json` (mirrored at `src/data/academy-catalog.json`) —
  the processed catalog the app consumes: 60 courses, 6 tracks, slugs, pricing tiers
  (₦15,000–₦50,000), tools, capstones and 6 guided lessons per course with notes,
  activities, reflections and watch windows.
- `content/bundle/cover_images/` — the 60 original course covers.

`src/data/courses.ts` transforms the catalog into `CourseSeed`s; `content.ts` builds the
course descriptions and HTML lesson pages (with timestamped YouTube embeds where the
bundle's chapter times match the actual video). After editing the catalog or data files:

```sh
bunx tsx scripts/generate-course-covers.ts   # covers → public/images/courses/<slug>.jpg
bunx tsx scripts/generate-seed-sql.ts        # regenerate the Supabase seed migration
```

In production, adding a course is a plain `INSERT` into `courses` + `lessons` — zero code changes.

## Pages

`/` home · `/courses` catalog (search + category filters) · `/courses/$slug` detail ·
`/pricing` · `/about` · `/faq` · `/contact` · `/login` · `/signup` · `/dashboard` (student) ·
`/learn/$slug` (course player + capstone project + final assessment) · `/admin` (admin portal) ·
`/verify` + `/verify/$code` (public certificate verification). Every route ships unique
title/description/OG metadata.

## Student portal

The learning flow in `/learn/$slug` is fully gated:

1. **Watch-locked video player** (`GatedVideoPlayer`) — youtube-nocookie embed with every
   native control removed and an interaction shield over the iframe, so there is no
   "Watch on YouTube", share button or right-click URL copy. On a first watch the student
   can rewind but never seek past the furthest point actually watched (a watchdog snaps
   playback back). A faint email watermark discourages screen-sharing.
2. **Lesson notes unlock** only after the lesson's video window is fully watched
   (server-enforced: locked lessons ship with empty `content`).
3. **Sequential lessons** — lesson N+1 unlocks when lesson N is completed; completed
   lessons stay open for revision with free seeking.
4. **Capstone project** — unlocks after all lessons; the student submits a link + notes.
5. **Final assessment** — unlocks after the project is submitted; passing (≥70%) issues
   the signed certificate instantly.
6. **Review & testimonial** — after the certificate the student rates the course (shown on
   the course page) and can optionally submit their story as a homepage testimonial, which
   stays `pending` until an admin publishes it.

## Admin portal

`/admin` (accounts with `role = 'admin'`): overview stats, student accounts (with delete),
course management (edit title/summary/price, feature, hide/unhide, soft-delete/restore),
capstone review (approve / request changes with feedback), testimonial moderation
(publish/hide/delete — pending student stories included), and the contact inbox.

Local backend seeds a default admin: `admin@ndh.com.ng` / `NdhAdmin#2026`.
On Lovable Cloud promote an account with:
`update public.profiles set role = 'admin' where email = 'you@example.com';`

## Develop

```sh
bun install
bun run dev      # http://localhost:8080
bun run build
bun run lint
```

<!-- LOVABLE:BEGIN -->

## Lovable

This repository is connected to [Lovable](https://lovable.dev). Pushes to the default branch
sync back into the Lovable editor.

<!-- LOVABLE:END -->
