import type { Metadata } from "next";
import GameLoader from "@/components/GameLoader";

export const metadata: Metadata = {
  title: "Play Free Online",
  description:
    "Play LAST 60 now: dodge neon hazards for 60 seconds, survive six escalating phases and beat your best score. Works on desktop and mobile.",
  alternates: { canonical: "/game" },
};

export default function GamePage() {
  return <GameLoader />;
}
