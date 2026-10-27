import { RUN_DURATION } from "../config";

export const SCORING = {
  perSecond: 10,
  nearMiss: 10,
  /** Extra points per near miss once the streak reaches the threshold. */
  streakBonus: 5,
  streakThreshold: 3,
  /** Seconds without a near miss before the streak resets. */
  streakWindow: 4,
  nearMissCooldown: 0.2,
  phaseComplete: 25,
  victory: 100,
} as const;

export class ScoreManager {
  private bonus = 0;
  private completedPhases = new Set<number>();
  private lastNearMissAt = -Infinity;
  private won = false;
  streak = 0;
  bestStreak = 0;

  reset(): void {
    this.bonus = 0;
    this.completedPhases.clear();
    this.lastNearMissAt = -Infinity;
    this.won = false;
    this.streak = 0;
    this.bestStreak = 0;
  }

  total(elapsed: number): number {
    const seconds = Math.min(RUN_DURATION, Math.floor(elapsed));
    return seconds * SCORING.perSecond + this.bonus;
  }

  /** Each phase pays out once, no matter how often it is reported. */
  completePhase(index: number): boolean {
    if (this.completedPhases.has(index)) return false;
    this.completedPhases.add(index);
    this.bonus += SCORING.phaseComplete;
    return true;
  }

  win(): void {
    if (this.won) return;
    this.won = true;
    this.bonus += SCORING.victory;
  }

  /** Returns points awarded (0 while on cooldown). */
  registerNearMiss(now: number): number {
    if (now - this.lastNearMissAt < SCORING.nearMissCooldown) return 0;
    this.lastNearMissAt = now;
    this.streak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    const points =
      SCORING.nearMiss +
      (this.streak >= SCORING.streakThreshold ? SCORING.streakBonus : 0);
    this.bonus += points;
    return points;
  }

  tick(now: number): void {
    if (this.streak > 0 && now - this.lastNearMissAt > SCORING.streakWindow)
      this.streak = 0;
  }
}
