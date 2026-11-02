import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Download, Loader2, MessageCircle, Printer, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { paymentsQuery } from "../components/academy/PassPlans";
import { VoucherCard } from "../components/academy/VoucherCard";
import { Button } from "../components/ui/button";
import { PASS_TIERS, WHOLESALE_NGN, type PassTierId } from "../data/passes";
import { seo, useMe } from "../lib/academy";
import { formatNaira } from "../lib/currency";
import { renderVoucherCard, voucherFileName } from "../lib/voucher-image";
import { confirmCheckoutFn, myVouchersFn, startVoucherCheckoutFn } from "../lib/server-fns";

export const Route = createFileRoute("/agent")({
  head: () => {
    const base = seo({
      title: "Become an NDH Academy agent",
      description:
        "Buy NDH Academy course PINs at agent price, resell at the official price and keep the profit.",
      path: "/agent",
    });
    return { ...base, meta: [...base.meta, { name: "robots", content: "noindex" }] };
  },
  component: AgentPage,
});

const naira = (n: number) => formatNaira(n);

interface VoucherPin {
  code: string;
  tier: string;
  retailNgn: number;
  status: string;
}

/** Save a generated PNG straight to the device's downloads / gallery. */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function AgentPage() {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const { data: payments } = useQuery(paymentsQuery);
  const { data: pins = [] } = useQuery({
    queryKey: ["my-vouchers"],
    queryFn: () => myVouchersFn(),
    enabled: !!me,
  });
  const [tier, setTier] = useState<PassTierId>("starter");
  const [qty, setQty] = useState(5);
  const [view, setView] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [printCard, setPrintCard] = useState<{ url: string; code: string } | null>(null);

  const selected = PASS_TIERS.find((t) => t.id === tier)!;
  const total = WHOLESALE_NGN[tier] * qty;
  const profit = (selected.priceNgn - WHOLESALE_NGN[tier]) * qty;

  const buy = useMutation({
    mutationFn: () =>
      startVoucherCheckoutFn({ data: { tier, qty, origin: window.location.origin } }),
    onSuccess: ({ url }) => (window.location.href = url),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start payment."),
  });

  const confirm = useMutation({
    mutationFn: (reference: string) => confirmCheckoutFn({ data: { reference } }),
    onSuccess: async (r) => {
      await queryClient.invalidateQueries({ queryKey: ["my-vouchers"] });
      toast.success(
        r.kind === "vouchers"
          ? `Payment received — ${r.qty} new PINs are ready below.`
          : "Payment received.",
      );
      window.history.replaceState(null, "", "/agent");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "We could not confirm your payment."),
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

  /** Print the 300-DPI PNG at exact CR80 size (85.6 mm × 54 mm). */
  const printVoucher = async (pin: VoucherPin) => {
    setBusy(`print-${pin.code}`);
    try {
      const blob = await renderVoucherCard(pin);
      const url = URL.createObjectURL(blob);
      setPrintCard({ url, code: pin.code });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not prepare the card for printing.");
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (!printCard) return;
    const style = document.createElement("style");
    style.textContent = "@page { size: 85.6mm 54mm; margin: 0 !important; }";
    document.head.appendChild(style);
    const done = () => setPrintCard(null);
    window.addEventListener("afterprint", done);
    return () => {
      style.remove();
      window.removeEventListener("afterprint", done);
      URL.revokeObjectURL(printCard.url);
    };
  }, [printCard]);

  const downloadVoucher = async (pin: VoucherPin) => {
    setBusy(`png-${pin.code}`);
    try {
      const blob = await renderVoucherCard(pin);
      downloadBlob(blob, voucherFileName(pin.code));
      toast.success("Card image downloaded — check your gallery or downloads.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not render the card image.");
    } finally {
      setBusy(null);
    }
  };

  const shareVoucher = async (pin: VoucherPin) => {
    setBusy(`share-${pin.code}`);
    const name = PASS_TIERS.find((x) => x.id === pin.tier)?.name ?? pin.tier;
    const text = `NDH Academy ${name} pass · PIN ${pin.code} · ${naira(pin.retailNgn)}.\nRedeem it at https://academy.ndh.com.ng — log in → My passes. One use only.`;
    try {
      const blob = await renderVoucherCard(pin);
      const file = new File([blob], voucherFileName(pin.code), { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text, title: "NDH Academy voucher" });
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
        }
      }
      // Fallback: save the image, then open WhatsApp with the PIN prefilled so
      // the agent can attach the downloaded card.
      downloadBlob(blob, voucherFileName(pin.code));
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${text}\nThe card image was downloaded — attach it here.`)}`,
        "_blank",
        "noopener",
      );
      toast.info("Card downloaded — attach the image in WhatsApp.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not share the card image.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-12">
      <header className="space-y-2">
        <span className="text-brand-soft inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
          <Store className="h-4 w-4" aria-hidden="true" /> Agent corner
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Sell course PINs, keep the profit
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Buy PINs at agent price and sell them at the price printed on the card — never more.
          Anyone can be an agent, even without a pass.
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
            <div className="mt-2 text-sm">
              You pay <b>{naira(WHOLESALE_NGN[t.id])}</b>
            </div>
            <div className="text-success text-sm font-semibold">
              You earn {naira(t.priceNgn - WHOLESALE_NGN[t.id])}
            </div>
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
          <div>
            Total to pay: <b className="text-lg">{naira(total)}</b>
          </div>
          <div className="text-success">
            Your profit when all are sold: <b>{naira(profit)}</b>
          </div>
        </div>
        {me ? (
          <Button
            onClick={() => (payments?.enabled ? buy.mutate() : toast.info("PIN sales open soon."))}
            disabled={buy.isPending}
          >
            {buy.isPending ? "Opening Paystack…" : "Buy PINs"}
          </Button>
        ) : (
          <Button asChild>
            <Link to="/signup">Create account to buy</Link>
          </Button>
        )}
      </section>

      {me && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold">My PINs</h2>
            <span className="text-muted-foreground text-sm">
              {unused.length} unused · {pins.length - unused.length} used
            </span>
          </div>
          {pins.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No PINs yet. Your PINs appear here right after payment.
            </p>
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
                      <span className="text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-semibold">
                        Used
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label="Copy PIN"
                          onClick={() =>
                            navigator.clipboard
                              .writeText(p.code)
                              .then(() => toast.success("PIN copied"))
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label="Download card as PNG image"
                          disabled={busy === `png-${p.code}`}
                          onClick={() => downloadVoucher(p)}
                        >
                          {busy === `png-${p.code}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">PNG</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label="Print or save card as PDF"
                          disabled={busy === `print-${p.code}`}
                          onClick={() => printVoucher(p)}
                        >
                          {busy === `print-${p.code}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Printer className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">Print/PDF</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label="Share card image to WhatsApp"
                          disabled={busy === `share-${p.code}`}
                          onClick={() => shareVoucher(p)}
                        >
                          {busy === `share-${p.code}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageCircle className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">WhatsApp</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setView(view === p.code ? null : p.code)}
                        >
                          {view === p.code ? "Hide card" : "Card"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {view === p.code && (
                    <div className="max-w-[430px] space-y-2">
                      <VoucherCard code={p.code} tier={p.tier} retailNgn={p.retailNgn} />
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Download the crisp PNG for WhatsApp status, print the CR80 card at 85.6 × 54
                        mm, or share the image straight to a chat.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {printCard && (
        <div className="voucher-print-area" aria-hidden="true">
          <img
            src={printCard.url}
            alt=""
            onLoad={() => {
              window.print();
              window.setTimeout(() => setPrintCard(null), 1500);
            }}
          />
        </div>
      )}
    </div>
  );
}
