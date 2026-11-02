import { passTier } from "../../data/passes";
import { formatNaira } from "../../lib/currency";

/**
 * The physical-looking student pass voucher. Styled to CR80 (credit-card)
 * proportions — deep navy metallic stock, micro-grid security print, gold chip
 * and an embossed PIN panel. The same design is redrawn on a canvas for PNG /
 * print / WhatsApp export in `src/lib/voucher-image.ts`.
 */
export function VoucherCard({
  code,
  tier,
  retailNgn,
}: {
  code: string;
  tier: string;
  retailNgn: number;
}) {
  const t = passTier(tier);
  const tierName = t?.name ?? tier;
  const unlocks = t?.courses ? `Unlocks any ${t.courses} courses` : "Unlocks all 60+ courses";

  return (
    <div
      className="voucher-card border-gold/40 relative aspect-[85.6/54] w-full max-w-[430px] overflow-hidden rounded-2xl border shadow-2xl select-none"
      aria-label={`NDH Academy ${tierName} voucher, PIN ${code}, retail price ${formatNaira(retailNgn)}`}
    >
      <div className="voucher-grid absolute inset-0" aria-hidden="true" />
      <div className="voucher-sheen absolute inset-0" aria-hidden="true" />

      <div className="relative flex h-full flex-col justify-between p-[4.6%] text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-[2.4%]">
            <span className="voucher-logo shrink-0" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
                <rect x="1" y="1" width="30" height="30" rx="9" stroke="currentColor" />
                <path
                  d="M9 23V12.5c0-.6.7-.9 1.1-.5L23 23V9"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="voucher-kicker block truncate">Najeeb Digital Hub</span>
              <span className="voucher-wordmark block truncate">NDH ACADEMY</span>
            </span>
          </div>
          <span className="voucher-badge shrink-0">Official Student Pass Voucher</span>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-[2%]">
              <span className="voucher-chip shrink-0" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="voucher-contactless shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M7 8.5a8 8 0 0 1 0 7M11 6a12 12 0 0 1 0 12M15 3.5a16 16 0 0 1 0 17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span className="voucher-chip-label">Pass credit</span>
            </div>
            <p className="voucher-tier truncate">{tierName}</p>
            <p className="voucher-unlocks truncate">{unlocks}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="voucher-price-label">Retail price</p>
            <p className="voucher-price whitespace-nowrap">{formatNaira(retailNgn)}</p>
          </div>
        </div>

        <div className="voucher-pin-row">
          <span className="voucher-pin-label">PIN</span>
          <span className="voucher-pin">{code}</span>
        </div>

        <ol className="voucher-steps">
          <li>1. Visit academy.ndh.com.ng</li>
          <li>2. Log in → My passes</li>
          <li>3. Enter this PIN · one use only</li>
        </ol>
      </div>
    </div>
  );
}
