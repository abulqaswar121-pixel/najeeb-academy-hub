import { passTier } from "../../data/passes";

/** The printable / shareable PIN slip, carrying the NDH Academy logo and price. */
export function VoucherCard({ code, tier, retailNgn }: { code: string; tier: string; retailNgn: number }) {
  const t = passTier(tier);
  const unlocks = t?.courses ? `Unlocks any ${t.courses} courses` : "Unlocks all 60+ courses";
  return (
    <div className="voucher-card bg-sidebar text-sidebar-foreground relative overflow-hidden rounded-2xl border border-primary/40 p-5 shadow-xl">
      <div className="bg-gradient-cta absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-lg" />
          <div className="leading-tight">
            <div className="text-[9px] font-semibold tracking-[0.2em] uppercase opacity-70">Najeeb Digital Hub</div>
            <div className="font-display text-base font-extrabold">NDH ACADEMY</div>
          </div>
        </div>
        <span className="rounded-full border border-current/30 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase opacity-80">
          Course PIN
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-lg font-bold">{t?.name ?? tier}</div>
          <div className="text-xs opacity-75">{unlocks}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold tracking-wider uppercase opacity-70">Price</div>
          <div className="font-display text-xl font-extrabold">₦{retailNgn.toLocaleString("en-NG")}</div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-current/35 py-3 text-center font-mono text-lg font-bold tracking-[0.18em] sm:text-xl">
        {code}
      </div>
      <ol className="mt-3 space-y-0.5 text-[11px] opacity-80">
        <li>1. Go to academy.ndh.com.ng</li>
        <li>2. Sign up or log in</li>
        <li>3. Open "My passes" and enter this PIN. One use only.</li>
      </ol>
    </div>
  );
}
