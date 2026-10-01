import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-card/60 border-border flex flex-col items-center rounded-3xl border border-dashed px-6 py-16 text-center">
      <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-14 w-14 items-center justify-center rounded-2xl border">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-foreground mt-5 text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
