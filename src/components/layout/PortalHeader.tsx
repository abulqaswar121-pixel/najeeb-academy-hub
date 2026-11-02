import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CloudDownload,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useMe, useSignOut } from "../../lib/academy";
import { BrandLogo } from "./BrandLogo";

const AREA_LABEL: Record<"learn" | "dashboard" | "admin" | "student", string> = {
  learn: "Learning room",
  dashboard: "Student portal",
  admin: "Admin portal",
  student: "Student portal",
};

const AREA_ICON = {
  learn: Sparkles,
  dashboard: GraduationCap,
  admin: ShieldCheck,
  student: GraduationCap,
} as const;

/** Every portal destination, with the full label used on mobile. */
const PORTAL_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/pricing", label: "My passes", icon: Ticket },
  { to: "/agent", label: "Agent corner", icon: Store },
  { to: "/offline", label: "Offline courses", icon: CloudDownload },
] as const;

/**
 * Distraction-free portal chrome. Deep navy, compact and quiet: brand, the
 * portal destinations and log out. No promo bar, no marketing nav, no footer
 * and no assistant — those live only on the public site.
 *
 * On phones the horizontal strip is replaced by a hamburger that opens a
 * right-hand drawer with full labels, so nothing crowds the brand lockup.
 */
export function PortalHeader({ area }: { area: "learn" | "dashboard" | "admin" | "student" }) {
  const { data: me } = useMe();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  const [open, setOpen] = useState(false);
  const AreaIcon = AREA_ICON[area];

  const linkBase =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors";
  const linkIdle = `${linkBase} text-muted-foreground hover:bg-accent/60 hover:text-foreground`;
  const linkActiveClass = `${linkBase} bg-accent text-foreground`;
  const drawerLink =
    "text-foreground hover:bg-accent/70 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors";
  const drawerLinkActive = `${drawerLink} bg-brand-subtle text-foreground`;

  // Navigating anywhere closes the drawer.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="band-dark sticky top-0 z-50 border-b border-border/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo
            size="sm"
            showBadge={false}
            className="portal-brand min-w-0 shrink-0"
            to={me ? "/dashboard" : "/"}
          />
          <span className="bg-brand-subtle text-brand-soft hidden items-center gap-1.5 rounded-full border border-primary/25 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase md:inline-flex">
            <AreaIcon className="h-3 w-3" aria-hidden="true" />
            {AREA_LABEL[area]}
          </span>
        </div>

        {/* Tablet / desktop strip — never shown below 640px. */}
        <nav
          className="hidden items-center gap-0.5 sm:flex sm:gap-1"
          aria-label="Portal navigation"
        >
          {PORTAL_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              title={label}
              className={linkIdle}
              activeProps={{ className: linkActiveClass }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
          {me?.role === "admin" && (
            <Link
              to="/admin"
              aria-label="Admin portal"
              title="Admin portal"
              className={linkIdle}
              activeProps={{ className: linkActiveClass }}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Admin portal</span>
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
              <span className="hidden lg:inline">Log out</span>
            </button>
          ) : (
            <button type="button" onClick={() => navigate({ to: "/login" })} className={linkIdle}>
              Log in
            </button>
          )}
        </nav>

        {/* Mobile hamburger — the only control beside the brand. */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close portal menu" : "Open portal menu"}
          aria-expanded={open}
          aria-controls="portal-mobile-menu"
          className="text-foreground hover:bg-accent/70 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 transition-colors sm:hidden"
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile drawer + scrim */}
      <div
        className={`fixed inset-x-0 top-14 bottom-0 z-40 sm:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close portal menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav
          id="portal-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Portal menu"
          className={`bg-card absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-border/60 shadow-2xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="min-w-0">
              <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                {AREA_LABEL[area]}
              </p>
              <p className="text-foreground truncate text-sm font-bold">
                {me?.name ?? "NDH Academy"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close portal menu"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/60 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            {PORTAL_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={drawerLink}
                activeProps={{ className: drawerLinkActive }}
              >
                <Icon className="text-brand-soft h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 truncate">{label}</span>
              </Link>
            ))}
            {me?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className={drawerLink}
                activeProps={{ className: drawerLinkActive }}
              >
                <ShieldCheck className="text-brand-soft h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 truncate">Admin portal</span>
              </Link>
            )}
          </div>

          <div className="border-border/60 border-t p-3">
            {me ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut.mutate();
                }}
                disabled={signOut.isPending}
                className="text-muted-foreground hover:bg-accent/70 hover:text-foreground flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors disabled:opacity-60"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                {signOut.isPending ? "Logging out…" : "Log out"}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="bg-gradient-cta text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
