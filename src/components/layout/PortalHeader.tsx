import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useMe, useSignOut } from "../../lib/academy";
import { BrandLogo } from "./BrandLogo";

const AREA_LABEL: Record<"learn" | "dashboard" | "admin", string> = {
  learn: "Learning room",
  dashboard: "Student portal",
  admin: "Admin portal",
};

const AREA_ICON = {
  learn: Sparkles,
  dashboard: GraduationCap,
  admin: ShieldCheck,
} as const;

/**
 * Distraction-free portal chrome. Deep navy, compact and quiet: brand, the
 * three portal destinations and log out. No promo bar, no marketing nav, no
 * footer and no assistant — those live only on the public site.
 */
export function PortalHeader({ area }: { area: "learn" | "dashboard" | "admin" }) {
  const { data: me } = useMe();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const AreaIcon = AREA_ICON[area];

  const linkBase =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors";
  const linkIdle = `${linkBase} text-muted-foreground hover:bg-accent/60 hover:text-foreground`;
  const linkActiveClass = `${linkBase} bg-accent text-foreground`;

  return (
    <header className="band-dark sticky top-0 z-50 border-b border-border/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size="sm" showBadge={false} className="portal-brand" />
          <span className="bg-brand-subtle text-brand-soft hidden items-center gap-1.5 rounded-full border border-primary/25 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase sm:inline-flex">
            <AreaIcon className="h-3 w-3" aria-hidden="true" />
            {AREA_LABEL[area]}
          </span>
        </div>

        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Portal navigation">
          <Link to="/dashboard" className={linkIdle} activeProps={{ className: linkActiveClass }}>
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/courses" className={linkIdle} activeProps={{ className: linkActiveClass }}>
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Catalog</span>
          </Link>
          {me?.role === "admin" && (
            <Link to="/admin" className={linkIdle} activeProps={{ className: linkActiveClass }}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          {me ? (
            <button
              type="button"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className={linkIdle}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">Log out</span>
            </button>
          ) : (
            <button type="button" onClick={() => navigate({ to: "/login" })} className={linkIdle}>
              Log in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
