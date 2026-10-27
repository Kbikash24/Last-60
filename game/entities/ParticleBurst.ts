import * as Phaser from "phaser";

interface Particle {
  shape: Phaser.GameObjects.Arc;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/** Fixed-size particle pool so bursts never allocate during play. */
export class ParticleBurst {
  private readonly pool: Particle[] = [];

  constructor(scene: Phaser.Scene, size = 48) {
    for (let i = 0; i < size; i++) {
      const shape = scene.add
        .circle(0, 0, 3, 0xffffff, 1)
        .setDepth(12)
        .setVisible(false);
      this.pool.push({ shape, vx: 0, vy: 0, life: 0, maxLife: 1 });
    }
  }

  burst(
    x: number,
    y: number,
    colors: readonly number[],
    count: number,
    speed: number,
  ): void {
    let spawned = 0;
    for (const p of this.pool) {
      if (spawned >= count) break;
      if (p.life > 0) continue;
      const angle = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.6);
      p.vx = Math.cos(angle) * v;
      p.vy = Math.sin(angle) * v;
      p.maxLife = p.life = 0.5 + Math.random() * 0.5;
      p.shape
        .setPosition(x, y)
        .setFillStyle(colors[spawned % colors.length], 1)
        .setScale(1)
        .setAlpha(1)
        .setVisible(true);
      spawned++;
    }
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.shape.setVisible(false);
        continue;
      }
      p.shape.x += p.vx * dt;
      p.shape.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.shape.setAlpha(p.life / p.maxLife);
    }
  }

  clear(): void {
    for (const p of this.pool) {
      p.life = 0;
      p.shape.setVisible(false);
    }
  }
}
