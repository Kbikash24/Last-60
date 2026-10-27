import type { Metadata } from "next";
import GameLoader from "@/components/GameLoader";

export const metadata: Metadata = {
  title: "Play — LAST 60",
};

export default function GamePage() {
  return <GameLoader />;
}
