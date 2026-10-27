import type { RunResult } from "@/game/types";

const STATS_KEY = "last60:stats:v1";
const PREFS_KEY = "last60:prefs:v1";
const STATS_EVENT = "last60:stats-changed";

export interface Stats {
  bestScore: number;
  longestSurvival: number;
  totalRuns: number;
  completedRuns: number;
  bestStreak: number;
}

export const EMPTY_STATS: Stats = {
  bestScore: 0,
  longestSurvival: 0,
  totalRuns: 0,
  completedRuns: 0,
  bestStreak: 0,
};

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

export function readStatsRaw(): string {
  try {
    return window.localStorage.getItem(STATS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function parseStats(raw: string): Stats {
  if (!raw) return EMPTY_STATS;
  try {
    const data = JSON.parse(raw) as Partial<Record<keyof Stats, unknown>>;
    return {
      bestScore: num(data.bestScore),
      longestSurvival: num(data.longestSurvival),
      totalRuns: num(data.totalRuns),
      completedRuns: num(data.completedRuns),
      bestStreak: num(data.bestStreak),
    };
  } catch {
    return EMPTY_STATS;
  }
}

export function subscribeStats(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STATS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STATS_EVENT, callback);
  };
}

/** Saves a finished run and reports whether it beat the previous best score. */
export function recordRun(run: RunResult): {
  stats: Stats;
  isNewBest: boolean;
} {
  const prev = parseStats(readStatsRaw());
  const isNewBest = run.score > prev.bestScore;
  const stats: Stats = {
    bestScore: Math.max(prev.bestScore, run.score),
    longestSurvival: Math.max(prev.longestSurvival, run.survivalTime),
    totalRuns: prev.totalRuns + 1,
    completedRuns: prev.completedRuns + (run.outcome === "victory" ? 1 : 0),
    bestStreak: Math.max(prev.bestStreak, run.bestStreak),
  };
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    window.dispatchEvent(new Event(STATS_EVENT));
  } catch {
    // Storage may be unavailable (private mode or quota); the run still displays.
  }
  return { stats, isNewBest };
}

export function loadMuted(): boolean {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw
      ? Boolean((JSON.parse(raw) as { muted?: unknown }).muted)
      : false;
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ muted }));
  } catch {
    // Ignore: preference simply will not persist.
  }
}
