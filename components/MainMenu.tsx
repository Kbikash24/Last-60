"use client";

import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";
import { useStats } from "@/lib/useStats";
import { Logo3D } from "./Logo3D";
import {
  BarsIcon,
  BoltIcon,
  CrownIcon,
  FlagIcon,
  FlameIcon,
  GamepadIcon,
  GaugeIcon,
  PlayIcon,
  SkullIcon,
  StarIcon,
  TargetIcon,
  TimerIcon,
  TrophyIcon,
  WarningIcon,
  type IconProps,
} from "./icons";

interface PhaseChip {
  name: string;
  color: string;
  Icon: ComponentType<IconProps>;
}

const PHASES: PhaseChip[] = [
  { name: "Warm-up", color: "#22e4ff", Icon: TimerIcon },
  { name: "Speed Up", color: "#2ee6a6", Icon: GaugeIcon },
  { name: "Crossfire", color: "#ffc23d", Icon: TargetIcon },
  { name: "Chaos", color: "#ff7a3d", Icon: BoltIcon },
  { name: "Survival", color: "#ff3d8b", Icon: SkullIcon },
  { name: "Final Rush", color: "#a78bfa", Icon: CrownIcon },
];

function formatTime(seconds: number): string {
  return `${seconds.toFixed(1)}s`;
}

export default function MainMenu() {
  const stats = useStats();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center gap-7 px-4 py-8 text-center sm:gap-8">
      <header className="anim-fade-in flex flex-col items-center gap-3">
        <h1 className="flex items-baseline text-6xl font-black italic leading-none tracking-tight sm:text-8xl md:text-9xl">
          <Logo3D text="LAST" className="logo-last" />
          <Logo3D text="60" className="logo-60" />
        </h1>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-sky-200/90 sm:text-sm sm:tracking-[0.4em]">
          One Minute. One Life. One More Run.
        </p>
      </header>

      <Link href="/game" className="btn-primary text-2xl sm:min-w-80" autoFocus>
        <PlayIcon aria-hidden="true" />
        PLAY
      </Link>

      <ol
        className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2"
        aria-label="Phases"
      >
        {PHASES.map(({ name, color, Icon }, i) => (
          <li key={name} className="flex items-center gap-1">
            {i > 0 && (
              <span
                className="hidden text-sm sm:inline"
                style={{ color: PHASES[i - 1].color }}
                aria-hidden="true"
              >
                ›
              </span>
            )}
            <div
              className="phase-chip"
              style={{ "--c": color } as CSSProperties}
            >
              <Icon className="text-2xl" />
              <div className="text-left leading-tight">
                <p className="text-base font-extrabold sm:text-lg">
                  {i * 10}-{i * 10 + 10}s
                </p>
                <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-foreground/70">
                  {name}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid w-full gap-5 lg:grid-cols-2">
        <section aria-labelledby="how-to" className="neon-panel p-5 text-left">
          <h2
            id="how-to"
            className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-neon-cyan"
          >
            <GamepadIcon className="text-xl" /> How to play
          </h2>
          <ul className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <li className="flex flex-col items-center gap-1 px-3 py-3 text-center">
              <Keycaps />
              <strong>Move</strong>
              <p className="text-xs text-foreground/70">
                Arrow keys or WASD. On touch, drag to steer.
              </p>
            </li>
            <li className="flex flex-col items-center gap-1 px-3 py-3 text-center">
              <WarningIcon className="text-4xl text-fuchsia-400" />
              <strong>Dodge</strong>
              <p className="text-xs text-foreground/70">
                Warnings show where hazards enter. Near misses earn bonus
                points.
              </p>
            </li>
            <li className="flex flex-col items-center gap-1 px-3 py-3 text-center">
              <StarIcon className="text-4xl text-fuchsia-400" />
              <strong>Survive 60s</strong>
              <p className="text-xs text-foreground/70">
                One hit ends the run. Six phases get progressively harder.
              </p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="stats" className="neon-panel p-5 text-left">
          <h2
            id="stats"
            className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-neon-cyan"
          >
            <BarsIcon className="text-xl" /> Your stats
          </h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <Stat
              className="sm:col-span-3"
              icon={<CrownIcon className="text-3xl text-amber-400" />}
              label="Best score"
              value={stats.bestScore.toLocaleString()}
            />
            <Stat
              className="sm:col-span-3"
              icon={<TimerIcon className="text-3xl text-cyan-300" />}
              label="Longest run"
              value={formatTime(stats.longestSurvival)}
            />
            <Stat
              className="sm:col-span-2"
              icon={<FlagIcon className="text-3xl text-emerald-300" />}
              label="Total runs"
              value={String(stats.totalRuns)}
            />
            <Stat
              className="sm:col-span-2"
              icon={<TrophyIcon className="text-3xl text-amber-400" />}
              label="Full 60s runs"
              value={String(stats.completedRuns)}
            />
            <Stat
              className="col-span-2 sm:col-span-2"
              icon={<FlameIcon className="text-3xl text-rose-400" />}
              label="Best streak"
              value={String(stats.bestStreak)}
            />
          </dl>
          <p className="mt-3 text-xs text-foreground/60">
            Stats are saved only in this browser. Clearing your browser data
            will erase them.
          </p>
        </section>
      </div>
    </main>
  );
}

function Keycaps() {
  const cap =
    "flex h-6 w-6 items-center justify-center rounded border border-white/40 text-[0.65rem] font-bold";
  return (
    <div className="flex flex-col items-center gap-0.5" aria-hidden="true">
      <span className={cap}>W</span>
      <div className="flex gap-0.5">
        <span className={cap}>A</span>
        <span className={cap}>S</span>
        <span className={cap}>D</span>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 ${className}`}
    >
      {icon}
      <div>
        <dt className="text-[0.6rem] uppercase tracking-wider text-foreground/60">
          {label}
        </dt>
        <dd className="text-2xl font-extrabold leading-none">{value}</dd>
      </div>
    </div>
  );
}
