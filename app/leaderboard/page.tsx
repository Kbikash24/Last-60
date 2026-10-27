import type { Metadata } from "next";
import Leaderboard from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See the top LAST 60 players: best scores for all time, this week and today. Survive 60 seconds and add your name.",
  alternates: { canonical: "/leaderboard" },
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
