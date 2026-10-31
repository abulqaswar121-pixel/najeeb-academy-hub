import { Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  ExternalLink,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { AGENCY_URL } from "../../lib/academy";
import {
  NDH_ADDRESS,
  NDH_EMAIL_HELLO,
  NDH_FACEBOOK_URL,
  NDH_INSTAGRAM_URL,
  NDH_MAPS_URL,
  NDH_PHONE_DISPLAY,
  NDH_PHONE_TEL,
  NDH_WHATSAPP_URL,
} from "../../lib/contact";
import { BrandLogo } from "./BrandLogo";

const academyLinks = [
  { to: "/courses", label: "Course catalog" },
  { to: "/pricing", label: "Pricing" },
  { to: "/stories", label: "Graduate stories" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/verify", label: "Verify a certificate" },
] as const;

const familyLinks = [
  { href: "https://ndh.com.ng", label: "Najeeb Digital Hub" },
  { href: AGENCY_URL, label: "NDH Agency" },
];

/**
 * Two footer sizes:
 * - "full": homepage only — directory, contact channels and NDH family links.
 * - "compact": every other public page — one slim line so pages stay short.
 * Portals (learn, dashboard, admin) render no footer at all.
 */
export function SiteFooter({ variant = "compact" }: { variant?: "full" | "compact" }) {
  const year = new Date().getFullYear();

  if (variant === "compact") {
    return (
      <footer className="band-dark border-border/60 border-t py-6 text-xs">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} Najeeb Academy</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Footer">
            {academyLinks.slice(0, 6).map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="band-dark site-footer border-border/60 border-t py-14 text-xs">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo size="md" showSubtitle />
            <p className="text-muted-foreground leading-relaxed">
              Short, project-based AI courses that end with a real assessment, a portfolio project
              and a signed, verifiable certificate.
            </p>
            <div className="flex items-center gap-4">
              <a href={NDH_WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-brand-soft hover:text-foreground transition-colors">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={NDH_FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-brand-soft hover:text-foreground transition-colors">
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={NDH_INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-brand-soft hover:text-foreground transition-colors">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-foreground mb-4 font-bold tracking-wider uppercase">Academy</h3>
            <ul className="space-y-2.5">
              {academyLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground mb-4 font-bold tracking-wider uppercase">Contact</h3>
            <div className="text-muted-foreground space-y-2.5">
              <a href={NDH_MAPS_URL} target="_blank" rel="noreferrer" className="hover:text-foreground flex items-start gap-2 transition-colors">
                <MapPin className="text-brand-soft mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{NDH_ADDRESS}</span>
              </a>
              <a href={NDH_PHONE_TEL} className="hover:text-foreground flex items-center gap-2 transition-colors">
                <Phone className="text-brand-soft h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {NDH_PHONE_DISPLAY}
              </a>
              <a href={`mailto:${NDH_EMAIL_HELLO}`} className="hover:text-foreground flex items-center gap-2 transition-colors">
                <Mail className="text-brand-soft h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {NDH_EMAIL_HELLO}
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-foreground mb-4 font-bold tracking-wider uppercase">Part of NDH</h3>
              <ul className="space-y-2.5">
                {familyLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
                      {l.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <Award className="text-gold h-3.5 w-3.5" aria-hidden="true" /> Verifiable certificates
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="text-success h-3.5 w-3.5" aria-hidden="true" /> Project-based learning
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-brand-soft h-3.5 w-3.5" aria-hidden="true" /> Secure ₦ payments
              </div>
            </div>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground border-t pt-6 text-center">
          © {year} Najeeb Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
