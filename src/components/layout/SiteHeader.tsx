import { Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, GraduationCap, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import { useMe, useSignOut, AGENCY_URL } from "../../lib/academy";
import { Button } from "../ui/button";
import { BrandLogo } from "./BrandLogo";

const navLinks = [
  { to: "/courses", label: "Courses" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: me } = useMe();
  const signOut = useSignOut();
  const navigate = useNavigate();

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo size="sm" showSubtitle={false} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              activeProps={{
                className: "text-foreground bg-accent/60 rounded-lg px-3 py-2 text-sm font-medium",
              }}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={AGENCY_URL}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            Agency
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {me ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut.mutate()}
                disabled={signOut.isPending}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
                Log in
              </Button>
              <Button
                size="sm"
                className="shadow-glow-primary"
                onClick={() => navigate({ to: "/signup" })}
              >
                <GraduationCap className="h-4 w-4" />
                Start learning
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="text-foreground hover:bg-accent/60 rounded-lg p-2 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="border-border/60 bg-background border-t px-4 pt-2 pb-4 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                activeProps={{
                  className:
                    "text-foreground bg-accent/60 rounded-lg px-3 py-2.5 text-sm font-medium",
                }}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={AGENCY_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            >
              Agency <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <div className="border-border/60 mt-2 flex flex-col gap-2 border-t pt-3">
              {me ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate({ to: "/dashboard" });
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut.mutate();
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate({ to: "/login" });
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate({ to: "/signup" });
                    }}
                  >
                    <GraduationCap className="h-4 w-4" /> Start learning
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
