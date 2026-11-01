import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useMe } from "../../lib/academy";
import { redeemVoucherFn } from "../../lib/server-fns";
import { Button } from "../ui/button";

/** "Have an NDH PIN?" box — turns a voucher PIN into pass credits. */
export function RedeemPin() {
  const { data: me } = useMe();
  const [pin, setPin] = useState("");
  const queryClient = useQueryClient();
  const redeem = useMutation({
    mutationFn: () => redeemVoucherFn({ data: { pin } }),
    onSuccess: async ({ tier }) => {
      setPin("");
      await queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success(`PIN accepted — your ${tier} is now active. Pick your courses!`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not use this PIN."),
  });

  return (
    <div className="bg-card border-border rounded-3xl border p-5 shadow-lg sm:p-6">
      <div className="flex items-center gap-3">
        <div className="bg-brand-subtle border-primary/25 text-brand-soft flex h-10 w-10 items-center justify-center rounded-xl border">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">Have an NDH PIN?</h3>
          <p className="text-muted-foreground text-sm">Type it here to unlock your pass right away.</p>
        </div>
      </div>
      {me ? (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (pin.trim()) redeem.mutate();
          }}
        >
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.toUpperCase())}
            placeholder="NDH-XXXX-XXXX-XXXX"
            aria-label="Voucher PIN"
            maxLength={24}
            className="border-input bg-background focus:ring-ring flex-1 rounded-xl border px-4 py-2.5 font-mono tracking-widest uppercase outline-none focus:ring-2"
          />
          <Button type="submit" disabled={redeem.isPending || !pin.trim()}>
            {redeem.isPending ? "Checking…" : "Use PIN"}
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground mt-4 text-sm">
          <a href="/login" className="text-brand-soft font-semibold underline">Log in</a> or{" "}
          <a href="/signup" className="text-brand-soft font-semibold underline">create a free account</a> to use your PIN.
        </p>
      )}
    </div>
  );
}
