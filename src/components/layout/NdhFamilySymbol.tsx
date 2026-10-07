import type { ComponentType, SVGProps } from "react";

import gatewayLogo from "../../assets/ndh-logo-gateway-cropped.png";

type SectorIcon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Shared Open Gateway identity, ported from the parent gateway
 * (`NdhFamilySymbol.tsx` on ndh.com.ng). The master gateway tile renders
 * alone for the parent brand; a sector icon integrates into the lower corner
 * for each family property (GraduationCap for the Academy).
 */
export function NdhFamilySymbol({
  className = "",
  SectorIcon,
}: {
  className?: string;
  SectorIcon?: SectorIcon | undefined;
}) {
  return (
    <span className={`ndh-family-symbol${className ? ` ${className}` : ""}`} aria-hidden="true">
      <span className="ndh-family-tile">
        <img src={gatewayLogo} alt="" width={684} height={679} />
      </span>
      {SectorIcon ? (
        <span className="ndh-family-sector">
          <SectorIcon strokeWidth={2} />
        </span>
      ) : null}
    </span>
  );
}
