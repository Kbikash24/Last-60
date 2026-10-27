import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const MAX_AGE_MS = 40 * 60 * 1000;

function secret(): string {
  const s = process.env.RUN_TOKEN_SECRET;
  if (!s) throw new Error("RUN_TOKEN_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** A signed "this run started at time T" token, so scores can't be submitted for runs that never took the time. */
export function issueRunToken(): string {
  const payload = `${randomUUID()}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyRunToken(
  token: unknown,
): { runId: string; startedAt: number } | null {
  if (typeof token !== "string" || token.length > 200) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [runId, started, sig] = parts;
  const expected = Buffer.from(sign(`${runId}.${started}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;
  const startedAt = Number(started);
  if (!Number.isFinite(startedAt)) return null;
  const age = Date.now() - startedAt;
  if (age < 0 || age > MAX_AGE_MS) return null;
  return { runId, startedAt };
}
