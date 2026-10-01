import { Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  Briefcase,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { AGENCY_URL } from "../../lib/academy";
import { categories } from "../../data/categories";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  return (
    <footer className="bg-surface-deep border-border/60 border-t py-16 text-xs">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {/* Agency cross-link banner — mirrors the banner on agency.ndh.com.ng */}
        <div className="bg-brand-subtle/40 border-border flex flex-col items-center justify-between gap-6 rounded-3xl border p-6 shadow-2xl sm:p-8 md:flex-row">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="bg-primary/15 border-primary/40 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-inner">
              <Briefcase className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-sm font-bold">
                  Need a team to build it for you? Visit NDH Agency.
                </span>
                <span className="bg-primary/15 text-brand-soft rounded px-2 py-0.5 font-mono text-[10px] font-medium">
                  Sister platform
                </span>
              </div>
              <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed">
                NDH Agency designs and ships world-class software, brands and growth systems for
                ambitious organisations. Same hub, dedicated delivery teams.
              </p>
            </div>
          </div>
          <a
            href={AGENCY_URL}
            target="_blank"
            rel="noreferrer"
            className="bg-primary text-primary-foreground shadow-glow-primary hover:bg-primary/90 flex shrink-0 items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold transition-all hover:scale-105"
          >
            <span>Visit agency.ndh.com.ng</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* Directory grid */}
        <div className="border-border/60 grid grid-cols-1 gap-10 border-t pt-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo size="md" showSubtitle />
            <p className="text-muted-foreground text-xs leading-relaxed">
              Najeeb Academy teaches practical AI skills — short, project-based courses that end
              with a real assessment, a portfolio project and a signed, verifiable certificate.
            </p>
            <div className="text-muted-foreground space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="text-brand-soft h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>14B Karimu Kotun St, Victoria Island, Lagos</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-brand-soft h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>hello@academy.ndh.com.ng</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="text-success h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Serving learners across Africa &amp; beyond</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-foreground mb-4 text-xs font-bold tracking-wider uppercase">
              Popular tracks
            </h3>
            <ul className="space-y-2.5">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to="/courses"
                    search={{ category: cat.slug }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground mb-4 text-xs font-bold tracking-wider uppercase">
              Academy
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/courses"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Course catalog
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About the academy
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/verify"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Verify a certificate
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Student dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground mb-4 text-xs font-bold tracking-wider uppercase">
              Najeeb Digital Hub
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  Academy — academy.ndh.com.ng
                </Link>
              </li>
              <li>
                <a
                  href={AGENCY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  Agency — agency.ndh.com.ng <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
            <div className="mt-6 space-y-2.5">
              <div className="text-muted-foreground flex items-center gap-2">
                <Award className="text-gold h-3.5 w-3.5" aria-hidden="true" />
                <span>Signed, verifiable certificates</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <BadgeCheck className="text-success h-3.5 w-3.5" aria-hidden="true" />
                <span>Project-based, practical curriculum</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="text-brand-soft h-3.5 w-3.5" aria-hidden="true" />
                <span>Secure payments in ₦ NGN</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p>© {new Date().getFullYear()} Najeeb Digital Hub. All rights reserved.</p>
          <p className="font-mono text-[10px] tracking-wider uppercase">
            academy.ndh.com.ng · agency.ndh.com.ng
          </p>
        </div>
      </div>
    </footer>
  );
}
