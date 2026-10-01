import {
  AudioLines,
  BarChart3,
  Blocks,
  Briefcase,
  Clapperboard,
  Headset,
  Megaphone,
  Palette,
  PenTool,
  Search,
  Sparkles,
  Terminal,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Terminal,
  PenTool,
  Search,
  Clapperboard,
  Palette,
  Workflow,
  Blocks,
  Megaphone,
  Briefcase,
  Headset,
  BarChart3,
  AudioLines,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
