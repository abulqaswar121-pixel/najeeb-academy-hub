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
