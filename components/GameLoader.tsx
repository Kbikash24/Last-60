"use client";

import dynamic from "next/dynamic";

// The canvas depends on window, so it is never rendered on the server.
const GameCanvas = dynamic(() => import("./GameCanvas"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="font-mono text-neon-cyan">Loading…</p>
    </main>
  ),
});

export default function GameLoader() {
  return <GameCanvas />;
}
