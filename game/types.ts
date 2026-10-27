export type RunStatus =
  | "countdown"
  | "playing"
  | "paused"
  | "gameover"
  | "victory";

export type RunOutcome = "gameover" | "victory";

export interface GameSnapshot {
  status: RunStatus;
  /** Whole seconds left in the pre-run countdown (3..1). */
  countdown: number;
  /** Seconds survived, 0..60. */
  elapsed: number;
  score: number;
  phaseIndex: number;
  phaseName: string;
  streak: number;
}

export interface RunResult {
  outcome: RunOutcome;
  survivalTime: number;
  score: number;
  phaseIndex: number;
  phaseName: string;
  bestStreak: number;
  nearMisses: number;
}

export type PatternId =
  | "single"
  | "aimed"
  | "volley"
  | "crossfire"
  | "wall"
  | "orb";

export interface PhaseConfig {
  index: number;
  name: string;
  /** Base obstacle speed in logical px/s. */
  speed: number;
  /** Seconds between spawn attempts. */
  spawnInterval: number;
  /** Seconds a warning is shown before an obstacle enters the arena. */
  telegraph: number;
  /** Cap on live obstacles plus pending warnings. */
  maxLive: number;
  patterns: PatternId[];
  /** Seconds between sweeping walls; 0 disables walls. */
  wallEvery: number;
  /** Width of the safe gap in a wall, in px. */
  wallGap: number;
  maxOrbs: number;
  color: number;
}
