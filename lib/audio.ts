import { loadMuted, saveMuted } from "./storage";

export type Sfx =
  | "tick"
  | "go"
  | "phase"
  | "nearMiss"
  | "hit"
  | "win"
  | "click";

type WaveType = OscillatorType;

/** Tiny WebAudio synth so the game needs no audio files. */
class AudioManager {
  private ctx: AudioContext | null = null;
  private muted: boolean | null = null;
  private listeners = new Set<() => void>();

  isMuted = (): boolean => {
    if (this.muted === null)
      this.muted = typeof window === "undefined" ? false : loadMuted();
    return this.muted;
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  setMuted(muted: boolean): void {
    this.muted = muted;
    saveMuted(muted);
    this.listeners.forEach((l) => l());
  }

  play(sfx: Sfx): void {
    if (this.isMuted()) return;
    const ctx = this.context();
    if (!ctx || ctx.state !== "running") return;
    switch (sfx) {
      case "tick":
        this.tone(ctx, 660, 0.08, "sine", 0.1);
        break;
      case "go":
        this.tone(ctx, 990, 0.25, "sine", 0.12);
        break;
      case "phase":
        this.tone(ctx, 520, 0.12, "triangle", 0.1);
        this.tone(ctx, 780, 0.18, "triangle", 0.1, 0.1);
        break;
      case "nearMiss":
        this.tone(ctx, 1300, 0.06, "square", 0.03);
        break;
      case "hit":
        this.tone(ctx, 200, 0.45, "sawtooth", 0.12, 0, 40);
        break;
      case "win":
        [523, 659, 784, 1046].forEach((f, i) =>
          this.tone(ctx, f, 0.25, "triangle", 0.1, i * 0.12),
        );
        break;
      case "click":
        this.tone(ctx, 480, 0.05, "sine", 0.06);
        break;
    }
  }

  /** Browsers only allow audio after a gesture; create or resume the context then. */
  private context(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended")
      void this.ctx.resume().catch(() => undefined);
    return this.ctx;
  }

  private tone(
    ctx: AudioContext,
    freq: number,
    dur: number,
    type: WaveType,
    vol: number,
    delay = 0,
    slideTo?: number,
  ): void {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}

export const audio = new AudioManager();
