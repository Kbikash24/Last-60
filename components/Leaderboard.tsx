"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from "@/lib/leaderboard";
import { CrownIcon, PlayIcon, TimerIcon, TrophyIcon } from "./icons";

const TABS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "week", label: "This week" },
  { id: "today", label: "Today" },
];

interface Loaded {
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  error: string | null;
}

const MEDALS = ["#ffc23d", "#c8d3e6", "#e08a4a"];

export default function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(period).then((res) => {
      if (!cancelled)
        setLoaded({ period, entries: res.entries, error: res.error });
    });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const loading = !loaded || loaded.period !== period;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-5 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <TrophyIcon className="text-5xl text-amber-400" />
        <h1 className="title-glow text-4xl font-black italic sm:text-5xl">
          Leaderboard
        </h1>
        <p className="text-sm text-foreground/70">
          Best score per player. Dodge for 60 seconds and claim the top spot.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Time range"
        className="grid grid-cols-3 gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={period === tab.id}
            onClick={() => setPeriod(tab.id)}
            className={
              period === tab.id
                ? "btn-primary !min-h-11 !px-3 text-sm"
                : "btn-dark"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        className="neon-panel p-3 sm:p-4"
        aria-live="polite"
        aria-busy={loading}
      >
        {loading && (
          <p className="py-10 text-center text-foreground/70">Loading…</p>
        )}

        {!loading && loaded?.error && (
          <p role="alert" className="py-10 text-center text-amber-300">
            {loaded.error}
          </p>
        )}

        {!loading && !loaded?.error && loaded?.entries.length === 0 && (
          <p className="py-10 text-center text-foreground/70">
            No scores yet. Be the first!
          </p>
        )}

        {!loading && loaded && loaded.entries.length > 0 && (
          <ol className="flex flex-col gap-1.5">
            {loaded.entries.map((e) => (
              <li
                key={`${e.rank}-${e.nickname}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <span
                  className="w-8 text-center font-mono text-lg font-black"
                  style={{ color: MEDALS[e.rank - 1] ?? "#8fb4ff" }}
                >
                  {e.rank <= 3 ? (
                    <CrownIcon className="mx-auto text-2xl" />
                  ) : (
                    e.rank
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold">
                  {e.nickname}
                </span>
                <span className="flex items-center gap-1 text-xs text-foreground/60">
                  <TimerIcon className="text-sm" />
                  {e.survivalTime.toFixed(1)}s
                </span>
                <span className="w-16 text-right font-mono text-lg font-extrabold">
                  {e.score.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/game" className="btn-primary text-lg">
          <PlayIcon aria-hidden="true" />
          PLAY
        </Link>
        <Link href="/" className="btn-dark">
          Menu
        </Link>
      </div>
    </main>
  );
}
