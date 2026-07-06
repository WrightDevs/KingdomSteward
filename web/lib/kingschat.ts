// Server-only KingsChat OAuth2 + API client.
// client_id and api-key are secrets — never import this from a client component.
// Docs: "kingschat login/get user profile/send message documentation.md" (repo root).
//
// Values become available only after the app is approved in the KingsChat
// developer portal; until then isKingsChatConfigured() is false and the login
// route degrades gracefully.

const OAUTH_BASE = "https://connect.kingsch.at/developer/api";
const LOGIN_PAGE = "https://accounts.kingschat.online/log-in";

function clientId(): string {
  const v = process.env.KINGSCHAT_CLIENT_ID;
  if (!v) throw new Error("KINGSCHAT_CLIENT_ID is not configured");
  return v;
}

function apiKey(): string {
  const v = process.env.KINGSCHAT_API_KEY;
  if (!v) throw new Error("KINGSCHAT_API_KEY is not configured");
  return v;
}

export function isKingsChatConfigured(): boolean {
  return Boolean(process.env.KINGSCHAT_CLIENT_ID);
}

/** Step 4: URL to send the user to. `state` is echoed back verbatim (use for CSRF + return path). */
export function buildLoginUrl(state?: string, forceLogin = false): string {
  const params = new URLSearchParams({ clientId: clientId() });
  if (state) params.set("origin", state);
  if (forceLogin) params.set("forceLogin", "true");
  return `${LOGIN_PAGE}?${params.toString()}`;
}

export interface KcTokens {
  accessToken: string;
  refreshToken: string;
  expiresInMillis: number;
}

/** Step 6: exchange the authorization code for tokens. */
export async function exchangeCodeForTokens(code: string): Promise<KcTokens> {
  const res = await fetch(`${OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "code", client_id: clientId(), code }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) throw new Error(data?.error || `Token exchange failed (HTTP ${res.status})`);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresInMillis: data.expires_in_millis,
  };
}

/** Step 7: renew an expired access token. */
export async function refreshTokens(refreshToken: string): Promise<KcTokens> {
  const res = await fetch(`${OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) throw new Error(data?.error || `Token refresh failed (HTTP ${res.status})`);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresInMillis: data.expires_in_millis,
  };
}

export interface KcProfile {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone_number: string | null;
  avatar: string | null;
  is_email_verified?: boolean;
}

/** Get the authenticated user's KingsChat profile. */
export async function getKingsChatProfile(accessToken: string): Promise<KcProfile> {
  const res = await fetch(`${OAUTH_BASE}/user/profile`, {
    headers: { "api-key": apiKey(), Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.profile) throw new Error(data?.error || `Profile fetch failed (HTTP ${res.status})`);
  return data.profile as KcProfile;
}

/**
 * Send a KingsChat message. Omit `senderId` to send on behalf of the project
 * (system notifications: pledge reminders, redemption confirmations). Provide
 * `senderId` to send on behalf of one user to another.
 */
export async function sendKingsChatMessage(input: { recipientId: string; text: string; senderId?: string }): Promise<true> {
  const body: Record<string, unknown> = {
    recipient_id: input.recipientId,
    message: { body: { text: { body: input.text } } },
  };
  if (input.senderId) body.sender_id = input.senderId;

  const res = await fetch(`${OAUTH_BASE}/messages`, {
    method: "POST",
    headers: { "api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.status !== "ok") throw new Error(data?.error || `Message send failed (HTTP ${res.status})`);
  return true;
}
