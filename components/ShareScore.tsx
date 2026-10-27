"use client";

import { useState } from "react";
import { audio } from "@/lib/audio";
import { ShareIcon } from "./icons";
import type { RunResult } from "@/game/types";

export function buildShareText(result: RunResult): string {
  const outcome =
    result.outcome === "victory"
      ? "I survived all 60 seconds"
      : `I survived ${result.survivalTime.toFixed(1)}s`;
  return `${outcome} and scored ${result.score.toLocaleString()} in LAST 60. Can you beat it?`;
}

export default function ShareScore({
  result,
  className = "btn-ghost",
}: {
  result: RunResult;
  className?: string;
}) {
  const [feedback, setFeedback] = useState("");

  async function share() {
    audio.play("click");
    const text = buildShareText(result);
    const url = window.location.origin;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "LAST 60", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setFeedback("Copied to clipboard!");
    } catch (error) {
      // Dismissing the share sheet is not an error worth reporting.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback(
        "Couldn't share. Copy the link from your address bar instead.",
      );
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={share}>
        <ShareIcon className="text-xl" />
        Share result
      </button>
      <span role="status" className="sr-only">
        {feedback}
      </span>
      {feedback && (
        <p className="order-last col-span-2 w-full text-center text-xs text-neon-cyan">
          {feedback}
        </p>
      )}
    </>
  );
}
