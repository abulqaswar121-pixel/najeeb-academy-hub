import { Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { categories } from "../../data/categories";
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

/**
 * Deep-navy footer anchor: academy directories, the real contact channels,
 * trust cues and legal line. Rendering uses the shared on-dark token scope
 * (.band-dark).
 */
export function SiteFooter() {
  return (
    <footer className="band-dark site-footer border-border/60 border-t py-16 text-xs">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {/* Directory grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo size="md" showSubtitle />
            <p className="text-muted-foreground text-xs leading-relaxed">
              Najeeb Academy teaches practical AI skills — short, project-based courses that end
              with a real assessment, a portfolio project and a signed, verifiable certificate.
            </p>
            <div className="text-muted-foreground space-y-2 pt-1 text-xs">
              <a
                href={NDH_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <MapPin className="text-brand-soft h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{NDH_ADDRESS}</span>
              </a>
              <a
                href={NDH_PHONE_TEL}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Phone className="text-brand-soft h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{NDH_PHONE_DISPLAY}</span>
              </a>
              <a
                href={`mailto:${NDH_EMAIL_HELLO}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Mail className="text-brand-soft h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{NDH_EMAIL_HELLO}</span>
              </a>
              <div className="flex items-center gap-2">
                <Globe className="text-success h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Serving learners across Africa &amp; beyond</span>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <a
                  href={NDH_WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat with NDH on WhatsApp"
                  className="text-brand-soft hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={NDH_FACEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="NDH on Facebook"
                  className="text-brand-soft hover:text-foreground transition-colors"
                >
                  <Facebook className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={NDH_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="NDH on Instagram"
                  className="text-brand-soft hover:text-foreground transition-colors"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                </a>
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
                  to="/stories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Graduate stories
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
              The academy promise
            </h3>
            <div className="space-y-2.5">
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
          <p>© {new Date().getFullYear()} Najeeb Academy. All rights reserved.</p>
          <p className="font-mono text-[10px] tracking-wider uppercase">
            Practical AI skills · Certificates you can verify
          </p>
        </div>
      </div>
    </footer>
  );
}
