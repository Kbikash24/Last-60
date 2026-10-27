"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Stats } from "@/lib/storage";
import type { RunResult } from "@/game/types";
import {
  BurstIcon,
  CrownIcon,
  FlameIcon,
  HomeIcon,
  RetryIcon,
  TargetIcon,
  TimerIcon,
  TrophyIcon,
} from "./icons";
import { Logo3D } from "./Logo3D";
import ShareScore from "./ShareScore";

interface Props {
  result: RunResult;
  stats: Stats;
  isNewBest: boolean;
  onRetry(): void;
}

export default function ResultsScreen({
  result,
  stats,
  isNewBest,
  onRetry,
}: Props) {
  const won = result.outcome === "victory";
  const words = won ? ["YOU", "SURVIVED!"] : ["GAME", "OVER"];

  return (
    <div className="anim-fade-in-late absolute inset-0 flex overflow-y-auto bg-black/65 p-2">
      <section
        aria-labelledby="result-title"
        className="results-panel m-auto flex w-full max-w-lg flex-col items-center gap-3 p-4 text-center sm:p-5"
      >
        <h2
          id="result-title"
          className="flex flex-wrap items-baseline justify-center text-4xl font-black italic leading-none sm:text-6xl"
        >
          <Logo3D text={words[0]} className="logo-last" />
          <Logo3D text={words[1]} className="logo-60" />
        </h2>

        {isNewBest && (
          <div className="flex w-full items-center gap-2 text-amber-400">
            <span className="h-px flex-1 bg-amber-400/40" aria-hidden="true" />
            <span aria-hidden="true">«</span>
            <p className="flex items-center gap-2 rounded-xl border-2 border-amber-400 bg-[#1a1204] px-4 py-1 text-xs font-extrabold tracking-widest shadow-[0_0_16px_rgba(255,194,61,0.45)] sm:text-sm">
              <CrownIcon className="text-lg" /> NEW BEST SCORE
            </p>
            <span aria-hidden="true">»</span>
            <span className="h-px flex-1 bg-amber-400/40" aria-hidden="true" />
          </div>
        )}

        <dl className="grid w-full grid-cols-2 gap-2 text-left sm:gap-3">
          <Tile
            color="#22e4ff"
            icon={<TimerIcon />}
            label="Survival time"
            value={`${result.survivalTime.toFixed(1)}s`}
          />
          <Tile
            color="#ffc23d"
            icon={<TrophyIcon />}
            label="Score"
            value={result.score.toLocaleString()}
          />
          <Tile
            color="#b57bff"
            icon={<CrownIcon />}
            label="Personal best"
            value={stats.bestScore.toLocaleString()}
          />
          <Tile
            color="#2ee6a6"
            icon={<TargetIcon />}
            label="Reached"
            value={result.phaseName}
          />
          <Tile
            color="#ff7a3d"
            icon={<BurstIcon />}
            label="Near misses"
            value={String(result.nearMisses)}
          />
          <Tile
            color="#ff3d8b"
            icon={<FlameIcon />}
            label="Best streak"
            value={String(result.bestStreak)}
          />
        </dl>

        <div className="mt-1 flex w-full items-center gap-2">
          <span
            className="text-2xl font-black text-cyan-300"
            aria-hidden="true"
          >
            «
          </span>
          <div className="retry-ring flex-1">
            <button
              type="button"
              className="btn-primary min-h-14 w-full !px-4 text-xl sm:text-2xl"
              onClick={onRetry}
              autoFocus
            >
              <RetryIcon className="text-2xl" />
              RETRY (R)
            </button>
          </div>
          <span
            className="text-2xl font-black text-fuchsia-400"
            aria-hidden="true"
          >
            »
          </span>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
          <ShareScore result={result} className="btn-dark w-full" />
          <Link href="/" className="btn-dark w-full">
            <HomeIcon className="text-xl" />
            MENU
          </Link>
        </div>
      </section>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="stat-tile" style={{ "--c": color } as CSSProperties}>
      <span className="stat-tile-icon">{icon}</span>
      <div className="min-w-0">
        <dt className="stat-tile-label">{label}</dt>
        <dd className="truncate text-xl font-extrabold leading-tight sm:text-2xl">
          {value}
        </dd>
      </div>
    </div>
  );
}
