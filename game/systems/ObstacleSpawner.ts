import * as Phaser from "phaser";
import { COLORS, PLAYER_SPEED } from "../config";
import { Obstacle } from "../entities/Obstacle";
import type { PatternId, PhaseConfig } from "../types";

type Side = "left" | "right" | "top" | "bottom";
type PendingKind = "bar" | "wall" | "orb";

interface Marker {
  shape: Phaser.GameObjects.Shape;
  pulse: boolean;
}

interface Pending {
  kind: PendingKind;
  remaining: number;
  total: number;
  markers: Marker[];
  fire(): void;
}

const SIDES: readonly Side[] = ["left", "right", "top", "bottom"];
const WALL_THICKNESS = 26;
const WALL_MARGIN = 24;
const LANE_MARGIN = 8;
/** Minimum clear space between parallel bars in a volley (about three player diameters). */
const VOLLEY_CLEARANCE = 90;
const PATTERN_COST: Record<PatternId, number> = {
  single: 1,
  aimed: 1,
  volley: 3,
  crossfire: 2,
  wall: 2,
  orb: 1,
};

/**
 * Spawns telegraphed obstacles. Everything enters from outside the arena after a visible
 * warning, so nothing can appear on top of the player, and walls are placed within reach of them.
 */
export class ObstacleSpawner {
  readonly obstacles: Obstacle[] = [];
  private pending: Pending[] = [];
  private nextAt = 0.6;
  private lastWallAt = -Infinity;
  private groupCounter = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly width: number,
    private readonly height: number,
    private readonly reducedMotion: boolean,
    private readonly rng: () => number = Math.random,
  ) {}

  reset(): void {
    for (const o of this.obstacles) o.destroy();
    this.obstacles.length = 0;
    for (const p of this.pending) this.destroyMarkers(p);
    this.pending.length = 0;
    this.nextAt = 0.6;
    this.lastWallAt = -Infinity;
  }

  /** Remove everything on screen, used when a run ends in victory. */
  clearObstacles(): void {
    this.reset();
  }

  update(
    dt: number,
    elapsed: number,
    phase: PhaseConfig,
    px: number,
    py: number,
  ): void {
    this.nextAt -= dt;
    if (this.nextAt <= 0) this.spawn(phase, elapsed, px, py);

    for (let i = this.pending.length - 1; i >= 0; i--) {
      const p = this.pending[i];
      p.remaining -= dt;
      if (p.remaining <= 0) {
        p.fire();
        this.destroyMarkers(p);
        this.pending.splice(i, 1);
      } else {
        this.animateMarkers(p);
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.update(dt, this.width, this.height);
      if (o.isGone(this.width, this.height)) {
        o.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  private rand(min: number, max: number): number {
    return min + this.rng() * (max - min);
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }

  private spawn(
    phase: PhaseConfig,
    elapsed: number,
    px: number,
    py: number,
  ): void {
    const live = this.obstacles.length + this.pending.length;
    const wallBusy = this.hasKind("wall");
    const orbs = this.countKind("orb");
    const options = phase.patterns.filter((id) => {
      if (live + PATTERN_COST[id] > phase.maxLive) return false;
      if (id === "wall")
        return (
          phase.wallEvery > 0 &&
          !wallBusy &&
          elapsed - this.lastWallAt >= phase.wallEvery
        );
      if (id === "orb") return orbs < phase.maxOrbs;
      if (wallBusy && (id === "volley" || id === "crossfire")) return false;
      return true;
    });
    if (options.length === 0) {
      this.nextAt = 0.25;
      return;
    }
    this.nextAt = phase.spawnInterval * this.rand(0.8, 1.2);
    const id = options[Math.floor(this.rng() * options.length)];
    switch (id) {
      case "single":
        this.spawnSingle(phase, false, px, py);
        break;
      case "aimed":
        this.spawnSingle(phase, true, px, py);
        break;
      case "volley":
        this.spawnVolley(phase, px, py);
        break;
      case "crossfire":
        this.spawnCrossfire(phase, px, py);
        break;
      case "wall":
        this.lastWallAt = elapsed;
        this.spawnWall(phase, px, py);
        break;
      case "orb":
        this.spawnOrb(phase, px, py);
        break;
    }
  }

  private hasKind(kind: PendingKind): boolean {
    return this.countKind(kind) > 0;
  }

  private countKind(kind: PendingKind): number {
    let n = 0;
    for (const p of this.pending) if (p.kind === kind) n++;
    // A wall is made of several segments but counts as one.
    if (kind === "wall")
      return n > 0 || this.obstacles.some((o) => o.kind === "wall") ? 1 : 0;
    for (const o of this.obstacles) if (o.kind === kind) n++;
    return n;
  }

  private randomSide(): Side {
    return SIDES[Math.floor(this.rng() * SIDES.length)];
  }

  private lanePos(
    horizontalTravel: boolean,
    aimed: boolean,
    px: number,
    py: number,
    thick: number,
  ): number {
    const size = horizontalTravel ? this.height : this.width;
    const target = horizontalTravel ? py : px;
    const raw = aimed ? target + this.rand(-40, 40) : this.rand(0, size);
    return this.clamp(
      raw,
      thick / 2 + LANE_MARGIN,
      size - thick / 2 - LANE_MARGIN,
    );
  }

  private spawnSingle(
    phase: PhaseConfig,
    aimed: boolean,
    px: number,
    py: number,
  ): void {
    const side = this.randomSide();
    const thick = this.rand(22, 32);
    const horizontal = side === "left" || side === "right";
    this.queueBar(
      phase,
      side,
      this.lanePos(horizontal, aimed, px, py, thick),
      thick,
      0,
    );
  }

  private spawnVolley(phase: PhaseConfig, px: number, py: number): void {
    const side = this.randomSide();
    const thick = this.rand(22, 28);
    const horizontal = side === "left" || side === "right";
    const step = thick + VOLLEY_CLEARANCE;
    const size = horizontal ? this.height : this.width;
    const centre = this.clamp(
      this.lanePos(horizontal, true, px, py, thick),
      step + thick,
      size - step - thick,
    );
    for (let i = -1; i <= 1; i++)
      this.queueBar(phase, side, centre + i * step, thick, (i + 1) * 0.15);
  }

  private spawnCrossfire(phase: PhaseConfig, px: number, py: number): void {
    const hSide: Side = this.rng() < 0.5 ? "left" : "right";
    const vSide: Side = this.rng() < 0.5 ? "top" : "bottom";
    const t1 = this.rand(22, 30);
    const t2 = this.rand(22, 30);
    this.queueBar(phase, hSide, this.lanePos(true, true, px, py, t1), t1, 0);
    // Staggered so both bars never reach the player at the same moment.
    this.queueBar(phase, vSide, this.lanePos(false, true, px, py, t2), t2, 0.4);
  }

  private queueBar(
    phase: PhaseConfig,
    side: Side,
    lane: number,
    thick: number,
    extraDelay: number,
  ): void {
    const horizontal = side === "left" || side === "right";
    const length = this.rand(50, 100);
    const speed = phase.speed * this.rand(0.95, 1.05);
    const dir = side === "left" || side === "top" ? 1 : -1;
    const w = horizontal ? length : thick;
    const h = horizontal ? thick : length;
    const groupId = ++this.groupCounter;
    const markers: Marker[] = [];

    if (horizontal) {
      markers.push(
        this.marker(
          this.width / 2,
          lane,
          this.width,
          thick,
          COLORS.hazard,
          false,
        ),
      );
      markers.push(
        this.marker(
          side === "left" ? 9 : this.width - 9,
          lane,
          18,
          thick + 8,
          COLORS.hazard,
          true,
        ),
      );
    } else {
      markers.push(
        this.marker(
          lane,
          this.height / 2,
          thick,
          this.height,
          COLORS.hazard,
          false,
        ),
      );
      markers.push(
        this.marker(
          lane,
          side === "top" ? 9 : this.height - 9,
          thick + 8,
          18,
          COLORS.hazard,
          true,
        ),
      );
    }

    const fire = () => {
      const x = horizontal
        ? side === "left"
          ? -w / 2 - 2
          : this.width + w / 2 + 2
        : lane;
      const y = horizontal
        ? lane
        : side === "top"
          ? -h / 2 - 2
          : this.height + h / 2 + 2;
      this.obstacles.push(
        Obstacle.bar(
          this.scene,
          "bar",
          groupId,
          x,
          y,
          w,
          h,
          horizontal ? dir * speed : 0,
          horizontal ? 0 : dir * speed,
        ),
      );
    };
    this.pending.push({
      kind: "bar",
      remaining: phase.telegraph + extraDelay,
      total: phase.telegraph + extraDelay,
      markers,
      fire,
    });
  }

  private spawnWall(phase: PhaseConfig, px: number, py: number): void {
    const vertical = this.rng() < 0.5; // vertical walls span the height and sweep sideways
    const fromStart = this.rng() < 0.5;
    const span = vertical ? this.height : this.width;
    const along = vertical ? py : px;
    const gap = phase.wallGap;
    const speed = phase.speed * 0.62;
    const telegraph = phase.telegraph + 0.5;
    // Keep the gap within a distance the player can cover before the wall arrives.
    const reach = PLAYER_SPEED * 0.5 * (telegraph + 0.5);
    const offset = (this.rng() * 2 - 1) * Math.min(span * 0.35, reach);
    const g = this.clamp(
      along + offset,
      gap / 2 + WALL_MARGIN,
      span - gap / 2 - WALL_MARGIN,
    );
    const segments: [number, number][] = [
      [0, g - gap / 2],
      [g + gap / 2, span],
    ];
    const dir = fromStart ? 1 : -1;
    const groupId = ++this.groupCounter;
    const markers: Marker[] = [];

    for (const [a, b] of segments) {
      const len = b - a;
      const mid = (a + b) / 2;
      if (vertical) {
        markers.push(
          this.marker(this.width / 2, mid, this.width, len, COLORS.wall, false),
        );
        markers.push(
          this.marker(
            fromStart ? 9 : this.width - 9,
            mid,
            18,
            len,
            COLORS.wall,
            true,
          ),
        );
      } else {
        markers.push(
          this.marker(
            mid,
            this.height / 2,
            len,
            this.height,
            COLORS.wall,
            false,
          ),
        );
        markers.push(
          this.marker(
            mid,
            fromStart ? 9 : this.height - 9,
            len,
            18,
            COLORS.wall,
            true,
          ),
        );
      }
    }

    const fire = () => {
      for (const [a, b] of segments) {
        const len = b - a;
        const mid = (a + b) / 2;
        if (vertical) {
          const x = fromStart
            ? -WALL_THICKNESS / 2 - 2
            : this.width + WALL_THICKNESS / 2 + 2;
          this.obstacles.push(
            Obstacle.bar(
              this.scene,
              "wall",
              groupId,
              x,
              mid,
              WALL_THICKNESS,
              len,
              dir * speed,
              0,
            ),
          );
        } else {
          const y = fromStart
            ? -WALL_THICKNESS / 2 - 2
            : this.height + WALL_THICKNESS / 2 + 2;
          this.obstacles.push(
            Obstacle.bar(
              this.scene,
              "wall",
              groupId,
              mid,
              y,
              len,
              WALL_THICKNESS,
              0,
              dir * speed,
            ),
          );
        }
      }
    };
    this.pending.push({
      kind: "wall",
      remaining: telegraph,
      total: telegraph,
      markers,
      fire,
    });
  }

  private spawnOrb(phase: PhaseConfig, px: number, py: number): void {
    const r = 12;
    const side = this.randomSide();
    const horizontal = side === "left" || side === "right";
    const along = this.rand(
      r + 20,
      (horizontal ? this.height : this.width) - r - 20,
    );
    const x = horizontal
      ? side === "left"
        ? -r - 2
        : this.width + r + 2
      : along;
    const y = horizontal
      ? along
      : side === "top"
        ? -r - 2
        : this.height + r + 2;
    const tx = this.clamp(px + this.rand(-120, 120), 40, this.width - 40);
    const ty = this.clamp(py + this.rand(-120, 120), 40, this.height - 40);
    const len = Math.hypot(tx - x, ty - y) || 1;
    const speed = phase.speed * 0.8;
    const vx = ((tx - x) / len) * speed;
    const vy = ((ty - y) / len) * speed;
    const groupId = ++this.groupCounter;

    const ex = this.clamp(x, 0, this.width);
    const ey = this.clamp(y, 0, this.height);
    const cap = this.scene.add
      .circle(ex, ey, r + 6, COLORS.hazard, 0.8)
      .setStrokeStyle(2, COLORS.hazardEdge, 1)
      .setDepth(2);
    const fire = () =>
      this.obstacles.push(
        Obstacle.orb(this.scene, groupId, x, y, r, vx, vy, 8),
      );
    this.pending.push({
      kind: "orb",
      remaining: phase.telegraph,
      total: phase.telegraph,
      markers: [{ shape: cap, pulse: true }],
      fire,
    });
  }

  private marker(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    pulse: boolean,
  ): Marker {
    const shape = this.scene.add
      .rectangle(x, y, w, h, color, pulse ? 0.8 : 0.07)
      .setDepth(pulse ? 3 : 1);
    if (pulse) shape.setStrokeStyle(2, COLORS.hazardEdge, 1);
    return { shape, pulse };
  }

  private animateMarkers(p: Pending): void {
    const progress = 1 - p.remaining / p.total;
    for (const m of p.markers) {
      if (m.pulse)
        m.shape.setAlpha(
          this.reducedMotion ? 0.85 : 0.5 + 0.4 * Math.sin(p.remaining * 22),
        );
      else m.shape.setAlpha(0.05 + 0.1 * progress);
    }
  }

  private destroyMarkers(p: Pending): void {
    for (const m of p.markers) m.shape.destroy();
  }
}
