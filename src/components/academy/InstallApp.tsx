import { Link } from "@tanstack/react-router";
import { CheckCircle2, Download, Smartphone, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { promptInstall, useInstallState } from "../../lib/pwa";
import { Button } from "../ui/button";

/** Install button + short how-to. Works with the browser's own install prompt. */
export function InstallAppButton({ className = "" }: { className?: string }) {
  const state = useInstallState();
  const [isIos, setIsIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  if (state === "installed") {
    return (
      <p className={`text-success inline-flex items-center gap-2 text-sm font-bold ${className}`}>
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> App installed on this device
      </p>
    );
  }

  const onClick = async () => {
    if (state === "ready") {
      const ok = await promptInstall();
      if (ok) toast.success("NDH Academy is now on your home screen!");
      return;
    }
    setShowHelp((v) => !v);
  };

  return (
    <div className={className}>
      <Button
        onClick={onClick}
        size="lg"
        className="bg-gradient-cta shadow-glow-primary rounded-2xl px-8 font-extrabold"
      >
        <Download className="h-4 w-4" aria-hidden="true" /> Install the app
      </Button>
      {showHelp && (
        <p className="text-muted-foreground mt-3 max-w-sm text-xs leading-relaxed">
          {isIos
            ? "On iPhone: open this site in Safari, tap the Share button, then “Add to Home Screen”."
            : "Open your browser menu (⋮) and tap “Install app” or “Add to Home screen”."}
        </p>
      )}
    </div>
  );
}

export function InstallAppSection() {
  return (
    <div className="bg-card/90 border-border mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border p-6 text-left shadow-xl sm:flex-row sm:items-center sm:p-8">
      <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border">
        <Smartphone className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="text-foreground text-lg font-black tracking-tight sm:text-xl">
          Get the NDH Academy app
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Add the academy to your home screen in one tap — no app store needed. Save your course
          notes and keep reading even with no network.
        </p>
        <Link
          to="/offline"
          className="text-brand-soft inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
        >
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" /> My offline courses
        </Link>
      </div>
      <InstallAppButton className="shrink-0" />
    </div>
  );
}
