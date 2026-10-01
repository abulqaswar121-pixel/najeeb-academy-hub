# Najeeb Academy — Pre-Publish Checklist

Current state: security scan is clean, the site is not yet published, and visibility is set to public. The blank-screen fix from the last session is built and green in the preview but has not been published yet.

## 1. Verify the blank-screen fix end to end
- Open the preview and click through: home → course catalog → a course page → a lesson page (`/learn/...`) → login/signup.
- Confirm no blank screen and no console errors. This is the bug that took the site down last time, so it gets checked first.

## 2. Add the missing sitemap
- `public/robots.txt` already points to `https://academy.ndh.com.ng/sitemap.xml`, but no sitemap exists — search engines would hit a dead link.
- Add a `sitemap.xml` route that lists the home page, courses, pricing, about, FAQ, contact, and all 60 course pages.

## 3. Page titles and descriptions
- Home, courses, and pricing already have proper titles and descriptions. Verify the remaining pages (about, FAQ, contact, login, signup, course detail pages) each have their own, so shared links and search results look right.

## 4. Content and branding pass
- Confirm the favicon and logo are the academy branding, not template defaults.
- Spot-check a few course pages for placeholder text, broken cover images, and correct prices in Naira.

## 5. Test the real user flow
- Sign up with a test account, enroll in a course, open a lesson, and confirm progress saves.
- Test the certificate/verification page (`/verify/...`) with a real code.
- Check the admin page loads for the admin account only.

## 6. Publish
- Publish the site (this also ships the blank-screen fix).
- After publishing, connect the custom domain **academy.ndh.com.ng** in Project Settings → Domains, and confirm the live URL loads.

## Technical details
- Sitemap: new server route `src/routes/sitemap[.]xml.tsx` returning XML built from the course catalog in `src/data/courses.ts`.
- Head metadata: per-route `head()` via the existing `seo()` helper in `src/lib/academy.ts`.
- No design changes, no new features — this is polish and verification only.
