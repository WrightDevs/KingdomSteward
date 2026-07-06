import type { NextRequest } from "next/server";
import { supabaseForToken, bearer } from "@/lib/supabase-server";
import { createEspeesProduct } from "@/lib/espees-api";
import { initializePaystack } from "@/lib/paystack-api";

// Starts a pledge redemption via Espees or Paystack. Returns the hosted pay URL.
// The pledge is not touched here — it only settles once the payment is confirmed
// server-side on return (see ../confirm).
export async function POST(req: NextRequest) {
  const token = bearer(req);
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseForToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { pledgeId?: string; amountNgn?: number; method?: string; origin?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }

  const pledgeId = String(body.pledgeId || "");
  const amountNgn = Number(body.amountNgn);
  const method = body.method === "paystack" ? "paystack" : "espees";
  const origin = String(body.origin || new URL(req.url).origin);
  if (!pledgeId || !Number.isFinite(amountNgn) || amountNgn <= 0) {
    return Response.json({ error: "Invalid amount or pledge" }, { status: 400 });
  }

  const { data: pledge, error: pErr } = await supabase
    .from("pledges").select("*").eq("id", pledgeId).single();
  if (pErr || !pledge) return Response.json({ error: "Pledge not found" }, { status: 404 });
  if (pledge.status === "redeemed") return Response.json({ error: "Pledge already redeemed" }, { status: 400 });

  const remaining = Number(pledge.amount) - (Number(pledge.redeemed_amount) || 0);
  if (amountNgn > remaining + 0.001) {
    return Response.json({ error: "Amount exceeds the outstanding pledge" }, { status: 400 });
  }

  const rate = Number(process.env.NEXT_PUBLIC_ESPEES_RATE) || 2050;
  const priceEsp = Number((amountNgn / rate).toFixed(4));

  // Route settlement to the redeemer's own approved church (its Espees wallet /
  // Paystack subaccount). Falls back to the platform default if none.
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const uZone = typeof meta?.zone === "string" ? meta.zone : "";
  const uChurch = typeof meta?.church === "string" ? meta.church : "";
  let churchWallet: string | undefined;
  let churchSubaccount: string | undefined;
  if (uZone && uChurch) {
    const { data: ch } = await supabase
      .from("churches").select("espees_wallet, paystack_subaccount, status")
      .eq("zone", uZone).eq("name", uChurch).maybeSingle();
    if (ch && ch.status === "approved") {
      churchWallet = ch.espees_wallet || undefined;
      churchSubaccount = ch.paystack_subaccount || undefined;
    }
  }

  // Record the redemption first so callbacks can reference it.
  const { data: redemption, error: rErr } = await supabase
    .from("redemptions")
    .insert({
      user_id: user.id, pledge_id: pledgeId,
      amount_ngn: amountNgn, amount_esp: priceEsp,
      method, status: "initiated",
    })
    .select("id").single();
  if (rErr || !redemption) {
    // Surface the real cause (e.g. missing `redemptions` table) instead of a generic message.
    return Response.json(
      { error: rErr?.message ? `Could not start redemption: ${rErr.message}` : "Could not start redemption" },
      { status: 500 },
    );
  }

  try {
    let payUrl: string;
    let paymentRef: string;

    if (method === "paystack") {
      const r = await initializePaystack({
        email: user.email || `steward-${user.id}@kingdomsteward.app`,
        amountNgn,
        reference: `KS-${redemption.id}`,
        callbackUrl: `${origin}/pledges`, // Paystack appends ?reference=..&trxref=..
        metadata: { pledge_id: pledgeId, redemption_id: redemption.id, user_id: user.id },
        subaccount: churchSubaccount,
      });
      payUrl = r.authorizationUrl;
      paymentRef = r.reference;
    } else {
      const r = await createEspeesProduct({
        sku: `KS-${redemption.id}`,
        narration: `Pledge redemption · NGN ${amountNgn.toLocaleString()}`,
        priceEsp,
        successUrl: `${origin}/pledges?redeem=${redemption.id}`,
        failUrl: `${origin}/pledges?redeem=${redemption.id}&failed=1`,
        userData: { pledge_id: pledgeId, redemption_id: redemption.id, user_id: user.id },
        merchantWallet: churchWallet,
      });
      payUrl = r.payUrl;
      paymentRef = r.paymentRef;
    }

    await supabase.from("redemptions")
      .update({ payment_ref: paymentRef, status: "awaiting_payment" })
      .eq("id", redemption.id);
    return Response.json({ payUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment could not be started";
    await supabase.from("redemptions")
      .update({ status: "failed", provider_status: msg.slice(0, 200) })
      .eq("id", redemption.id);
    return Response.json({ error: msg }, { status: 502 });
  }
}
