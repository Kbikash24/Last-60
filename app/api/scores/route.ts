import { createHash } from "node:crypto";
import { validateNickname } from "@/lib/nickname";
import { verifyRunToken } from "@/lib/server/runToken";
import { sbFetch, supabaseConfigured } from "@/lib/server/supabase";
import { validateRun } from "@/lib/server/validateRun";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 20;

function ipHash(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return createHash("sha256")
    .update(`${ip}:${process.env.RUN_TOKEN_SECRET}`)
    .digest("hex");
}

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return fail("Leaderboard is not configured.", 503);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object")
      return fail("Invalid request.", 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("Invalid request.", 400);
  }

  const nickname = validateNickname(body.nickname);
  if (!nickname.ok) return fail(nickname.error, 400);

  const token = verifyRunToken(body.token);
  if (!token) return fail("This run has expired or is invalid.", 400);

  const checked = validateRun(body.run, Date.now() - token.startedAt);
  if (!checked.ok) return fail(checked.error, 400);

  const hash = ipHash(request);
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  try {
    const recent = await sbFetch(
      `scores?select=id&ip_hash=eq.${hash}&created_at=gte.${encodeURIComponent(since)}`,
      {
        headers: { Prefer: "count=exact", Range: "0-0" },
      },
    );
    const total = Number(
      recent.headers.get("content-range")?.split("/")[1] ?? 0,
    );
    if (total >= RATE_LIMIT)
      return fail("Too many submissions. Try again in a few minutes.", 429);

    const { run } = checked;
    const res = await sbFetch("scores", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        run_id: token.runId,
        nickname: nickname.value,
        score: run.score,
        survival_time: run.survivalTime,
        outcome: run.outcome,
        phase_index: run.phaseIndex,
        near_misses: run.nearMisses,
        best_streak: run.bestStreak,
        ip_hash: hash,
      }),
    });
    if (res.status === 409)
      return fail("This score was already submitted.", 409);
    if (!res.ok) return fail("Could not save your score.", 502);
  } catch {
    return fail("Could not save your score.", 502);
  }

  return Response.json({ ok: true });
}
