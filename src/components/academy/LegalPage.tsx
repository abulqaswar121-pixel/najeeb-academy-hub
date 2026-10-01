import type { ReactNode } from "react";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-brand-soft font-mono text-xs font-bold tracking-widest uppercase">Legal</p>
      <h1 className="text-foreground mt-3 text-4xl font-black tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="text-muted-foreground mt-5 max-w-3xl text-base leading-7">{intro}</p>
      <p className="text-muted-foreground mt-3 text-xs">Last updated: 1 October 2026</p>
      <div className="legal-content mt-12 space-y-9">{children}</div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-foreground text-xl font-bold">{title}</h2>
      <div className="text-muted-foreground space-y-3 text-sm leading-7">{children}</div>
    </section>
  );
}
