import type { LeaderboardEntry } from "@/lib/leaderboard";
import { sbFetch, supabaseConfigured } from "@/lib/server/supabase";

const PERIODS: Record<string, number | null> = {
  all: null,
  week: 7 * 24 * 60 * 60 * 1000,
  today: 24 * 60 * 60 * 1000,
};
const LIMIT = 50;
/** Fetch extra rows so we can keep one best score per nickname and still fill the board. */
const FETCH_ROWS = 300;

interface Row {
  nickname: string;
  score: number;
  survival_time: number;
  outcome: "gameover" | "victory";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) {
    return Response.json(
      { error: "Leaderboard is not configured." },
      { status: 503 },
    );
  }

  const period = new URL(request.url).searchParams.get("period") ?? "all";
  if (!(period in PERIODS))
    return Response.json({ error: "Invalid period." }, { status: 400 });

  const windowMs = PERIODS[period];
  let filter = "";
  if (windowMs)
    filter = `&created_at=gte.${encodeURIComponent(new Date(Date.now() - windowMs).toISOString())}`;

  try {
    const res = await sbFetch(
      `scores?select=nickname,score,survival_time,outcome&order=score.desc,created_at.asc&limit=${FETCH_ROWS}${filter}`,
    );
    if (!res.ok)
      return Response.json(
        { error: "Could not load the leaderboard." },
        { status: 502 },
      );
    const rows = (await res.json()) as Row[];

    const seen = new Set<string>();
    const entries: LeaderboardEntry[] = [];
    for (const row of rows) {
      const key = row.nickname.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        rank: entries.length + 1,
        nickname: row.nickname,
        score: row.score,
        survivalTime: Number(row.survival_time),
        outcome: row.outcome,
      });
      if (entries.length >= LIMIT) break;
    }

    return Response.json(
      { period, entries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Could not load the leaderboard." },
      { status: 502 },
    );
  }
}
