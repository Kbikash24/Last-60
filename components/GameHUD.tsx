import type { GameSnapshot } from "@/game/types";
import { RUN_DURATION } from "@/game/config";

interface Props {
  snapshot: GameSnapshot;
  muted: boolean;
  canPause: boolean;
  paused: boolean;
  onTogglePause(): void;
  onToggleMute(): void;
}

export default function GameHUD({
  snapshot,
  muted,
  canPause,
  paused,
  onTogglePause,
  onToggleMute,
}: Props) {
  const progress = Math.min(100, (snapshot.elapsed / RUN_DURATION) * 100);

  return (
    <header className="neon-panel flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-widest text-foreground/60">
            Time
          </p>
          <p className="font-mono text-3xl font-black leading-none text-neon-cyan">
            {snapshot.elapsed.toFixed(1)}
            <span className="text-base font-semibold text-foreground/60">
              {" "}
              / {RUN_DURATION}
            </span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[0.65rem] uppercase tracking-widest text-foreground/60">
            Phase {snapshot.phaseIndex + 1}/6
          </p>
          <p className="text-sm font-bold uppercase tracking-wide text-neon-purple sm:text-lg">
            {snapshot.phaseName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] uppercase tracking-widest text-foreground/60">
            Score
          </p>
          <p className="font-mono text-3xl font-black leading-none">
            {snapshot.score.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost px-3"
            onClick={onTogglePause}
            disabled={!canPause}
            aria-label={paused ? "Resume game" : "Pause game"}
          >
            {paused ? "▶" : "❚❚"}
          </button>
          <button
            type="button"
            className="btn-ghost px-3"
            onClick={onToggleMute}
            aria-pressed={muted}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
          >
            {muted ? "Sound off" : "Sound on"}
          </button>
        </div>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Run progress"
        aria-valuemin={0}
        aria-valuemax={RUN_DURATION}
        aria-valuenow={Math.floor(snapshot.elapsed)}
      >
        <div
          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
