"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { arenaSize } from "@/game/config";
import type { GameController } from "@/game/controller";
import type { GameSnapshot, RunResult } from "@/game/types";
import { audio } from "@/lib/audio";
import { requestRunToken } from "@/lib/leaderboard";
import { recordRun, type Stats } from "@/lib/storage";
import Countdown from "./Countdown";
import GameHUD from "./GameHUD";
import ResultsScreen from "./ResultsScreen";

const INITIAL_SNAPSHOT: GameSnapshot = {
  status: "countdown",
  countdown: 3,
  elapsed: 0,
  score: 0,
  phaseIndex: 0,
  phaseName: "Warm-up",
  streak: 0,
};

interface FinishedRun {
  run: RunResult;
  stats: Stats;
  isNewBest: boolean;
  /** Proof the run started on the server; null if the leaderboard is unavailable. */
  token: string | null;
}

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<GameController | null>(null);
  const runTokenRef = useRef<string | null>(null);
  // Arena orientation is fixed per mount; later rotation only rescales the canvas.
  const [size] = useState(() =>
    arenaSize(window.innerHeight > window.innerWidth * 1.1),
  );
  const [snap, setSnap] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const [finished, setFinished] = useState<FinishedRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const muted = useSyncExternalStore(
    audio.subscribe,
    audio.isMuted,
    () => false,
  );

  useEffect(() => {
    let disposed = false;
    let controller: GameController | null = null;
    // Guards against a slow token response from an earlier run landing on a newer one.
    let runSeq = 0;
    let tokenRequested = false;

    import("@/game/createGame")
      .then(({ createGame }) => {
        const parent = containerRef.current;
        if (disposed || !parent) return;
        controller = createGame({
          parent,
          width: size.width,
          height: size.height,
          onSnapshot: (s) => {
            setSnap(s);
            if (s.status === "countdown") {
              runSeq++;
              tokenRequested = false;
              runTokenRef.current = null;
            } else if (s.status === "playing" && !tokenRequested) {
              tokenRequested = true;
              const seq = runSeq;
              void requestRunToken().then((token) => {
                if (!disposed && seq === runSeq) runTokenRef.current = token;
              });
            }
          },
          onFinish: (run) => {
            const { stats, isNewBest } = recordRun(run);
            setFinished({ run, stats, isNewBest, token: runTokenRef.current });
          },
        });
        controllerRef.current = controller;
      })
      .catch(() => {
        if (!disposed)
          setError("The game failed to load. Please reload the page.");
      });

    return () => {
      disposed = true;
      controller?.destroy();
      controllerRef.current = null;
    };
  }, [size]);

  const retry = useCallback(() => {
    audio.play("click");
    setFinished(null);
    controllerRef.current?.retry();
  }, []);

  const togglePause = useCallback(() => {
    audio.play("click");
    if (snap.status === "paused") controllerRef.current?.resume();
    else controllerRef.current?.pause();
  }, [snap.status]);

  const toggleMute = useCallback(() => {
    audio.setMuted(!audio.isMuted());
    audio.play("click");
  }, []);

  const ratio = size.width / size.height;
  const canPause =
    snap.status === "playing" ||
    snap.status === "countdown" ||
    snap.status === "paused";

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert">{error}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-3 px-3 py-3">
      <GameHUD
        snapshot={snap}
        muted={muted}
        canPause={canPause}
        paused={snap.status === "paused"}
        onTogglePause={togglePause}
        onToggleMute={toggleMute}
      />

      <div
        className="relative mx-auto w-full select-none"
        style={{
          aspectRatio: `${size.width} / ${size.height}`,
          maxWidth: `calc((100dvh - 10rem) * ${ratio})`,
        }}
      >
        <div
          ref={containerRef}
          className="absolute inset-0 touch-none overflow-hidden rounded-xl border border-neon-cyan/40 shadow-[0_0_40px_rgba(45,140,255,0.2)]"
        />

        {snap.status === "countdown" && <Countdown value={snap.countdown} />}

        {snap.status === "playing" && snap.elapsed < 0.8 && (
          <p
            className="anim-pop title-glow pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-7xl font-black"
            aria-hidden="true"
          >
            GO!
          </p>
        )}

        {snap.status === "playing" &&
          snap.phaseIndex > 0 &&
          snap.elapsed >= 0.8 && (
            <p
              key={snap.phaseIndex}
              className="anim-banner pointer-events-none absolute inset-x-0 top-3 text-center text-lg font-black uppercase tracking-widest text-neon-cyan drop-shadow-[0_0_8px_rgba(45,140,255,0.8)]"
              aria-hidden="true"
            >
              {snap.phaseName}
            </p>
          )}

        {snap.status === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70">
            <h2 className="title-glow text-5xl font-black">PAUSED</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={togglePause}
                autoFocus
              >
                RESUME
              </button>
              <button type="button" className="btn-ghost" onClick={retry}>
                Restart
              </button>
              <Link href="/" className="btn-ghost">
                Menu
              </Link>
            </div>
          </div>
        )}

        {finished &&
          (snap.status === "gameover" || snap.status === "victory") && (
            <ResultsScreen
              result={finished.run}
              stats={finished.stats}
              isNewBest={finished.isNewBest}
              token={finished.token}
              onRetry={retry}
            />
          )}
      </div>

      <p className="text-center text-xs text-foreground/60">
        WASD / arrows to move · P or Esc to pause · R to retry · drag to steer
        on touch
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {snap.status === "playing"
          ? `Phase ${snap.phaseIndex + 1}: ${snap.phaseName}`
          : snap.status}
      </p>
    </main>
  );
}
