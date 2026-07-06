// Per-request, user-scoped Supabase client for Route Handlers.
// The browser sends its Supabase access token; we attach it so RLS applies as
// that user. No service-role key is used — writes stay within the user's own
// rows, and money-moving state changes are gated on a server-verified Espees
// confirmation (see app/api/redeem/confirm).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseForToken(accessToken: string): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

/** Extract a Bearer token from an incoming request's Authorization header. */
export function bearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}
