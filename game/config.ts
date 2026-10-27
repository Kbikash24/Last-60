export const RUN_DURATION = 60;
export const PHASE_LENGTH = 10;
export const COUNTDOWN_SECONDS = 3;

export const PLAYER_RADIUS = 14;
/** Hitbox is smaller than the sprite so collisions feel fair. */
export const PLAYER_HITBOX = 10;
export const PLAYER_SPEED = 300;

/** Extra distance beyond the hitbox that counts as a near miss. */
export const NEAR_MISS_DISTANCE = 16;

export const JOYSTICK_RADIUS = 56;

export const COLORS = {
  bg: 0x050a18,
  grid: 0x12224d,
  cyan: 0x2d8cff,
  purple: 0x4f6bff,
  hazard: 0xff3d8b,
  hazardEdge: 0xffd0e2,
  wall: 0xff9a3d,
  white: 0xffffff,
  gold: 0xffd24a,
} as const;

/** Logical arena size. Portrait is chosen on tall screens so mobile gets a bigger play area. */
export function arenaSize(portrait: boolean): {
  width: number;
  height: number;
} {
  return portrait ? { width: 600, height: 800 } : { width: 800, height: 600 };
}
