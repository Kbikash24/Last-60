import type { GameSnapshot, RunResult } from "./types";

export interface SceneControls {
  retry(): void;
  pause(): void;
  resume(): void;
}

export interface GameHandlers {
  onSnapshot(snapshot: GameSnapshot): void;
  onFinish(result: RunResult): void;
}

/** Bridge between the Phaser scene and React; contains no Phaser imports. */
export class GameController {
  private scene: SceneControls | null = null;
  private handlers: GameHandlers | null;
  private destroyGame: (() => void) | null = null;

  constructor(handlers: GameHandlers) {
    this.handlers = handlers;
  }

  attach(scene: SceneControls): void {
    this.scene = scene;
  }

  bindDestroy(destroyGame: () => void): void {
    this.destroyGame = destroyGame;
  }

  snapshot(snapshot: GameSnapshot): void {
    this.handlers?.onSnapshot(snapshot);
  }

  finish(result: RunResult): void {
    this.handlers?.onFinish(result);
  }

  retry(): void {
    this.scene?.retry();
  }

  pause(): void {
    this.scene?.pause();
  }

  resume(): void {
    this.scene?.resume();
  }

  destroy(): void {
    this.handlers = null;
    this.scene = null;
    this.destroyGame?.();
    this.destroyGame = null;
  }
}
