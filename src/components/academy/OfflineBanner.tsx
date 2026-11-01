import { Link } from "@tanstack/react-router";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/** Thin strip shown only while the device has no network. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="bg-secondary text-secondary-foreground flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold">
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      You're offline.
      <Link to="/offline" className="font-bold underline">
        Open saved courses
      </Link>
    </div>
  );
}
