import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, LogIn, LogOut, ShieldCheck } from "lucide-react";

import { useMe, useSignOut } from "../../lib/academy";
import { useLanguage, type ChromeKey } from "../../lib/i18n";
import { Button } from "../ui/button";
import { BrandLogo } from "./BrandLogo";
import { PromoBar } from "./PromoBar";
import { SiteMenu } from "./SiteMenu";

const navLinks: { to: string; labelKey: ChromeKey }[] = [
  { to: "/courses", labelKey: "nav.courses" },
  { to: "/pricing", labelKey: "nav.pricing" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/faq", labelKey: "nav.faq" },
  { to: "/contact", labelKey: "nav.contact" },
];

export function SiteHeader() {
  const { data: me } = useMe();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <>
      {/* Announcement strip: flash sales, discounts, launch news */}
      <PromoBar />
      <header className="border-border bg-surface/85 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo size="sm" />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                activeProps={{
                  className:
                    "text-foreground bg-accent/60 rounded-lg px-3 py-2 text-sm font-medium",
                }}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop auth actions */}
            <div className="hidden items-center gap-2 lg:flex">
              {me ? (
                <>
                  {me.role === "admin" && (
                    <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin" })}>
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
                    <LayoutDashboard className="h-4 w-4" />
                    {t("menu.dashboard")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut.mutate()}
                    disabled={signOut.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("menu.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
                    <LogIn className="h-4 w-4" />
                    {t("menu.login")}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-cta shadow-glow-primary font-bold"
                    onClick={() => navigate({ to: "/signup" })}
                  >
                    <GraduationCap className="h-4 w-4" />
                    {t("menu.startLearning")}
                  </Button>
                </>
              )}
            </div>

            {/* The "three lines" menu — page links, ecosystem, language, currency */}
            <SiteMenu />
          </div>
        </div>
      </header>
    </>
  );
}
