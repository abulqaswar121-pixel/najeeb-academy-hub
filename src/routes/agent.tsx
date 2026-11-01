import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Printer, Share2, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { paymentsQuery } from "../components/academy/PassPlans";
import { VoucherCard } from "../components/academy/VoucherCard";
import { Button } from "../components/ui/button";
import { PASS_TIERS, WHOLESALE_NGN, type PassTierId } from "../data/passes";
import { seo, useMe } from "../lib/academy";
import { confirmCheckoutFn, myVouchersFn, startVoucherCheckoutFn } from "../lib/server-fns";

export const Route = createFileRoute("/agent")({
  head: () => {
    const base = seo({
      title: "Become an NDH Academy agent",
      description: "Buy NDH Academy course PINs at agent price, resell at the official price and keep the profit.",
      path: "/agent",
    });
    return { ...base, meta: [...base.meta, { name: "robots", content: "noindex" }] };
  },
  component: AgentPage,
});

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function AgentPage() {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const { data: payments } = useQuery(paymentsQuery);
  const { data: pins = [] } = useQuery({ queryKey: ["my-vouchers"], queryFn: () => myVouchersFn(), enabled: !!me });
  const [tier, setTier] = useState<PassTierId>("starter");
  const [qty, setQty] = useState(5);
  const [view, setView] = useState<string | null>(null);

  const selected = PASS_TIERS.find((t) => t.id === tier)!;
  const total = WHOLESALE_NGN[tier] * qty;
  const profit = (selected.priceNgn - WHOLESALE_NGN[tier]) * qty;

  const buy = useMutation({
    mutationFn: () => startVoucherCheckoutFn({ data: { tier, qty, origin: window.location.origin } }),
    onSuccess: ({ url }) => (window.location.href = url),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start payment."),
  });

  const confirm = useMutation({
    mutationFn: (reference: string) => confirmCheckoutFn({ data: { reference } }),
    onSuccess: async (r) => {
      await queryClient.invalidateQueries({ queryKey: ["my-vouchers"] });
      toast.success(r.kind === "vouchers" ? `Payment received — ${r.qty} new PINs are ready below.` : "Payment received.");
      window.history.replaceState(null, "", "/agent");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "We could not confirm your payment."),
  });
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !me) return;
    const ref = new URLSearchParams(window.location.search).get("reference");
    if (!ref) return;
    done.current = true;
    confirm.mutate(ref);
  }, [me, confirm]);

  const unused = pins.filter((p) => p.status === "unused");
  const share = (code: string, t: string, price: number) => {
    const name = PASS_TIERS.find((x) => x.id === t)?.name ?? t;
    const text = `Your NDH Academy ${name} PIN: ${code}\nPrice: ${naira(price)}\nUse it at https://academy.ndh.com.ng (log in → My passes → enter PIN). One use only.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-12">
      <header className="space-y-2">
        <span className="text-brand-soft inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
          <Store className="h-4 w-4" aria-hidden="true" /> Agent corner
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Sell course PINs, keep the profit</h1>
        <p className="text-muted-foreground max-w-2xl">
          Buy PINs at agent price and sell them at the price printed on the card — never more. Anyone can be an agent,
          even without a pass.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PASS_TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTier(t.id)}
            className={`rounded-2xl border p-4 text-left transition ${tier === t.id ? "border-primary bg-brand-subtle shadow-lg" : "border-border bg-card"}`}
          >
            <div className="font-display font-bold">{t.name}</div>
            <div className="text-muted-foreground text-xs">Price on card: {naira(t.priceNgn)}</div>
            <div className="mt-2 text-sm">You pay <b>{naira(WHOLESALE_NGN[t.id])}</b></div>
            <div className="text-success text-sm font-semibold">You earn {naira(t.priceNgn - WHOLESALE_NGN[t.id])}</div>
          </button>
        ))}
      </section>

      <section className="bg-card border-border flex flex-col gap-4 rounded-3xl border p-5 shadow-lg sm:flex-row sm:items-end sm:p-6">
        <label className="flex-1 text-sm font-semibold">
          How many {selected.name} PINs?
          <input
            type="number"
            min={1}
            max={50}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
            className="border-input bg-background mt-1 block w-full rounded-xl border px-4 py-2.5"
          />
        </label>
        <div className="flex-1 text-sm">
          <div>Total to pay: <b className="text-lg">{naira(total)}</b></div>
          <div className="text-success">Your profit when all are sold: <b>{naira(profit)}</b></div>
        </div>
        {me ? (
          <Button
            onClick={() => (payments?.enabled ? buy.mutate() : toast.info("PIN sales open soon."))}
            disabled={buy.isPending}
          >
            {buy.isPending ? "Opening Paystack…" : "Buy PINs"}
          </Button>
        ) : (
          <Button asChild><Link to="/signup">Create account to buy</Link></Button>
        )}
      </section>

      {me && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold">My PINs</h2>
            <span className="text-muted-foreground text-sm">{unused.length} unused · {pins.length - unused.length} used</span>
          </div>
          {pins.length === 0 ? (
            <p className="text-muted-foreground text-sm">No PINs yet. Your PINs appear here right after payment.</p>
          ) : (
            <div className="divide-border border-border bg-card divide-y rounded-2xl border">
              {pins.map((p) => (
                <div key={p.code} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold tracking-wider">{p.code}</div>
                      <div className="text-muted-foreground text-xs">
                        {PASS_TIERS.find((t) => t.id === p.tier)?.name} · {naira(p.retailNgn)}
                      </div>
                    </div>
                    {p.status === "used" ? (
                      <span className="text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-semibold">Used</span>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" aria-label="Copy PIN"
                          onClick={() => navigator.clipboard.writeText(p.code).then(() => toast.success("PIN copied"))}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" aria-label="Share on WhatsApp" onClick={() => share(p.code, p.tier, p.retailNgn)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setView(view === p.code ? null : p.code)}>
                          {view === p.code ? "Hide card" : "Card"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {view === p.code && (
                    <div className="max-w-md space-y-2">
                      <VoucherCard code={p.code} tier={p.tier} retailNgn={p.retailNgn} />
                      <Button size="sm" variant="ghost" onClick={() => window.print()}>
                        <Printer className="mr-1.5 h-4 w-4" /> Print or save card
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
