import { Link } from "@tanstack/react-router";
import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Timer,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Promo / announcement bar — the Jumia-style strip above the real navbar for
 * discounts, flash sales and launch news. Rotates through the active promos,
 * shows a coupon chip and a live countdown for time-boxed offers, and can be
 * dismissed for the session. Marketing content lives in PROMOS below; the
 * academy catalog, pricing and checkout data stay untouched.
 */

type Promo = {
  id: string;
  icon: LucideIcon;
  message: string;
  cta: { label: string; to: string };
  coupon?: string;
  /** ISO timestamp the offer ends — renders a live countdown. */
  endsAt?: string;
};

const PROMOS: Promo[] = [
  {
    id: "flash-sale",
    icon: Zap,
    message: "Flash Sale — 30% off every course, this week only.",
    cta: { label: "Grab the deal", to: "/courses" },
    coupon: "FLASH30",
    endsAt: "2026-10-12T23:59:59+01:00",
  },
  {
    id: "new-tracks",
    icon: Sparkles,
    message: "New: Agentic AI engineering courses now in the catalog.",
    cta: { label: "See what's new", to: "/courses" },
  },
  {
    id: "free-account",
    icon: BadgePercent,
    message: "Create a free account — pay only for the courses you take.",
    cta: { label: "Sign up free", to: "/signup" },
  },
];

const DISMISS_KEY = "ndh-academy-promo-dismissed";
const ROTATE_MS = 7000;

function useCountdown(endsAt?: string) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const end = new Date(endsAt).getTime();
    const tick = () => {
      const ms = end - Date.now();
      if (ms <= 0) {
        setLabel("ended");
        return;
      }
      const totalMinutes = Math.floor(ms / 60000);
      const d = Math.floor(totalMinutes / (60 * 24));
      const h = Math.floor((totalMinutes % (60 * 24)) / 60);
      const m = totalMinutes % 60;
      setLabel(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    tick();
    const interval = window.setInterval(tick, 30000);
    return () => window.clearInterval(interval);
  }, [endsAt]);

  return label;
}

export function PromoBar() {
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const promo = PROMOS[index % PROMOS.length]!;
  const countdown = useCountdown(promo.endsAt);

  /* Restore the session dismissal + start rotation after hydration. */
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* ignore */
    }
    const interval = window.setInterval(() => setIndex((v) => v + 1), ROTATE_MS);
    return () => window.clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const Icon = promo.icon;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const copyCode = async () => {
    if (!promo.coupon) return;
    try {
      await navigator.clipboard.writeText(promo.coupon);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the code is visible anyway */
    }
  };

  const step = (delta: number) => {
    setIndex((v) => (v + delta + PROMOS.length) % PROMOS.length);
    setCopied(false);
  };

  return (
    <div className="promo-bar" role="region" aria-label="Promotions and announcements">
      <div className="promo-bar-inner">
        <div className="promo-bar-nav" aria-hidden="true">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous announcement"
            tabIndex={-1}
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next announcement"
            tabIndex={-1}
          >
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="promo-bar-message" key={promo.id}>
          <Icon size={13} className="promo-bar-icon" aria-hidden="true" />
          <span className="promo-bar-text">{promo.message}</span>
          {promo.coupon ? (
            <button
              type="button"
              className="promo-bar-coupon"
              onClick={copyCode}
              title="Copy coupon code"
            >
              {copied ? (
                <Check size={11} aria-hidden="true" />
              ) : (
                <Copy size={11} aria-hidden="true" />
              )}
              {copied ? "Copied!" : promo.coupon}
            </button>
          ) : null}
          {countdown && countdown !== "ended" ? (
            <span className="promo-bar-countdown">
              <Timer size={11} aria-hidden="true" /> Ends in {countdown}
            </span>
          ) : null}
          <Link to={promo.cta.to} className="promo-bar-cta">
            {promo.cta.label} →
          </Link>
        </div>

        <button
          type="button"
          className="promo-bar-dismiss"
          onClick={dismiss}
          aria-label="Dismiss announcements"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
