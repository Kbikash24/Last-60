"use client";

import Link from "next/link";
import { useState } from "react";
import type { RunResult } from "@/game/types";
import { audio } from "@/lib/audio";
import { loadNickname, saveNickname, submitScore } from "@/lib/leaderboard";
import { NICKNAME_MAX, validateNickname } from "@/lib/nickname";
import { TrophyIcon } from "./icons";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error"; message: string };

export default function SubmitScore({
  run,
  token,
}: {
  run: RunResult;
  token: string;
}) {
  const [nickname, setNickname] = useState(() => loadNickname());
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === "sending" || state.kind === "done") return;
    const checked = validateNickname(nickname);
    if (!checked.ok) {
      setState({ kind: "error", message: checked.error });
      return;
    }
    audio.play("click");
    setState({ kind: "sending" });
    const result = await submitScore({ token, nickname: checked.value, run });
    if (result.ok) {
      saveNickname(checked.value);
      setState({ kind: "done" });
    } else {
      setState({ kind: "error", message: result.error });
    }
  }

  if (state.kind === "done") {
    return (
      <p
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300"
        role="status"
      >
        <TrophyIcon className="text-lg" /> Score submitted!
        <Link href="/leaderboard" className="underline underline-offset-2">
          View leaderboard
        </Link>
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-1.5"
      noValidate
    >
      <div className="flex w-full gap-2">
        <label htmlFor="nickname" className="sr-only">
          Nickname for the leaderboard
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={NICKNAME_MAX}
          placeholder="Nickname"
          autoComplete="nickname"
          // Keep typing from triggering game hotkeys (R retry, P pause).
          onKeyDown={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 rounded-xl border border-neon-purple/60 bg-black/40 px-3 py-2 text-base font-semibold outline-none placeholder:text-foreground/40 focus:border-neon-cyan"
        />
        <button
          type="submit"
          className="btn-dark whitespace-nowrap"
          disabled={state.kind === "sending"}
        >
          <TrophyIcon className="text-lg" />
          {state.kind === "sending" ? "Sending…" : "Submit score"}
        </button>
      </div>
      {state.kind === "error" && (
        <p role="alert" className="text-left text-xs text-amber-300">
          {state.message}
        </p>
      )}
    </form>
  );
}
