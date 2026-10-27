import * as Phaser from "phaser";
import { audio } from "@/lib/audio";
import {
  COLORS,
  COUNTDOWN_SECONDS,
  NEAR_MISS_DISTANCE,
  PLAYER_HITBOX,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  RUN_DURATION,
} from "../config";
import type { GameController, SceneControls } from "../controller";
import { ParticleBurst } from "../entities/ParticleBurst";
import { Player } from "../entities/Player";
import { getPhase, phaseName } from "../systems/DifficultyManager";
import { ObstacleSpawner } from "../systems/ObstacleSpawner";
import { ScoreManager } from "../systems/ScoreManager";
import type { RunOutcome, RunStatus } from "../types";

const SNAPSHOT_INTERVAL = 0.1;
const MAX_FRAME_SECONDS = 0.05;
/** How tightly the player tracks the finger; higher feels more glued to it. */
const DRAG_FOLLOW = 40;
/** Speed cap while dragging, a little above keyboard speed so it keeps up with a finger. */
const DRAG_MAX_SPEED = 650;

export class SurvivalScene extends Phaser.Scene implements SceneControls {
  private status: RunStatus = "countdown";
  private statusBeforePause: RunStatus = "countdown";
  private countdownLeft = COUNTDOWN_SECONDS;
  private lastCountdownTick = 0;
  private elapsed = 0;
  private phaseIndex = 0;
  private nearMisses = 0;
  private snapshotTimer = 0;
  private reducedMotion = false;
  private cleanedUp = false;

  private width = 0;
  private height = 0;
  private player!: Player;
  private spawner!: ObstacleSpawner;
  private particles!: ParticleBurst;
  private border!: Phaser.GameObjects.Rectangle;
  private popups: Phaser.GameObjects.Text[] = [];
  private readonly score = new ScoreManager();

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<
    "up" | "down" | "left" | "right",
    Phaser.Input.Keyboard.Key
  >;
  // The player keeps its offset from the finger, so it moves exactly as the finger does.
  private drag: {
    pointer: Phaser.Input.Pointer | null;
    fingerX: number;
    fingerY: number;
    playerX: number;
    playerY: number;
  } = { pointer: null, fingerX: 0, fingerY: 0, playerX: 0, playerY: 0 };

  constructor(private readonly controller: GameController) {
    super("Survival");
  }

  create(): void {
    this.width = this.scale.width;
    this.height = this.scale.height;
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    this.drawArena();
    this.spawner = new ObstacleSpawner(
      this,
      this.width,
      this.height,
      this.reducedMotion,
    );
    this.player = new Player(this);
    this.particles = new ParticleBurst(this);

    const keyboard = this.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.wasd;
    keyboard.on("keydown-P", this.togglePause, this);
    keyboard.on("keydown-ESC", this.togglePause, this);
    keyboard.on("keydown-R", this.onRetryKey, this);

    this.input.on("pointerdown", this.onPointerDown, this);
    this.input.on("pointerup", this.onPointerUp, this);
    this.input.on("pointerupoutside", this.onPointerUp, this);
    document.addEventListener("visibilitychange", this.onVisibilityChange);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);

    this.controller.attach(this);
    this.resetRun();
  }

  // ----- Public controls (called from React through the controller) -----

  retry(): void {
    this.resetRun();
  }

  pause(): void {
    if (this.status !== "playing" && this.status !== "countdown") return;
    this.statusBeforePause = this.status;
    this.status = "paused";
    this.releaseDrag();
    this.emitSnapshot();
  }

  resume(): void {
    if (this.status !== "paused") return;
    this.status = this.statusBeforePause;
    this.emitSnapshot();
  }

  // ----- Run lifecycle -----

  private resetRun(): void {
    this.status = "countdown";
    this.countdownLeft = COUNTDOWN_SECONDS;
    this.lastCountdownTick = COUNTDOWN_SECONDS + 1;
    this.elapsed = 0;
    this.phaseIndex = 0;
    this.nearMisses = 0;
    this.snapshotTimer = 0;
    this.score.reset();
    this.spawner.reset();
    this.particles.clear();
    this.tweens.killAll();
    for (const p of this.popups) p.destroy();
    this.popups.length = 0;
    this.releaseDrag();
    this.cameras.main.resetFX();
    this.border.setStrokeStyle(3, getPhase(0).color, 1);
    this.player.setPosition(this.width / 2, this.height / 2);
    this.player.setVisible(true);
    this.emitSnapshot();
  }

  private endRun(outcome: RunOutcome): void {
    if (this.status === "gameover" || this.status === "victory") return;
    this.status = outcome;
    this.releaseDrag();

    if (outcome === "gameover") {
      this.player.setVisible(false);
      this.particles.burst(
        this.player.x,
        this.player.y,
        [COLORS.cyan, COLORS.white, COLORS.hazard],
        36,
        320,
      );
      if (!this.reducedMotion) this.cameras.main.shake(250, 0.01);
      audio.play("hit");
    } else {
      this.elapsed = RUN_DURATION;
      this.score.completePhase(this.phaseIndex);
      this.score.win();
      this.spawner.clearObstacles();
      if (!this.reducedMotion) {
        this.particles.burst(
          this.player.x,
          this.player.y,
          [COLORS.cyan, COLORS.purple, COLORS.gold, COLORS.white],
          48,
          360,
        );
      }
      audio.play("win");
    }

    this.emitSnapshot();
    this.controller.finish({
      outcome,
      survivalTime: Math.round(this.elapsed * 10) / 10,
      score: this.score.total(this.elapsed),
      phaseIndex: this.phaseIndex,
      phaseName: phaseName(this.phaseIndex),
      bestStreak: this.score.bestStreak,
      nearMisses: this.nearMisses,
    });
  }

  // ----- Frame update -----

  update(time: number, delta: number): void {
    const dt = Math.min(delta / 1000, MAX_FRAME_SECONDS);

    if (!this.reducedMotion && this.status !== "gameover")
      this.player.pulse(time);
    this.particles.update(dt);

    if (this.status === "countdown") {
      this.movePlayer(dt);
      this.countdownLeft -= dt;
      const shown = Math.max(1, Math.ceil(this.countdownLeft));
      if (this.countdownLeft <= 0) {
        this.status = "playing";
        audio.play("go");
        this.emitSnapshot();
      } else if (shown !== this.lastCountdownTick) {
        this.lastCountdownTick = shown;
        audio.play("tick");
        this.emitSnapshot();
      }
      return;
    }

    if (this.status !== "playing") return;

    this.elapsed += dt;
    this.movePlayer(dt);

    const phase = getPhase(this.elapsed);
    if (phase.index !== this.phaseIndex) {
      this.score.completePhase(this.phaseIndex);
      this.phaseIndex = phase.index;
      this.border.setStrokeStyle(3, phase.color, 1);
      audio.play("phase");
      this.emitSnapshot();
    }

    this.spawner.update(dt, this.elapsed, phase, this.player.x, this.player.y);

    if (this.checkCollisions()) {
      this.endRun("gameover");
      return;
    }
    this.checkNearMisses();
    this.score.tick(this.elapsed);

    if (this.elapsed >= RUN_DURATION) {
      this.endRun("victory");
      return;
    }

    this.snapshotTimer += dt;
    if (this.snapshotTimer >= SNAPSHOT_INTERVAL) {
      this.snapshotTimer = 0;
      this.emitSnapshot();
    }
  }

  private movePlayer(dt: number): void {
    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown) x -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) x += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) y -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) y += 1;
    if (x !== 0 || y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    } else if (this.drag.pointer) {
      this.followFinger(dt);
      return;
    }

    const nx = Phaser.Math.Clamp(
      this.player.x + x * PLAYER_SPEED * dt,
      PLAYER_RADIUS,
      this.width - PLAYER_RADIUS,
    );
    const ny = Phaser.Math.Clamp(
      this.player.y + y * PLAYER_SPEED * dt,
      PLAYER_RADIUS,
      this.height - PLAYER_RADIUS,
    );
    this.player.setPosition(nx, ny);
  }

  private checkCollisions(): boolean {
    for (const o of this.spawner.obstacles) {
      if (
        o.lethal &&
        o.distanceTo(this.player.x, this.player.y) < PLAYER_HITBOX
      )
        return true;
    }
    return false;
  }

  private checkNearMisses(): void {
    const limit = PLAYER_HITBOX + NEAR_MISS_DISTANCE;
    const list = this.spawner.obstacles;
    for (const o of list) {
      if (
        o.scored ||
        !o.lethal ||
        o.distanceTo(this.player.x, this.player.y) >= limit
      )
        continue;
      // Mark the whole group (e.g. both halves of a wall) so one event pays out once.
      for (const other of list)
        if (other.groupId === o.groupId) other.scored = true;
      const points = this.score.registerNearMiss(this.elapsed);
      if (points > 0) {
        this.nearMisses++;
        audio.play("nearMiss");
        this.showPopup(`+${points}`);
      }
    }
  }

  private showPopup(text: string): void {
    const t = this.add
      .text(this.player.x, this.player.y - 26, text, {
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffd24a",
      })
      .setOrigin(0.5)
      .setDepth(15);
    this.popups.push(t);
    const done = () => {
      const i = this.popups.indexOf(t);
      if (i >= 0) this.popups.splice(i, 1);
      t.destroy();
    };
    if (this.reducedMotion) {
      this.time.delayedCall(500, done);
    } else {
      this.tweens.add({
        targets: t,
        y: t.y - 28,
        alpha: 0,
        duration: 600,
        onComplete: done,
      });
    }
  }

  private emitSnapshot(): void {
    this.controller.snapshot({
      status: this.status,
      countdown: Math.max(1, Math.ceil(this.countdownLeft)),
      elapsed: Math.min(RUN_DURATION, this.elapsed),
      score: this.score.total(this.elapsed),
      phaseIndex: this.phaseIndex,
      phaseName: phaseName(this.phaseIndex),
      streak: this.score.streak,
    });
  }

  // ----- Arena drawing -----

  private drawArena(): void {
    const g = this.add.graphics().setDepth(0);
    g.lineStyle(1, COLORS.grid, 0.8);
    for (let x = 0; x <= this.width; x += 40)
      g.lineBetween(x, 0, x, this.height);
    for (let y = 0; y <= this.height; y += 40)
      g.lineBetween(0, y, this.width, y);
    this.border = this.add
      .rectangle(
        this.width / 2,
        this.height / 2,
        this.width - 3,
        this.height - 3,
      )
      .setStrokeStyle(3, COLORS.cyan, 1)
      .setDepth(30);
  }

  // ----- Input -----

  private togglePause(): void {
    if (this.status === "paused") this.resume();
    else this.pause();
  }

  private onRetryKey(): void {
    if (this.status === "gameover" || this.status === "victory")
      this.resetRun();
  }

  private onVisibilityChange = (): void => {
    if (document.hidden) this.pause();
  };

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.status !== "playing" && this.status !== "countdown") return;
    if (this.drag.pointer) return;
    this.drag.pointer = pointer;
    this.drag.fingerX = pointer.x;
    this.drag.fingerY = pointer.y;
    this.drag.playerX = this.player.x;
    this.drag.playerY = this.player.y;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.drag.pointer === pointer) this.releaseDrag();
  }

  /** Moves the player by the same distance the finger has moved since touch-down. */
  private followFinger(dt: number): void {
    const d = this.drag;
    const pointer = d.pointer;
    if (!pointer || !pointer.isDown) {
      this.releaseDrag();
      return;
    }
    const minX = PLAYER_RADIUS;
    const maxX = this.width - PLAYER_RADIUS;
    const minY = PLAYER_RADIUS;
    const maxY = this.height - PLAYER_RADIUS;
    const rawX = d.playerX + (pointer.x - d.fingerX);
    const rawY = d.playerY + (pointer.y - d.fingerY);
    const targetX = Phaser.Math.Clamp(rawX, minX, maxX);
    const targetY = Phaser.Math.Clamp(rawY, minY, maxY);
    // Re-anchor at the walls so reversing the finger responds immediately.
    d.playerX += targetX - rawX;
    d.playerY += targetY - rawY;

    const k = 1 - Math.exp(-dt * DRAG_FOLLOW);
    let stepX = (targetX - this.player.x) * k;
    let stepY = (targetY - this.player.y) * k;
    const maxStep = DRAG_MAX_SPEED * dt;
    const len = Math.hypot(stepX, stepY);
    if (len > maxStep) {
      stepX *= maxStep / len;
      stepY *= maxStep / len;
    }
    this.player.setPosition(this.player.x + stepX, this.player.y + stepY);
  }

  private releaseDrag(): void {
    this.drag.pointer = null;
  }

  private cleanup(): void {
    if (this.cleanedUp) return;
    this.cleanedUp = true;
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }
}
