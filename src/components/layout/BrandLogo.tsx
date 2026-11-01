import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

import { NdhFamilySymbol } from "./NdhFamilySymbol";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  showBadge?: boolean;
  className?: string;
  to?: "/" | "/dashboard";
}

/**
 * Academy brand lockup — the Open Gateway master tile of Najeeb Digital Hub
 * wearing the Education sector badge (GraduationCap), paired with the
 * family-style wordmark: NAJEEB DIGITAL HUB on the top line, NDH Academy
 * (this property) as the subtitle — exactly like the agency lockup.
 */
export function BrandLogo({
  size = "md",
  showSubtitle = true,
  showBadge = true,
  className = "",
  to = "/",
}: BrandLogoProps) {
  return (
    <Link
      to={to}
      className={`brand-lockup size-${size} ${className}`}
      aria-label="Najeeb Digital Hub — NDH Academy home"
    >
      <NdhFamilySymbol SectorIcon={GraduationCap} className={`size-${size}`} />
      <span className="brand-lockup-copy">
        {showSubtitle && <small>NAJEEB DIGITAL HUB</small>}
        <span className="brand-lockup-line">
          <strong>
            NDH&nbsp;<em>ACADEMY</em>
          </strong>
          {showBadge && <span className="brand-lockup-badge">Learn AI</span>}
        </span>
      </span>
    </Link>
  );
}
