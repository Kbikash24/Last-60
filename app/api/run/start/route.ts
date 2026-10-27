import { issueRunToken } from "@/lib/server/runToken";
import { supabaseConfigured } from "@/lib/server/supabase";

export async function POST() {
  if (!supabaseConfigured()) {
    return Response.json(
      { error: "Leaderboard is not configured." },
      { status: 503 },
    );
  }
  return Response.json(
    { token: issueRunToken() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
