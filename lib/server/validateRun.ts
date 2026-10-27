import { PHASE_LENGTH, RUN_DURATION } from "@/game/config";
import { SCORING } from "@/game/systems/ScoreManager";

export interface SubmittedRun {
  score: number;
  survivalTime: number;
  outcome: "gameover" | "victory";
  phaseIndex: number;
  nearMisses: number;
  bestStreak: number;
}

/** Wall-clock slack for network latency between starting a run and fetching its token. */
const TIME_TOLERANCE_S = 3;
const lastPhase = Math.floor(RUN_DURATION / PHASE_LENGTH) - 1;

function isInt(v: unknown, min: number, max: number): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
}

/**
 * Rejects runs that are impossible under the game's own scoring rules.
 * This stops casual tampering; it cannot make a client-side game cheat-proof.
 */
export function validateRun(
  input: unknown,
  elapsedMs: number,
): { ok: true; run: SubmittedRun } | { ok: false; error: string } {
  if (!input || typeof input !== "object")
    return { ok: false, error: "Invalid run." };
  const r = input as Record<string, unknown>;
  const { score, survivalTime, outcome, phaseIndex, nearMisses, bestStreak } =
    r;

  if (outcome !== "gameover" && outcome !== "victory")
    return { ok: false, error: "Invalid run." };
  if (
    typeof survivalTime !== "number" ||
    !Number.isFinite(survivalTime) ||
    survivalTime < 0 ||
    survivalTime > RUN_DURATION
  ) {
    return { ok: false, error: "Invalid run." };
  }
  if (
    !isInt(score, 0, 10000) ||
    !isInt(phaseIndex, 0, lastPhase) ||
    !isInt(nearMisses, 0, 1000) ||
    !isInt(bestStreak, 0, 1000)
  ) {
    return { ok: false, error: "Invalid run." };
  }

  const victory = outcome === "victory";
  if (victory && survivalTime < RUN_DURATION - 0.1)
    return { ok: false, error: "Invalid run." };
  if (!victory && survivalTime >= RUN_DURATION)
    return { ok: false, error: "Invalid run." };

  const minPhase = Math.min(
    lastPhase,
    Math.floor(Math.max(0, survivalTime - 0.05) / PHASE_LENGTH),
  );
  const maxPhase = Math.min(lastPhase, Math.floor(survivalTime / PHASE_LENGTH));
  if (phaseIndex < minPhase || phaseIndex > maxPhase)
    return { ok: false, error: "Invalid run." };

  if (
    nearMisses > Math.floor(survivalTime / SCORING.nearMissCooldown) + 1 ||
    bestStreak > nearMisses
  ) {
    return { ok: false, error: "Invalid run." };
  }

  const phasesDone = victory ? lastPhase + 1 : phaseIndex;
  const base =
    phasesDone * SCORING.phaseComplete + (victory ? SCORING.victory : 0);
  const minSeconds = Math.floor(Math.max(0, survivalTime - 0.05));
  const maxSeconds = Math.floor(survivalTime);
  const min =
    minSeconds * SCORING.perSecond + base + nearMisses * SCORING.nearMiss;
  const max =
    maxSeconds * SCORING.perSecond +
    base +
    nearMisses * (SCORING.nearMiss + SCORING.streakBonus);
  if (score < min || score > max) return { ok: false, error: "Invalid run." };

  if (elapsedMs / 1000 < survivalTime - TIME_TOLERANCE_S)
    return { ok: false, error: "Invalid run." };

  return {
    ok: true,
    run: {
      score,
      survivalTime: Math.round(survivalTime * 10) / 10,
      outcome,
      phaseIndex,
      nearMisses,
      bestStreak,
    },
  };
}
