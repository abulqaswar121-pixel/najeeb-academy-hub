import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Check, Infinity as InfinityIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { PASS_TIERS, type PassTierId } from "../../data/passes";
import { useMe } from "../../lib/academy";
import { formatNaira } from "../../lib/currency";
import {
  confirmCheckoutFn,
  fetchWallet,
  paymentsStatusFn,
  startCheckoutFn,
} from "../../lib/server-fns";
import { Button } from "../ui/button";

export const walletQuery = { queryKey: ["wallet"], queryFn: () => fetchWallet() };
export const paymentsQuery = { queryKey: ["payments-status"], queryFn: () => paymentsStatusFn() };

/** The 4 pass cards with Paystack checkout. Also confirms a payment on return. */
export function PassPlans({ compact = false }: { compact?: boolean }) {
  const { data: me } = useMe();
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

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}
    >
      {PASS_TIERS.map((tier) => (
        <div
          key={tier.id}
          className={`bg-card flex flex-col rounded-2xl border p-5 ${
            tier.highlight ? "border-primary shadow-glow-primary" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-foreground text-base font-bold">{tier.name}</h3>
            {tier.highlight && (
              <span className="bg-primary/15 text-brand-soft rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                Popular
              </span>
            )}
          </div>
          <p className="text-foreground mt-2 font-mono text-2xl font-black">
            {formatNaira(tier.priceNgn)}
          </p>
          <p className="text-brand-soft mt-1 flex items-center gap-1 text-sm font-semibold">
            {tier.courses === null ? (
              <>
                <InfinityIcon className="h-4 w-4" aria-hidden="true" /> All courses
              </>
            ) : (
              <>Any {tier.courses} courses</>
            )}
          </p>
          {!compact && (
            <p className="text-muted-foreground mt-2 flex-1 text-xs leading-relaxed">
              {tier.blurb}
            </p>
          )}
          <Button
            className={`mt-4 w-full rounded-xl font-bold ${tier.highlight ? "bg-gradient-cta" : ""}`}
            variant={tier.highlight ? "default" : "outline"}
            disabled={checkout.isPending || confirm.isPending}
            onClick={() => buy(tier.id)}
          >
            {checkout.isPending && checkout.variables === tier.id ? (
              "Opening checkout…"
            ) : (
              <>
                <Check className="h-4 w-4" aria-hidden="true" /> Get {tier.name}
              </>
            )}
          </Button>
        </div>
      ))}
      {confirm.isPending && (
        <p className="text-muted-foreground col-span-full text-center text-sm">
          Confirming your payment…
        </p>
      )}
    </div>
  );
}
