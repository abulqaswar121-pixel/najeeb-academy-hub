import { Infinity as InfinityIcon, Ticket } from "lucide-react";

/**
 * Course-level pass messaging. Courses are never sold one-by-one — every
 * course is included in the All-Access Pass or costs one pass credit.
 */
export function CoursePassBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`bg-brand-subtle/90 border-primary/25 text-brand-soft inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase backdrop-blur ${className}`}
    >
      <InfinityIcon className="h-3 w-3" aria-hidden="true" />
      Included in All-Access or 1 Course Credit
    </span>
  );
}

/** Small "1 credit" chip used next to course affordances. */
export function CreditChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`border-border text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase ${className}`}
    >
      <Ticket className="h-3 w-3" aria-hidden="true" />1 credit
    </span>
  );
}
