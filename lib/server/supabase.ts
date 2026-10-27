import "server-only";

function config(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function supabaseConfigured(): boolean {
  return config() !== null && Boolean(process.env.RUN_TOKEN_SECRET);
}

/** Calls Supabase's REST API with the service-role key; never import this from client code. */
export async function sbFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const c = config();
  if (!c) throw new Error("Supabase is not configured");
  return fetch(`${c.url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}
