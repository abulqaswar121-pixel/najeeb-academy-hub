import { Link } from "@tanstack/react-router";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
}

/**
 * Najeeb Academy brand lockup — same nexus emblem family as the NDH Agency
 * site, with the ACADEMY wordmark.
 */
export function BrandLogo({ size = "md", showSubtitle = true, className = "" }: BrandLogoProps) {
  const iconSizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" };
  const textSizes = { sm: "text-base", md: "text-lg", lg: "text-2xl" };

  return (
    <Link to="/" className={`group flex min-w-0 select-none items-center gap-2.5 ${className}`}>
      {/* Geometric nexus emblem */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}
      >
        <div className="bg-gradient-brand absolute inset-0 rounded-2xl opacity-75 blur-[6px] transition-opacity group-hover:opacity-100" />
        <div className="bg-surface-deep border-foreground/20 relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border p-0.5 shadow-xl">
          <div className="from-foreground/25 pointer-events-none absolute inset-0 bg-gradient-to-b via-transparent to-transparent" />
          <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="ndhAcadGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gradient-from)" />
                <stop offset="50%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--gradient-via)" />
              </linearGradient>
              <linearGradient id="ndhAcadGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gradient-to)" />
                <stop offset="100%" stopColor="var(--gradient-via)" />
              </linearGradient>
            </defs>
            <path d="M10 30V10L17 10V30H10Z" fill="url(#ndhAcadGradient1)" />
            <path d="M15 10L27 30H22L10 10H15Z" fill="url(#ndhAcadGradient2)" opacity="0.9" />
            <path d="M23 30V10L30 10V30H23Z" fill="url(#ndhAcadGradient1)" />
            <circle cx="20" cy="20" r="3" fill="var(--foreground)" />
            <circle cx="20" cy="20" r="1.5" fill="var(--primary)" />
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex min-w-0 flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`text-foreground group-hover:text-brand-soft font-black tracking-tight whitespace-nowrap transition-colors ${textSizes[size]}`}
          >
            NDH<span className="text-brand-soft ml-1 font-light">ACADEMY</span>
          </span>
          <span className="bg-brand-subtle border-primary/30 text-brand-soft rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase">
            Learn AI
          </span>
        </div>
        {showSubtitle && (
          <p className="text-muted-foreground -mt-0.5 text-[10px] font-medium tracking-wide">
            Part of Najeeb Digital Hub
          </p>
        )}
      </div>
    </Link>
  );
}
