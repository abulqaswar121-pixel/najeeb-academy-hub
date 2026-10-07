import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Display-currency preference — mirrors the agency's "Prices shown in USD ·
 * changeable anytime" model. Academy courses are priced in Naira, so USD is a
 * display-only approximate conversion; enrolment always charges ₦ NGN.
 */

export type Currency = "NGN" | "USD";

export const CURRENCIES: { id: Currency; symbol: string; label: string }[] = [
  { id: "NGN", symbol: "₦", label: "Nigerian Naira" },
  { id: "USD", symbol: "$", label: "US Dollar (approx.)" },
];

/** Display conversion rate — presentation only, never used for charging. */
const NGN_PER_USD = 1500;
const STORAGE_KEY = "ndh-academy-currency";

const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}>({ currency: "NGN", setCurrency: () => {} });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // SSR and first client paint always render NGN so hydration matches;
  // the stored preference applies after mount.
  const [currency, setCurrencyState] = useState<Currency>("NGN");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "NGN" || stored === "USD") setCurrencyState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

/** Always-NGN formatter (receipts, admin console, certificate-adjacent copy). */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** Preference-aware price: ₦15,000 → ≈ $10 when the visitor picked USD. */
export function formatPrice(amountNgn: number, currency: Currency): string {
  if (currency === "USD") {
    const usd = amountNgn / NGN_PER_USD;
    return `≈ $${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return formatNaira(amountNgn);
}
