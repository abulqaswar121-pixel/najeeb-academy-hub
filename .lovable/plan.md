# Najeeb Academy — Full Audit & Fix Plan

Everything found while reviewing the whole app, grouped by severity, with the fix for each.

## Critical — must fix before publishing

### 1. Student data will not survive on the published site
The app has two storage backends: a real database (used only when Lovable Cloud is connected) and a fallback "local" one that keeps all users, enrollments, progress, and certificates in a temporary in-memory file. Lovable Cloud is **not connected** to this project, so the published site would run on the temporary backend — every signup, enrollment, and certificate would disappear when the server restarts.
**Fix:** Enable Lovable Cloud, then run the existing database migrations and seed (they already exist) so the published app uses real, permanent storage.

### 2. Admin email and password are written in the code
`admin@ndh.com.ng` / a literal password are hardcoded in `src/server/local-backend.ts`. Anyone who sees the code (or the synced repo) has full admin access.
**Fix:** Remove the hardcoded credentials. With Lovable Cloud enabled, the admin is a real account you create, and admin rights are granted through the database — nothing secret in the code.

### 3. Admin role is stored on the profile row
The database backend reads `role` from the user's profile record. Storing roles on the profile table is a known privilege-escalation risk.
**Fix:** Move roles to a dedicated `user_roles` table with a server-side `has_role` check (the standard secure pattern), and update the admin check to use it.

### 4. Courses have prices, but there is no payment
Every course shows a price (e.g. ₦50,000) and the pricing page promises "Secure NGN payments" — but enrolling is instant and free. As-is, anyone can take every paid course without paying.
**Fix (your choice):**
- **Option A:** Add real payments (Paystack is the natural fit for NGN) so enrollment unlocks after payment.
- **Option B:** Launch free for now — remove prices and payment promises from the pricing page, course cards, and signup copy, and add payments later.

## Bugs to fix

### 5. Lesson page hydration error
The course player (`/learn/...`) renders one thing on the server and another in the browser, producing a React hydration mismatch error (visible in the error logs). It can cause flickering or a broken first paint.
**Fix:** Switch the page's data loading to the suspense-based pattern so server and browser render identically. Same pattern check on the dashboard page.

### 6. Missing sitemap
`robots.txt` points search engines to `sitemap.xml`, which doesn't exist yet.
**Fix:** Add the sitemap once the custom domain is connected (it needs the real public address). Tracked, not forgotten.

## Polish & suggestions

### 7. Verify remaining page titles
Home, courses, and pricing have proper browser titles and share descriptions; confirm about, FAQ, contact, login, signup, and each course page do too.

### 8. End-to-end test after the fixes
Sign up a test student → enroll → watch a lesson → submit the capstone → pass the assessment → view and verify the certificate → check the admin panel. This is the full journey a real student takes.

### 9. Publish, then connect the domain
Publish the fixed app, then connect **academy.ndh.com.ng** in Project Settings → Domains. The sitemap (item 6) follows once the domain is live.

## What is already good (no action needed)
- Security scan: clean, no findings.
- The blank-screen crash from before: fixed and verified in the preview.
- Course content: all 60 courses, lessons, assessments, and cover images are in place.
- Admin panel, reviews/testimonials moderation, contact messages, certificate verification pages: built and wired.

## Suggested order
1. Enable Lovable Cloud + migrate/seed (fixes 1, and enables 2 and 3)
2. Remove hardcoded admin credentials; secure role storage (2, 3)
3. Decide payments: real Paystack checkout, or launch free (4)
4. Fix the lesson-page hydration bug (5)
5. Titles check + full student-journey test (7, 8)
6. Publish, connect academy.ndh.com.ng, add sitemap (6, 9)
