# Plan: Finish React/Next migration + KingsChat + Espees

## Assumptions (user was away; confirm or correct)
- **Auth:** Add "Login with KingsChat" *alongside* existing Supabase email/password. No auth rewrite. KC tokens stored client-side for messaging + espees.
- **Espees redemption:** Redeem a pledge by paying espees (core), plus show wallet balance. Standalone espees giving = later.
- **Credentials:** Assume NOT yet registered → registering the KingsChat app (developer.kingsch.at) and Espees app (developers.espees.org) is a **prerequisite blocker** you must do; I cannot get these.
- **PWA/TWA:** Web-first. Get Next solid, delete old HTML/CSS, then re-port service worker / offline queue / fix Android TWA routes in a follow-up pass.

If any assumption is wrong, tell me and I revise before coding.

## Current state (recon done)
- `web/` already holds ~80% of the migration: Next 16.2.9, React 19, TS, Tailwind 4, Supabase-js, chart.js, lucide-react.
- 9 pages ported with real logic: splash, login, signup, dashboard, give, history, pledges, profile, leader-dashboard. `AppShell` bottom nav. `lib/` = supabase, espees, zones.
- `web/.env.local` has Supabase URL/key + espees rate. Good.
- Pledges page already has a redeem modal (records `redeemed_amount`) — natural hook for espees redemption.
- Gaps: offline queue not ported; `web/public/sw.js` + `manifest.json` still reference old `.html` paths (broken for Next routes); no KingsChat; no espees.

## Phase 0 — Verify baseline
1. `cd web && npm install && npm run build` — confirm current migration compiles/builds. Fix any breakage (Next 16 has breaking changes; consult `web/node_modules/next/dist/docs/` per AGENTS.md).
2. `npm run dev`, smoke-test each page against Supabase (login, log giving, pledge, history, profile). Note parity bugs vs old app.

## Phase 1 — Reach feature parity, then delete old files
3. Diff old `js/*.js` behavior vs ported pages; fill any missing logic (streak calc, filters, espees preview, profile image share via html2canvas, leader aggregation).
4. Port PWA minimally: rewrite `manifest.json` start_url/icons for Next; decide sw now-or-later (default later).
5. **Delete old stack** once parity confirmed: root `*.html`, `css/`, `js/`, old root `sw.js`, `test-supabase.js`. Keep: `supabase*.sql`, `assets/`, Android `app/`, gradle, pitch. Move `web/` to repo root or configure deploy root = `web/` (update `vercel.json`).

## Phase 2 — KingsChat login (add alongside)
6. `npm i kingschat-web-sdk`. Add `lib/kingschat.ts` wrapper: `login()`, `refreshAuthenticationToken()`, `sendMessage()`, token persistence (localStorage + expiry) and refresh helper.
7. Add "Login with KingsChat" button on `login` + `signup`. On success store KC tokens. Bridge to Supabase session = "Add alongside" model: create/lookup a Supabase user keyed by KC identity via a Supabase Edge Function minting a custom session (needed so RLS + existing tables keep working). If you'd rather keep KC purely for messaging/espees and require a normal Supabase login too, we skip the bridge — cheaper. **Decision needed.**
8. Env: `NEXT_PUBLIC_KINGSCHAT_CLIENT_ID`, redirect URL.

## Phase 3 — KingsChat message sending
9. `sendMessage({message, userIdentifier, accessToken})` with scope `send_chat_message`.
10. Wire to real events: pledge-reminder / giving confirmation / leader broadcast to a zone member. Replaces/augments the Twilio SMS edge function. Confirm which flows should send KC messages.

## Phase 4 — Espees redemption (blocked on Espees API access)
11. **Blocker:** `developers.espees.org` API is behind KingsChat login — endpoints/redemption flow not public. I need, from you: the espees API base URL, auth scheme (likely KC OAuth scope), and send/redeem endpoint + payload. Register the app there first.
12. Once docs available: `lib/espees.ts` gains `getBalance()`, `redeem/sendEspees()`. Upgrade pledge redeem modal to pay via espees wallet; write the espees payment result back to `pledge_payments` + update `redeemed_amount`/status. Add balance display on dashboard.
13. Handle failure/pending/confirmation states; never mark a pledge redeemed until espees transfer confirmed.

## Phase 5 — Harden + re-enable PWA/TWA
14. Re-port offline giving queue (IndexedDB + background sync) to Next, or drop if not needed.
15. Fix service worker for Next asset/route model; update Android TWA `app/` + `shortcuts.xml` + `twa-manifest.json` to clean routes (`/dashboard` not `/dashboard.html`); rebuild APK.

## Open decisions I need from you
- A) KC↔Supabase bridge (Phase 2.7): full bridge vs KC-messaging-only?
- B) Exact meaning + endpoints for espees redemption (Phase 4) — the hard blocker.
- C) Which flows trigger KingsChat messages (Phase 3.10)?

## Risks
- Espees API undocumented publicly → Phase 4 cannot start until you supply access/docs.
- Next 16 breaking changes vs training data → follow `node_modules/next/dist/docs/`.
- Android TWA route breakage when `.html` removed → handled Phase 5, or keep redirects.
