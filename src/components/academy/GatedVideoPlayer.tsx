/**
 * GatedVideoPlayer — a locked-down YouTube player for course lessons.
 *
 * Protections:
 * - Privacy-enhanced youtube-nocookie embed with ALL native controls removed
 *   (controls=0, disablekb=1, fs=0, rel=0) so there is no "Watch on YouTube",
 *   no share button and no clickable title/logo.
 * - A transparent shield sits over the iframe: clicks only play/pause, and
 *   right-click (copy video URL) is blocked.
 * - First watch: forward seeking is disabled. Students can rewind freely but
 *   can never jump past the furthest point they have actually watched — a
 *   watchdog also snaps playback back if anything tries to skip ahead.
 * - Once the lesson window is fully watched (revision mode) seeking is free.
 * - A faint watermark with the student's email discourages screen-sharing.
 */
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<any> | null = null;

function loadYouTubeApi(): Promise<any> {
  if (typeof window === "undefined") return new Promise(() => undefined);
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
  }
  return apiPromise;
}

function fmt(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = `${s % 60}`.padStart(2, "0");
  return h > 0 ? `${h}:${`${m}`.padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export interface GatedVideoPlayerProps {
  videoId: string;
  /** Watch window inside the source video, in seconds. */
  start: number;
  end: number | null;
  /** Seconds of the window already watched (resume point / seek ceiling). */
  initialWatched: number;
  /** True once the lesson video has been fully watched — unlocks free seeking. */
  revisionMode: boolean;
  title: string;
  watermark: string;
  /** Throttled progress reports (watched seconds within window, window length, ended). */
  onProgress: (watchedSeconds: number, windowDuration: number, ended: boolean) => void;
}

const REPORT_INTERVAL_MS = 8000;
const FORWARD_GRACE_SECONDS = 2.5;

export function GatedVideoPlayer({
  videoId,
  start,
  end,
  initialWatched,
  revisionMode,
  title,
  watermark,
  onProgress,
}: GatedVideoPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const readyRef = useRef(false);
  const maxWatchedRef = useRef(Math.max(0, initialWatched));
  const lastReportRef = useRef(0);
  const endedRef = useRef(false);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const revisionRef = useRef(revisionMode);
  revisionRef.current = revisionMode;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [current, setCurrent] = useState(0); // seconds within window
  const [duration, setDuration] = useState(end !== null ? end - start : 0);
  const [blockedHint, setBlockedHint] = useState(false);

  const windowDuration = useCallback(() => {
    if (end !== null) return end - start;
    const d = playerRef.current?.getDuration?.() ?? 0;
    return d > 0 ? d - start : 0;
  }, [end, start]);

  const report = useCallback(
    (ended: boolean) => {
      const dur = windowDuration();
      if (dur <= 0) return;
      onProgressRef.current(
        Math.min(maxWatchedRef.current, dur),
        dur,
        ended || maxWatchedRef.current >= dur - 1,
      );
    },
    [windowDuration],
  );

  // Build the player (recreated when the lesson/video window changes).
  useEffect(() => {
    let cancelled = false;
    maxWatchedRef.current = Math.max(0, initialWatched);
    endedRef.current = false;
    lastReportRef.current = Date.now();
    setReady(false);
    setPlaying(false);
    setCurrent(Math.max(0, initialWatched));
    setDuration(end !== null ? end - start : 0);

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      const mount = document.createElement("div");
      mount.className = "h-full w-full";
      hostRef.current.replaceChildren(mount);
      playerRef.current = new YT.Player(mount, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
          start: Math.floor(start + Math.max(0, initialWatched)),
          ...(end !== null ? { end: Math.floor(end) } : {}),
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            readyRef.current = true;
            setReady(true);
            const d = end !== null ? end - start : playerRef.current.getDuration() - start;
            if (d > 0) setDuration(d);
          },
          onStateChange: (e: any) => {
            if (cancelled) return;
            if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
            if (e.data === YT.PlayerState.PAUSED) {
              setPlaying(false);
              report(false);
            }
            if (e.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              endedRef.current = true;
              const dur = windowDuration();
              if (dur > 0) maxWatchedRef.current = dur;
              report(true);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      readyRef.current = false;
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, start, end]);

  // Watchdog tick: track progress, clamp forward jumps, send throttled reports.
  useEffect(() => {
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player || !readyRef.current || typeof player.getCurrentTime !== "function") return;
      const t = player.getCurrentTime();
      if (typeof t !== "number" || Number.isNaN(t)) return;
      const pos = Math.max(0, t - start);
      const dur = windowDuration();
      if (dur > 0 && duration !== dur) setDuration(dur);

      if (!revisionRef.current && pos > maxWatchedRef.current + FORWARD_GRACE_SECONDS) {
        // Something skipped ahead on a first watch — snap back.
        player.seekTo(start + maxWatchedRef.current, true);
        setBlockedHint(true);
        setTimeout(() => setBlockedHint(false), 2600);
        return;
      }
      maxWatchedRef.current = Math.max(maxWatchedRef.current, Math.min(pos, dur > 0 ? dur : pos));
      setCurrent(pos);

      if (playing && Date.now() - lastReportRef.current >= REPORT_INTERVAL_MS) {
        lastReportRef.current = Date.now();
        report(false);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [start, playing, duration, report, windowDuration]);

  // Report once more on unmount so progress is never lost.
  useEffect(() => {
    return () => {
      if (maxWatchedRef.current > 0) report(endedRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fullscreen bookkeeping.
  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  };

  const seekTo = (pos: number) => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    const dur = windowDuration();
    let target = Math.max(0, Math.min(pos, dur > 0 ? dur : pos));
    if (!revisionRef.current && target > maxWatchedRef.current) {
      target = maxWatchedRef.current;
      setBlockedHint(true);
      setTimeout(() => setBlockedHint(false), 2600);
    }
    player.seekTo(start + target, true);
    setCurrent(target);
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    if (muted) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen();
  };

  const progressPct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const watchedPct = duration > 0 ? Math.min(100, (maxWatchedRef.current / duration) * 100) : 0;

  return (
    <div
      ref={frameRef}
      className="border-border bg-background/80 group/player relative flex flex-col overflow-hidden rounded-2xl border select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <div ref={hostRef} className="pointer-events-none h-full w-full" aria-hidden="true" />

        {/* Interaction shield — blocks every direct touch on the YouTube iframe. */}
        <button
          type="button"
          aria-label={playing ? `Pause — ${title}` : `Play — ${title}`}
          onClick={togglePlay}
          onDoubleClick={(e) => e.preventDefault()}
          className="absolute inset-0 z-10 block h-full w-full cursor-pointer bg-transparent"
        />

        {/* Watermark */}
        <span
          className="text-foreground/25 pointer-events-none absolute right-3 bottom-3 z-10 font-mono text-[10px] tracking-wide"
          aria-hidden="true"
        >
          {watermark} · Najeeb Academy
        </span>

        {/* Big play button while paused */}
        {ready && !playing && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="bg-gradient-cta shadow-glow-primary flex h-16 w-16 items-center justify-center rounded-2xl">
              <Play className="text-primary-foreground ml-0.5 h-7 w-7" aria-hidden="true" />
            </span>
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse font-mono text-xs">
              Loading secure player…
            </span>
          </div>
        )}

        {blockedHint && (
          <div className="absolute inset-x-0 top-3 z-20 flex justify-center px-4">
            <p className="bg-card/95 border-primary/40 text-foreground rounded-full border px-4 py-1.5 text-xs font-bold shadow-xl">
              Fast-forward unlocks after your first full watch — rewinding is always allowed.
            </p>
          </div>
        )}
      </div>

      {/* Custom control bar */}
      <div className="bg-card/95 border-border z-10 border-t px-3 py-2.5 sm:px-4">
        {/* Seek bar */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.floor(duration))}
            step={1}
            value={Math.floor(current)}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek within lesson video"
            className="accent-primary relative z-10 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-transparent"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${progressPct}%, color-mix(in oklab, var(--primary) 28%, transparent) ${progressPct}%, color-mix(in oklab, var(--primary) 28%, transparent) ${watchedPct}%, var(--border) ${watchedPct}%, var(--border) 100%)`,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="bg-gradient-cta text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-transform hover:scale-105"
            >
              {playing ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => seekTo(current - 10)}
              aria-label="Rewind 10 seconds"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <span className="text-muted-foreground ml-1 font-mono text-[11px] tabular-nums">
              {fmt(current)} / {duration > 0 ? fmt(duration) : "--:--"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider uppercase sm:inline ${
                revisionMode
                  ? "border-success/40 text-success"
                  : "border-primary/40 text-brand-soft"
              }`}
            >
              {revisionMode ? "Revision mode — free seeking" : "First watch — no skipping"}
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            >
              {fullscreen ? (
                <Minimize className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Maximize className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
