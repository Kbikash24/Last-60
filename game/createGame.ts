import * as Phaser from "phaser";
import { COLORS } from "./config";
import { GameController, type GameHandlers } from "./controller";
import { SurvivalScene } from "./scenes/SurvivalScene";

export interface CreateGameOptions extends GameHandlers {
  parent: HTMLElement;
  width: number;
  height: number;
}

export function createGame({
  parent,
  width,
  height,
  onSnapshot,
  onFinish,
}: CreateGameOptions): GameController {
  const controller = new GameController({ onSnapshot, onFinish });
  let game: Phaser.Game | null = null;
  const scene = new SurvivalScene(controller);
  controller.bindDestroy(() => {
    game?.destroy(true);
    game = null;
  });

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: COLORS.bg,
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene,
  });
  return controller;
}
