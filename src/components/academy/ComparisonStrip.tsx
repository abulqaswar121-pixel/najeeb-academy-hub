import { Check, X } from "lucide-react";

/**
 * "Typical video courses vs Najeeb Academy" — the problem/solution comparison
 * the agency uses on its About page (managed bureau vs freelancer chaos),
 * adapted to unverifiable video courses vs the academy's proof-based method.
 */

const left = [
  "Hours of video with no proof you can do the work afterwards.",
  'Certificates of "completion" that nobody can verify — employers ignore them.',
  "No project, no portfolio — just a progress bar and a certificate PDF.",
  "Subscriptions that keep billing you whether you finish or not.",
];

const right = [
  "Every lesson ends in a working exercise — prove each skill as you go.",
  "A signed certificate with a public verification code anyone can check.",
  "A real capstone project per course — a portfolio that grows with you.",
  "One-time fee per course. Lifetime access. No subscriptions, ever.",
];

export function ComparisonStrip() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* The problem */}
      <div className="bg-card border-border rounded-3xl border p-8 shadow-xl sm:p-10">
        <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          Typical video courses
        </p>
        <h3 className="text-foreground mt-2 text-xl font-black">The problem</h3>
        <ul className="mt-6 space-y-4">
          {left.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="bg-destructive/10 border-destructive/30 text-destructive flex h-6 w-6 shrink-0 items-center justify-center rounded-md border">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-muted-foreground text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* The academy answer */}
      <div className="band-dark relative overflow-hidden rounded-3xl p-8 sm:p-10">
        <div className="hero-glow -top-16 -right-16 h-[220px] w-[320px]" aria-hidden="true" />
        <p className="text-brand-soft relative text-xs font-bold tracking-wider uppercase">
          Najeeb Academy
        </p>
        <h3 className="text-foreground relative mt-2 text-xl font-black">The answer</h3>
        <ul className="relative mt-6 space-y-4">
          {right.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="bg-success/15 border-success/40 text-success flex h-6 w-6 shrink-0 items-center justify-center rounded-md border">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-muted-foreground text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
