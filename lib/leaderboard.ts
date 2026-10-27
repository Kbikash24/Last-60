export type LeaderboardPeriod = "all" | "week" | "today";

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  survivalTime: number;
  outcome: "gameover" | "victory";
}

const NICK_KEY = "last60:nickname:v1";

export function loadNickname(): string {
  try {
    return window.localStorage.getItem(NICK_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNickname(nickname: string): void {
  try {
    window.localStorage.setItem(NICK_KEY, nickname);
  } catch {
    // Preference just will not persist.
  }
}

/** Never throws; returns an error message the UI can show. */
export async function fetchLeaderboard(
  period: LeaderboardPeriod,
): Promise<
  { entries: LeaderboardEntry[]; error: null } | { entries: []; error: string }
> {
  try {
    const res = await fetch(`/api/leaderboard?period=${period}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as {
      entries?: LeaderboardEntry[];
      error?: string;
    };
    if (!res.ok || !data.entries)
      return {
        entries: [],
        error: data.error ?? "Could not load the leaderboard.",
      };
    return { entries: data.entries, error: null };
  } catch {
    return { entries: [], error: "Could not load the leaderboard." };
  }
}

/** Asks the server for a signed run-start token; null when the leaderboard is unavailable. */
export async function requestRunToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/run/start", { method: "POST" });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

export async function submitScore(payload: {
  token: string;
  nickname: string;
  run: {
    score: number;
    survivalTime: number;
    outcome: string;
    phaseIndex: number;
    nearMisses: number;
    bestStreak: number;
  };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error ?? "Could not submit your score." };
  } catch {
    return { ok: false, error: "Could not submit your score." };
  }
}
