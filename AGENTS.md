<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Payments use Paystack via server-only `PAYSTACK_SECRET_KEY`; when set, paid courses enroll only after `confirmCheckout` verifies the transaction amount and user — never trust the client callback alone.
- Root shell picks chrome by path: portal paths hide promo bar, footer and assistant; only `/` gets the full footer.
- Academy operations use permanent Cloud storage only and request-scoped cookie sessions; never fall back to the legacy local backend or store caller tokens in module globals, to prevent data loss and cross-user access.
- Admin access is checked through protected user_roles via is_admin(), never editable profile fields, to prevent self-promotion.
- Pass redemption and course unlocks use locked database functions; only verified payments can add credits, and missing payment keys never grant free enrollment.
- Service worker (vite-plugin-pwa generateSW, output to dist/client) is registered only from src/lib/pwa.ts, which refuses dev, iframes and preview hosts; offline course notes live in browser storage via src/lib/offline-courses.ts and only include notes the student already unlocked — keeps previews uncached and lesson gating intact.
- Course completion order is quiz → NDH assignment → admin approval; certificates are issued only by the admin_review_project database function, never by students or the quiz, so nobody can self-certify.
