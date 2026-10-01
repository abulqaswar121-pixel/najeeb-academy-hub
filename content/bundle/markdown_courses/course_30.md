# NDH Academy — Course 30

## Course 30: SaaS Boilerplate Launch
**Track:** AI Engineering | **Pricing:** NGN 50,000 / $69 USD
**Cover Image:** `cover_images/course_30_cover.jpg`

### 1. Course Overview & Target Audience
Launching a commercial software-as-a-service (SaaS) application requires a solid foundation of user authentication, database state management, subscription billing, webhook handling, and customer portal management. This course walks developers and technical entrepreneurs through building and deploying a complete, production-ready SaaS boilerplate using modern web frameworks (SvelteKit/Next.js), Firebase/Supabase, and Stripe.

**Who This Course Is For:**
- Full-stack developers and indie hackers wanting to launch SaaS apps in days instead of months.
- Technical founders looking for a clean, secure, production-grade starter architecture.
- Freelancers building custom paid client portals and membership platforms.
- Developers wanting to master Stripe subscription checkouts, webhooks, and billing portals.

**What You Will Produce:**
- A live, deployed SaaS Boilerplate Web Application with authentication, billing, and dashboard.
- A complete Stripe Subscription Integration with Checkout, Webhooks, and Customer Billing Portal.
- A secure Relational/NoSQL Database Schema storing user profiles and active subscription states.
- A Production Deployment & Environment Hardening Checklist.

### 2. Prerequisites & Required Tools
**Prerequisites:** Working knowledge of modern JavaScript/TypeScript, frontend frameworks (SvelteKit, Next.js, or React), and web fundamentals.
**Required Tools & Platforms:**
- Node.js 18+ and code editor (VS Code / Cursor).
- Stripe Developer Account (Stripe CLI for local webhook testing).
- Firebase / Supabase account for authentication and database.
- Vercel or Netlify account for production deployment.
**Preparation Steps:** Create a project workspace: `/src/`, `/routes/`, `/lib/stripe/`, `/lib/firebase/`, and `/docs/`. Initialize a new project and set up accounts on Stripe and Firebase/Supabase.

### 3. Video Access & Playback Modes
- **Full Course Video URL:** [https://www.youtube.com/watch?v=m9vP0kL7wQ5](https://www.youtube.com/watch?v=m9vP0kL7wQ5)
- **YouTube Video ID:** `m9vP0kL7wQ5`
- **Player Mode Support:** Continuous Full-Course Playback & Reference Lesson Jump Modes

### 4. Detailed Learning Objectives (Assessment Ready)
1. Architect, configure, and launch a complete software-as-a-service (SaaS) application foundation with authentication, database, billing, and dashboard.
2. Set up full development tooling, environment variables, state management, and reusable UI components.
3. Implement secure user authentication, session cookies, passwordless login, and protected server-side route guards.
4. Integrate Stripe Checkout to manage recurring subscription plans, free trials, tiered pricing, and discount codes.
5. Build resilient Stripe Webhook handlers to sync customer subscription status, handle failed payments, and update user access rights in real time.
6. Embed Stripe Customer Portal to allow end-users to manage payment methods, upgrade/downgrade plans, and view invoices without manual support.
7. Execute production deployment, configure DNS/custom domains, establish security best practices, and verify automated subscription lifecycle events.

### 5. Structured Lesson Breakdown (7 Lessons)
#### Lesson 1: SaaS Architecture, Tech Stack Selection & Boilerplate Setup
- **Timestamp:** `00:00` - `01:10` (0s to 70s)
- **Summary & Notes:** Introduces the SaaS boilerplate architecture. Deconstructs the core layers of modern SaaS: UI/Frontend framework, Authentication provider, Database/State layer, and Payment Processing. Explains why having a standardized boilerplate reduces time-to-market from 3 months to 3 days.
- **Practical Activity:** Diagram the architectural flow between Browser -> App Server -> Database -> Stripe API -> Stripe Webhook Handler.
- **Knowledge Check / Reflection:** Why is solving auth and billing once in a reusable boilerplate the biggest competitive advantage for solo indie developers?

#### Lesson 2: Development Environment Setup & Project Scaffolding
- **Timestamp:** `01:10` - `05:55` (70s to 355s)
- **Summary & Notes:** Covers project initialization, installing dependencies (Stripe SDK, Firebase/Supabase client, UI component libraries), configuring Tailwind CSS for styling, and setting up environment variables (`.env.local`) for development and production.
- **Practical Activity:** Initialize a new web project, install Stripe and backend database SDKs, and configure your `.env` configuration file.
- **Knowledge Check / Reflection:** Why must secret API keys never be exposed in client-side code or committed to public Git repositories?

#### Lesson 3: User Authentication, Session State & Secure Routing
- **Timestamp:** `05:55` - `31:38` (355s to 1898s)
- **Summary & Notes:** Deep dive into authentication. Implements user registration, email/password login, Google OAuth, session cookies, and server-side route guards that protect the `/dashboard` and `/account` pages from unauthenticated access.
- **Practical Activity:** Implement user authentication with Google login and verify that unauthenticated visitors are redirected to `/login`.
- **Knowledge Check / Reflection:** What are the security risks of checking authentication only on the client side versus server-side route hooks?

#### Lesson 4: Stripe Checkout Integration & Subscription Tier Management
- **Timestamp:** `31:38` - `43:15` (1898s to 2595s)
- **Summary & Notes:** Masterclass on Stripe Checkout. Demonstrates creating recurring subscription products in Stripe Dashboard, building dynamic pricing tables, creating Stripe Checkout Sessions via backend API endpoints, and redirecting users to secure checkout.
- **Practical Activity:** Create a monthly ($19/mo) and annual ($190/yr) subscription product in Stripe Test Mode and wire a working Checkout redirect button.
- **Knowledge Check / Reflection:** Why is using Stripe Hosted Checkout vastly more secure and easier to maintain than building custom credit card form inputs?

#### Lesson 5: Secure Webhook Handlers & Subscription Event Synchronization
- **Timestamp:** `43:15` - `52:05` (2595s to 3125s)
- **Summary & Notes:** Critical technical module on webhooks. Teaches how to set up an API endpoint (`/api/stripe-webhook`), verify webhook cryptographic signatures with `stripe.webhooks.constructEvent`, test webhooks locally with Stripe CLI, and update user subscription status in the database on `checkout.session.completed` and `customer.subscription.deleted`.
- **Practical Activity:** Use Stripe CLI to trigger a `checkout.session.completed` event locally and verify that your database updates the user's `isPro` status to `true`.
- **Knowledge Check / Reflection:** Why is relying on webhooks the only reliable way to handle asynchronous subscription events like renewals, chargebacks, and cancellations?

#### Lesson 6: Customer Billing Portal Configuration & Account Management
- **Timestamp:** `52:05` - `58:12` (3125s to 3492s)
- **Summary & Notes:** Walks through integrating the Stripe Customer Portal. Demonstrates creating a billing session endpoint that securely redirects logged-in subscribers to Stripe's self-serve portal where they can update payment methods, download PDF tax invoices, or cancel subscriptions.
- **Practical Activity:** Implement a 'Manage Subscription' button in your user settings dashboard that opens the Stripe Customer Portal.
- **Knowledge Check / Reflection:** How does providing a self-serve billing portal eliminate 80% of routine SaaS customer support requests?

#### Lesson 7: Production Readiness Checklist, Security Hardening & Deployment
- **Timestamp:** `58:12` - `59:17` (3492s to 3557s)
- **Summary & Notes:** Final production deployment. Covers switching from Stripe Test Mode to Live Mode, configuring production webhook endpoints, setting security headers, deploying the app to Vercel/Netlify, and running an end-to-end $1 test transaction.
- **Practical Activity:** Deploy your application to production, configure live environment variables, and verify DNS domain routing.
- **Knowledge Check / Reflection:** What are the essential post-launch health monitoring checks required on day one of a commercial SaaS launch?

### 6. Written Learning Materials & Quality Assurance
**Actionable Verification Checklist:**
- [ ] Project initialized with full frontend and backend dependencies.
- [ ] User authentication working with secure server-side route guards.
- [ ] Stripe Checkout Sessions generating valid payment URLs.
- [ ] Stripe Webhook endpoint verifying signatures and updating database.
- [ ] Stripe Customer Billing Portal redirect operational.
- [ ] Local webhook testing verified with Stripe CLI.
- [ ] Production deployment live with SSL and custom domain.

**Common Pitfalls & Fixes:**
- **Mistake:** Failing to verify Stripe webhook signatures
  - **Correction:** Accepting unverified webhook payloads, allowing malicious actors to send fake subscription events. Fix: Always use `stripe.webhooks.constructEvent` with your `STRIPE_WEBHOOK_SECRET`.
- **Mistake:** Updating database permissions on frontend redirect instead of webhook
  - **Correction:** Granting Pro access on the success URL page, which users could visit directly without paying. Fix: Only grant permissions inside the verified webhook event handler.
- **Mistake:** Hardcoding Stripe Price IDs
  - **Correction:** Hardcoding IDs into component templates. Fix: Store Price IDs in environment variables or configuration files.
- **Mistake:** Ignoring subscription cancellation events
  - **Correction:** Leaving paid access active after a user cancels in Stripe. Fix: Listen for `customer.subscription.deleted` in your webhook and set `isPro: false`.

### 7. Capstone Portfolio Project & Grading Rubric
**Project Title:** Production SaaS Boilerplate Application & Launch Suite

**Scenario:**
You are preparing to launch a micro-SaaS application. Instead of building authentication, database connections, and payment gateways from scratch for each project, you must build, document, and deploy a robust, production-grade SaaS Starter Boilerplate complete with user authentication, database integration, Stripe Checkout subscription tiers (Monthly/Annual), Stripe Webhook event handlers, and a Customer Billing Portal.

**Required Deliverables:**
1. Complete SaaS Boilerplate Codebase Repository (`/src/`, `/routes/`, `/lib/stripe/`, `/lib/db/`).
2. Live Deployed Application URL (with working user registration and Stripe test checkout).
3. Stripe Webhook Architecture & Event Handler Documentation (code listings and signature verification logic).
4. Database Schema Specification Document (Users, Subscriptions, Payments).
5. Stripe Local CLI Testing & Webhook Event Logs (demonstrating successful payment and cancellation events).
6. Production Hardening & Deployment Standard Operating Procedure (SOP).

**Submission Instructions:** Submit a comprehensive PDF Technical Architecture Dossier containing all code listings, database schemas, Stripe configuration screenshots, and live application URLs.
**File Requirements:** Single comprehensive PDF dossier (`.pdf`), codebase archive (`.zip` or GitHub repo link), and live deployed web application URL.
**Completion Standard:** Passing submissions must deliver a live, functioning SaaS application that executes end-to-end user registration, processes Stripe test checkouts, handles webhook subscription updates, and provides self-serve billing portal access.

**Grading Rubric Matrix:**

| Criterion | Weight | Required Standard & Observable Evidence |
| :--- | :--- | :--- |
| Architecture & Code Quality | 30% | Codebase is clean, modular, modern, well-commented, and implements secure server-side routing and auth. |
| Stripe Subscription & Webhook Rigor | 30% | Stripe Checkout, Webhook handlers, and Billing Portal are implemented flawlessly with strict cryptographic signature verification. |
| Database Integration & State Sync | 20% | User profile and subscription states are synchronized accurately with real-time webhook events. |
| Security Hardening & Best Practices | 10% | Environment variables are handled securely, routes are protected server-side, and database privacy rules are active. |
| Documentation & Deployment Polish | 10% | Dossier meets enterprise software engineering standards with clear deployment and configuration guides. |


---
