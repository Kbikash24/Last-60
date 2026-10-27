import * as Phaser from "phaser";
import { COLORS } from "../config";

export type ObstacleKind = "bar" | "wall" | "orb";

/** Axis-aligned bar/wall segment or a bouncing orb, with manual collision geometry. */
export class Obstacle {
  readonly shape: Phaser.GameObjects.Shape;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age = 0;
  scored = false;
  private readonly halfW: number;
  private readonly halfH: number;
  private readonly radius: number;
  private readonly life: number;

  private constructor(
    readonly kind: ObstacleKind,
    readonly groupId: number,
    shape: Phaser.GameObjects.Shape,
    x: number,
    y: number,
    halfW: number,
    halfH: number,
    radius: number,
    vx: number,
    vy: number,
    life: number,
  ) {
    this.shape = shape;
    this.x = x;
    this.y = y;
    this.halfW = halfW;
    this.halfH = halfH;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
  }

  static bar(
    scene: Phaser.Scene,
    kind: "bar" | "wall",
    groupId: number,
    x: number,
    y: number,
    w: number,
    h: number,
    vx: number,
    vy: number,
  ): Obstacle {
    const color = kind === "wall" ? COLORS.wall : COLORS.hazard;
    const shape = scene.add
      .rectangle(x, y, w, h, color, 0.95)
      .setStrokeStyle(3, COLORS.hazardEdge, 1)
      .setDepth(5);
    return new Obstacle(
      kind,
      groupId,
      shape,
      x,
      y,
      w / 2,
      h / 2,
      0,
      vx,
      vy,
      Infinity,
    );
  }

  static orb(
    scene: Phaser.Scene,
    groupId: number,
    x: number,
    y: number,
    r: number,
    vx: number,
    vy: number,
    life: number,
  ): Obstacle {
    const shape = scene.add
      .circle(x, y, r, COLORS.hazard, 0.95)
      .setStrokeStyle(3, COLORS.hazardEdge, 1)
      .setDepth(5);
    return new Obstacle("orb", groupId, shape, x, y, 0, 0, r, vx, vy, life);
  }

  /** Orbs stop being dangerous during their fade-out. */
  get lethal(): boolean {
    return this.age < this.life - 0.5;
  }

  get expired(): boolean {
    return this.age >= this.life;
  }

  update(dt: number, width: number, height: number): void {
    this.age += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.kind === "orb") {
      const r = this.radius;
      if (this.x - r < 0 && this.vx < 0) this.vx = -this.vx;
      else if (this.x + r > width && this.vx > 0) this.vx = -this.vx;
      if (this.y - r < 0 && this.vy < 0) this.vy = -this.vy;
      else if (this.y + r > height && this.vy > 0) this.vy = -this.vy;
      const remaining = this.life - this.age;
      this.shape.setAlpha(
        remaining < 0.5 ? Math.max(0, remaining / 0.5) * 0.95 : 0.95,
      );
    }
    this.shape.setPosition(this.x, this.y);
  }

  /** Distance from a point to the obstacle's edge (0 when inside a bar). */
  distanceTo(px: number, py: number): number {
    if (this.kind === "orb")
      return Math.hypot(px - this.x, py - this.y) - this.radius;
    const dx = Math.max(Math.abs(px - this.x) - this.halfW, 0);
    const dy = Math.max(Math.abs(py - this.y) - this.halfH, 0);
    return Math.hypot(dx, dy);
  }

  /** True once a straight-moving bar has fully left the arena going outward. */
  isGone(width: number, height: number): boolean {
    if (this.kind === "orb") return this.expired;
    return (
      (this.vx < 0 && this.x + this.halfW < 0) ||
      (this.vx > 0 && this.x - this.halfW > width) ||
      (this.vy < 0 && this.y + this.halfH < 0) ||
      (this.vy > 0 && this.y - this.halfH > height)
    );
  }

  destroy(): void {
    this.shape.destroy();
  }
}
