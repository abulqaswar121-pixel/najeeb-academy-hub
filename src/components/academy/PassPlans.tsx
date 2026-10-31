import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Crown, Infinity as InfinityIcon, Sparkles, Ticket } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { PASS_TIERS, type PassTierId } from "../../data/passes";
import { passName } from "../../lib/passes-ui";
import { useMe } from "../../lib/academy";
import { formatPrice, useCurrency } from "../../lib/currency";
import {
  confirmCheckoutFn,
  fetchWallet,
  paymentsStatusFn,
  startCheckoutFn,
} from "../../lib/server-fns";
import { Button } from "../ui/button";

export const walletQuery = { queryKey: ["wallet"], queryFn: () => fetchWallet() };
export const paymentsQuery = { queryKey: ["payments-status"], queryFn: () => paymentsStatusFn() };

/** Per-tier marketing copy + feature lists (prices live in data/passes.ts). */
const PASS_DETAILS: Record<
  PassTierId,
  { credits: string; features: string[]; cta: string; icon: typeof Ticket }
> = {
  starter: {
    credits: "Any 3 courses",
    cta: "Get Starter Pass",
    icon: Ticket,
    features: [
      "Unlock any 3 courses from the catalog",
      "All lessons, notes and exercises",
      "Final assessment with 70% pass mark",
      "Signed, verifiable certificate per course",
    ],
  },
  skill: {
    credits: "Any 8 courses",
    cta: "Get Skill Pack",
    icon: Sparkles,
    features: [
      "Unlock any 8 courses — mix across tracks",
      "Everything in Starter, with more room",
      "Capstone project review by a mentor",
      "Certificates for every course you finish",
    ],
  },
  pro: {
    credits: "Any 18 courses",
    cta: "Get Pro Track",
    icon: Crown,
    features: [
      "Unlock any 18 courses — build a full track",
      "Priority mentor feedback on projects",
      "Every certificate, forever verifiable",
      "Best value per course for serious learners",
    ],
  },
  all: {
    credits: "Every course, forever",
    cta: "Get All-Access Pass",
    icon: InfinityIcon,
    features: [
      "All 60+ courses — no credits to count",
      "Every future course release included",
      "Unlimited mentor project reviews",
      "All-Access VIP badge on your dashboard",
    ],
  },
};

/**
 * The four academy passes with Paystack checkout. Renders the tier cards on
 * /pricing, the course page and the dashboard upsell. Also confirms a payment
 * on return from Paystack (once a reference is in the URL).
 */
export function PassPlans({
  compact = false,
  hideUpsell = false,
}: {
  compact?: boolean;
  hideUpsell?: boolean;
}) {
  const { data: me } = useMe();
  const { currency } = useCurrency();
  const { data: wallet } = useQuery(walletQuery);
  const { data: payments } = useQuery(paymentsQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const checkout = useMutation({
    mutationFn: (tier: PassTierId) =>
      startCheckoutFn({
        data: {
          tier,
          origin: window.location.origin,
          returnPath: window.location.pathname,
        },
      }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not start payment."),
  });

  const confirm = useMutation({
    mutationFn: (reference: string) => confirmCheckoutFn({ data: { reference } }),
    onSuccess: async ({ tier }) => {
      await queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success(`Payment received — your ${tier} is active. Pick your courses!`);
      window.history.replaceState(null, "", window.location.pathname);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "We could not confirm your payment."),
  });

  const confirmedRef = useRef(false);
  useEffect(() => {
    if (confirmedRef.current || !me) return;
    const ref = new URLSearchParams(window.location.search).get("reference");
    if (!ref) return;
    confirmedRef.current = true;
    confirm.mutate(ref);
  }, [me, confirm]);

  const buy = (tier: PassTierId) => {
    if (!me) {
      toast.info("Create a free account first, then pick your pass.");
      navigate({ to: "/signup", search: { redirect: window.location.pathname } });
      return;
    }
    if (!payments?.enabled) {
      toast.info("Payments open soon. For now, every course is free to join.");
      return;
    }
    checkout.mutate(tier);
  };

  const creditsLeft = wallet ? Math.max(0, wallet.creditsTotal - wallet.creditsUsed) : 0;

  return (
    <div className="space-y-5">
      {!hideUpsell && (
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-semibold">
            <Check className="text-success h-3.5 w-3.5" aria-hidden="true" />
            One payment · no subscription
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-semibold">
            <Check className="text-success h-3.5 w-3.5" aria-hidden="true" />
            Credits never expire
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-semibold">
            <Check className="text-success h-3.5 w-3.5" aria-hidden="true" />
            Certificates included
          </span>
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4"}`}
      >
        {PASS_TIERS.map((tier) => {
          const detail = PASS_DETAILS[tier.id];
          const Icon = detail.icon;
          const isAll = tier.id === "all";
          const isActive = Boolean(wallet?.allAccess && isAll);
          return (
            <div
              key={tier.id}
              className={`relative flex flex-col overflow-hidden rounded-3xl border p-6 transition-all ${
                tier.highlight
                  ? "border-primary/60 bg-card shadow-2xl xl:-translate-y-1"
                  : isAll
                    ? "border-gold/45 bg-card shadow-xl"
                    : "bg-card border-border shadow-lg"
              }`}
            >
              {tier.highlight && (
                <div className="bg-gradient-cta absolute inset-x-0 top-0 h-1" aria-hidden="true" />
              )}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isAll
                      ? "bg-gold/12 border-gold/40 text-gold"
                      : "bg-brand-subtle border-primary/25 text-brand-soft"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                {tier.highlight && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase">
                    Most popular
                  </span>
                )}
                {isAll && !tier.highlight && (
                  <span className="border-gold/40 bg-gold/10 text-gold rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase">
                    Best value
                  </span>
                )}
              </div>

              <h3 className="text-foreground mt-4 text-lg font-black tracking-tight">
                {passName(tier.id)}
              </h3>
              <p className="text-brand-soft mt-0.5 flex items-center gap-1 text-xs font-bold">
                {tier.courses === null ? (
                  <>
                    <InfinityIcon className="h-3.5 w-3.5" aria-hidden="true" /> All 60+ courses
                  </>
                ) : (
                  <>
                    <Ticket className="h-3.5 w-3.5" aria-hidden="true" /> {detail.credits}
                  </>
                )}
              </p>

              <p className="text-foreground mt-4 font-mono text-3xl font-black tracking-tight">
                {formatPrice(tier.priceNgn, currency)}
              </p>
              <p className="text-muted-foreground mt-1 text-[11px] font-medium">
                one-time payment · lifetime access
              </p>

              <p className="text-muted-foreground mt-3 text-xs leading-relaxed">{tier.blurb}</p>

              <ul className="border-border/70 mt-4 flex-1 space-y-2 border-t pt-4">
                {detail.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs">
                    <Check
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isAll ? "text-gold" : "text-success"}`}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-5 w-full rounded-xl font-bold ${
                  tier.highlight || isAll ? "bg-gradient-cta shadow-glow-primary" : ""
                }`}
                variant={tier.highlight || isAll ? "default" : "outline"}
                disabled={checkout.isPending || confirm.isPending || isActive}
                onClick={() => buy(tier.id)}
              >
                {isActive ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" /> Active on your account
                  </>
                ) : checkout.isPending && checkout.variables === tier.id ? (
                  "Opening checkout…"
                ) : (
                  <>
                    {detail.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {wallet && !wallet.allAccess && creditsLeft > 0 && (
        <p className="text-muted-foreground text-center text-xs">
          You have{" "}
          <span className="text-brand-soft font-bold">
            {creditsLeft} course credit{creditsLeft === 1 ? "" : "s"}
          </span>{" "}
          left — buy another pass any time to top up.
        </p>
      )}
      {payments && !payments.enabled && (
        <p className="text-muted-foreground text-center text-xs">
          Checkout opens as soon as our Paystack keys go live — until then every course is free to
          join.
        </p>
      )}
      {confirm.isPending && (
        <p className="text-muted-foreground text-center text-sm">Confirming your payment…</p>
      )}
    </div>
  );
}
