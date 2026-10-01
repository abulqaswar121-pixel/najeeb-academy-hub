import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`max-w-3xl space-y-4 ${align === "center" ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <div
          className={`bg-brand-subtle border-primary/30 text-brand-soft inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md`}
        >
          {eyebrow}
        </div>
      )}
      <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">{description}</p>
      )}
    </div>
  );
}
