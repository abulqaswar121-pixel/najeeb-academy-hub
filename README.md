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

Courses/lessons/testimonials are **data-driven**. The canonical seed lives in `src/data/`
(courses.ts, categories.ts, testimonials.ts, content.ts). Regenerate the SQL seed after edits:

```sh
bunx tsx scripts/generate-seed-sql.ts
```

In production, adding a course is a plain `INSERT` into `courses` + `lessons` — zero code changes.

## Pages

`/` home · `/courses` catalog (search + category filters) · `/courses/$slug` detail ·
`/pricing` · `/about` · `/faq` · `/contact` · `/login` · `/signup` · `/dashboard` (student) ·
`/learn/$slug` (course player + final assessment) · `/verify` + `/verify/$code` (public
certificate verification). Every route ships unique title/description/OG metadata.

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
