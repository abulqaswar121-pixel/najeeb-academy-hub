/**
 * The ONLY place the service worker is registered. It refuses to run in dev,
 * inside iframes (the Lovable editor) and on preview hosts, and cleans up any
 * stray registration there. `?sw=off` is a manual kill switch.
 */
import { useSyncExternalStore } from "react";

const SW_URL = "/sw.js";

function isPreviewHost(host: string): boolean {
  const firstLabel = host.split(".")[0] ?? "";
  const lovableHost =
    host.endsWith(".lovable.app") || host.endsWith(".gpt-eng.com") || host.endsWith(".gptengineer.run");
  if (lovableHost && /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(firstLabel)) return true;
  if (/^project--[^.]+-dev$/.test(firstLabel) && lovableHost) return true;
  return (
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

async function unregisterAppWorkers() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active ?? r.installing ?? r.waiting)?.scriptURL.endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export function canUseOfflineMode(): boolean {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  const host = window.location.hostname.toLowerCase();
  const killed = new URLSearchParams(window.location.search).get("sw") === "off";
  return import.meta.env.PROD && !inIframe() && !isPreviewHost(host) && !killed;
}

/** Call once from the root layout's useEffect. */
export function registerAppServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!canUseOfflineMode()) {
    void unregisterAppWorkers();
    return;
  }
  navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {});
}

/** Ask the worker to keep a fresh copy of the saved-courses page. */
export function warmOfflinePage() {
  if (typeof window === "undefined" || !navigator.onLine || !canUseOfflineMode()) return;
  fetch("/offline", { credentials: "same-origin" }).catch(() => {});
}

/* ── Install prompt ─────────────────────────────────────────────── */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function listenForInstallPrompt() {
  if (typeof window === "undefined") return;
  installed =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    notify();
  });
  notify();
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  notify();
  return outcome === "accepted";
}

type InstallState = "installed" | "ready" | "manual";
let snapshot: InstallState = "manual";
function compute(): InstallState {
  snapshot = installed ? "installed" : deferred ? "ready" : "manual";
  return snapshot;
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    (cb) => {
      const wrapped = () => {
        compute();
        cb();
      };
      listeners.add(wrapped);
      return () => listeners.delete(wrapped);
    },
    () => compute(),
    () => "manual",
  );
}
