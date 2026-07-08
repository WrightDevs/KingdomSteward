import { NextResponse } from "next/server";
import { buildLoginUrl, isKingsChatConfigured } from "@/lib/kingschat";

// Kicks off the KingsChat OAuth2 flow: sets a CSRF state cookie and redirects
// the user to the KingsChat login page. Degrades gracefully until the app is
// approved and KINGSCHAT_CLIENT_ID is set.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  if (!isKingsChatConfigured()) {
    return NextResponse.redirect(`${origin}/login?kc=unavailable`);
  }

  const state = crypto.randomUUID();
  const res = NextResponse.redirect(buildLoginUrl(state));
  res.cookies.set("kc_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });
  return res;
}
