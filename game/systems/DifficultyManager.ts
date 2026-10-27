import { COLORS, PHASE_LENGTH, RUN_DURATION } from "../config";
import type { PhaseConfig } from "../types";

export const PHASES: readonly PhaseConfig[] = [
  {
    index: 0,
    name: "Warm-up",
    speed: 170,
    spawnInterval: 1.25,
    telegraph: 1.0,
    maxLive: 3,
    patterns: ["single"],
    wallEvery: 0,
    wallGap: 0,
    maxOrbs: 0,
    color: COLORS.cyan,
  },
  {
    index: 1,
    name: "Speed Up",
    speed: 210,
    spawnInterval: 1.0,
    telegraph: 0.9,
    maxLive: 4,
    patterns: ["single", "aimed"],
    wallEvery: 0,
    wallGap: 0,
    maxOrbs: 0,
    color: 0x5aa8ff,
  },
  {
    index: 2,
    name: "Crossfire",
    speed: 230,
    spawnInterval: 1.0,
    telegraph: 0.85,
    maxLive: 6,
    patterns: ["single", "aimed", "volley", "crossfire"],
    wallEvery: 0,
    wallGap: 0,
    maxOrbs: 0,
    color: 0x7c8cff,
  },
  {
    index: 3,
    name: "Chaos",
    speed: 240,
    spawnInterval: 0.9,
    telegraph: 0.8,
    maxLive: 7,
    patterns: ["aimed", "volley", "crossfire", "orb", "wall"],
    wallEvery: 7,
    wallGap: 170,
    maxOrbs: 2,
    color: COLORS.purple,
  },
  {
    index: 4,
    name: "Survival",
    speed: 255,
    spawnInterval: 0.85,
    telegraph: 0.75,
    maxLive: 8,
    patterns: ["aimed", "volley", "crossfire", "orb", "wall"],
    wallEvery: 5.5,
    wallGap: 130,
    maxOrbs: 3,
    color: 0xd946ef,
  },
  {
    index: 5,
    name: "Final Rush",
    speed: 300,
    spawnInterval: 0.7,
    telegraph: 0.7,
    maxLive: 9,
    patterns: ["aimed", "volley", "crossfire", "orb", "wall"],
    wallEvery: 5,
    wallGap: 120,
    maxOrbs: 3,
    color: COLORS.hazard,
  },
];

export function getPhase(elapsed: number): PhaseConfig {
  const i = Math.min(
    PHASES.length - 1,
    Math.max(0, Math.floor(elapsed / PHASE_LENGTH)),
  );
  return PHASES[i];
}

export function phaseName(index: number): string {
  return PHASES[Math.min(PHASES.length - 1, Math.max(0, index))].name;
}

export const TOTAL_PHASES = RUN_DURATION / PHASE_LENGTH;
