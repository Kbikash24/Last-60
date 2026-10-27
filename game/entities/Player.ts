import * as Phaser from "phaser";
import { COLORS, PLAYER_RADIUS } from "../config";

/** Cyan orb with a glow and a ring; the ring keeps it distinct from hazards without relying on colour. */
export class Player {
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly body: Phaser.GameObjects.Arc;
  private readonly ring: Phaser.GameObjects.Arc;
  x = 0;
  y = 0;

  constructor(scene: Phaser.Scene) {
    this.glow = scene.add
      .circle(0, 0, PLAYER_RADIUS * 2, COLORS.cyan, 0.16)
      .setDepth(8);
    this.body = scene.add
      .circle(0, 0, PLAYER_RADIUS, COLORS.cyan, 1)
      .setStrokeStyle(3, COLORS.white, 1)
      .setDepth(9);
    this.ring = scene.add
      .circle(0, 0, PLAYER_RADIUS * 0.45, 0x07060f, 1)
      .setDepth(10);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.glow.setPosition(x, y);
    this.body.setPosition(x, y);
    this.ring.setPosition(x, y);
  }

  setVisible(visible: boolean): void {
    this.glow.setVisible(visible);
    this.body.setVisible(visible);
    this.ring.setVisible(visible);
  }

  /** Gentle glow pulse; skipped when motion is reduced. */
  pulse(time: number): void {
    this.glow.setAlpha(0.14 + 0.06 * Math.sin(time / 180));
  }
}
