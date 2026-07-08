import type { NextRequest } from "next/server";
import { exchangeCodeForTokens, getKingsChatProfile, isKingsChatConfigured } from "@/lib/kingschat";

// Registered `redirect_url` for the KingsChat app. KingsChat POSTs { code, origin }
// here after the user approves. We exchange the code for tokens and fetch the
// profile server-side.
//
// TODO (KC <-> Supabase bridge, needs service-role key + the bridge decision):
//   1. Verify `origin` against the kc_state cookie for CSRF (when the POST is
//      browser-initiated) or a server-stored state.
//   2. Upsert a Supabase user keyed by the KingsChat identity (profile.id / email).
//   3. Persist tokens server-side (e.g. a `kingschat_accounts` table) for later
//      profile reads and message sending.
//   4. Mint a Supabase session so RLS and existing tables keep working, then
//      redirect the user's browser to /dashboard.
export async function POST(req: NextRequest) {
  if (!isKingsChatConfigured()) {
    return Response.json({ error: "KingsChat is not configured" }, { status: 503 });
  }

  let body: { code?: string; origin?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }

  const code = String(body.code || "");
  if (!code) return Response.json({ error: "Missing authorization code" }, { status: 400 });

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await getKingsChatProfile(tokens.accessToken);

    // Bridge to Supabase here (see TODO above). For now we only confirm the
    // exchange + profile fetch succeed, so the structure is verifiable.
    return Response.json({
      ok: true,
      profile: { id: profile.id, username: profile.username, name: profile.name },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "KingsChat login failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
