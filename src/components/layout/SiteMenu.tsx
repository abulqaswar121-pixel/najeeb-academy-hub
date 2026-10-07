import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCurrency, CURRENCIES } from "../../lib/currency";
import { useLanguage, LANGUAGES, type ChromeKey } from "../../lib/i18n";
import { useMe, useSignOut } from "../../lib/academy";
import { Button } from "../ui/button";

/**
 * The "three lines" navigation dropdown — academy page links, the language
 * switcher (EN/FR/AR) and the currency switcher (₦ NGN / $ USD) behind one
 * trigger. Cross-property ecosystem links live in the site footer only, so
 * the menu stays focussed on the academy itself.
 */

const SITE_LINKS: { to: string; labelKey: ChromeKey }[] = [
  { to: "/courses", labelKey: "nav.courses" },
  { to: "/pricing", labelKey: "nav.pricing" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/faq", labelKey: "nav.faq" },
  { to: "/contact", labelKey: "nav.contact" },
  { to: "/verify", labelKey: "nav.verify" },
];

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: me } = useMe();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="site-menu" ref={rootRef}>
      <button
        type="button"
        className="site-menu-trigger"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
        <span className="site-menu-trigger-label">{t("menu.title")}</span>
        <ChevronDown size={13} aria-hidden="true" className={open ? "is-open" : undefined} />
      </button>

      {open && (
        <div className="site-menu-panel" role="group" aria-label={t("menu.title")}>
          {/* On this site */}
          <section className="site-menu-section">
            <p className="site-menu-title">{t("menu.onThisSite")}</p>
            <div className="site-menu-links">
              {SITE_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={close}
                  className="site-menu-link"
                  activeProps={{ className: "site-menu-link is-active" }}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </section>

          {/* Preferences: language + currency */}
          <section className="site-menu-section">
            <p className="site-menu-title">{t("menu.preferences")}</p>
            <div className="site-menu-prefs">
              <div className="site-menu-pref">
                <p className="site-menu-pref-label">{t("menu.language")}</p>
                <div className="site-menu-options" role="group" aria-label={t("menu.language")}>
                  {LANGUAGES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`site-menu-option${language === option.id ? " is-selected" : ""}`}
                      aria-pressed={language === option.id}
                      onClick={() => setLanguage(option.id)}
                    >
                      {option.label}
                      {language === option.id ? <Check size={12} aria-hidden="true" /> : null}
                    </button>
                  ))}
                </div>
              </div>
              <div className="site-menu-pref">
                <p className="site-menu-pref-label">{t("menu.currency")}</p>
                <div className="site-menu-options" role="group" aria-label={t("menu.currency")}>
                  {CURRENCIES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`site-menu-option${currency === option.id ? " is-selected" : ""}`}
                      aria-pressed={currency === option.id}
                      onClick={() => setCurrency(option.id)}
                    >
                      {option.symbol} {option.id}
                      {currency === option.id ? <Check size={12} aria-hidden="true" /> : null}
                    </button>
                  ))}
                </div>
                {currency === "USD" ? (
                  <p className="site-menu-pref-note">{t("menu.currencyNote")}</p>
                ) : null}
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="site-menu-actions">
            {me ? (
              <>
                {me.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      close();
                      navigate({ to: "/admin" });
                    }}
                  >
                    <ShieldCheck className="h-4 w-4" /> {t("menu.admin")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    close();
                    navigate({ to: "/dashboard" });
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" /> {t("menu.dashboard")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    close();
                    signOut.mutate();
                  }}
                  disabled={signOut.isPending}
                >
                  <LogOut className="h-4 w-4" /> {t("menu.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    close();
                    navigate({ to: "/login" });
                  }}
                >
                  <LogIn className="h-4 w-4" /> {t("menu.login")}
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-cta shadow-glow-primary font-bold"
                  onClick={() => {
                    close();
                    navigate({ to: "/signup" });
                  }}
                >
                  <GraduationCap className="h-4 w-4" /> {t("menu.startLearning")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
