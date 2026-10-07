import { Wrench } from "lucide-react";

import { courses as catalog } from "../../data/courses";

/**
 * Tools marquee — the academy's honest version of the agency client marquee:
 * instead of logos we don't have permission to show, it streams the real
 * professional tools students actually master inside the curriculum, ranked
 * by how many courses teach them.
 */

const tools = (() => {
  const freq = new Map<string, number>();
  for (const course of catalog) {
    for (const tool of course.tools) freq.set(tool, (freq.get(tool) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name]) => name);
})();

export function ToolsMarquee() {
  return (
    <div className="bg-surface border-border overflow-hidden border-y py-3 text-xs">
      <div className="animate-marquee text-muted-foreground flex items-center gap-10 whitespace-nowrap">
        {[...tools, ...tools].map((tool, i) => (
          <span key={`${tool}-${i}`} className="flex items-center gap-2">
            <Wrench className="text-brand-soft h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-foreground/80 font-bold tracking-wider">{tool}</span>
            <span className="text-muted-foreground/50">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
