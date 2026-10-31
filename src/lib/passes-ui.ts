import type { PassTierId } from "../data/passes";

/**
 * Display names for the four passes. The stored tier names stay short
 * ("Starter") for data/admin use; the storefront always speaks in full
 * product names ("Starter Pass").
 */
const PASS_NAMES: Record<PassTierId, string> = {
  starter: "Starter Pass",
  skill: "Skill Pack",
  pro: "Pro Track",
  all: "All-Access Pass",
};

export function passName(id: PassTierId): string {
  return PASS_NAMES[id];
}
