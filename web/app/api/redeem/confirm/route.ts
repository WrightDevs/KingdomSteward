import type { NextRequest } from "next/server";
import { supabaseForToken, bearer } from "@/lib/supabase-server";
import { confirmEspeesPayment } from "@/lib/espees-api";
import { verifyPaystack } from "@/lib/paystack-api";

// Confirms a redemption after the user returns from the pay portal. The pledge
// is only settled if the provider reports success — verified server-side, so the
// client cannot forge it. Lookup by our redemption id (Espees) or by the payment
// reference Paystack appends to the callback URL.
export async function POST(req: NextRequest) {
  const token = bearer(req);
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseForToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { redemptionId?: string; paymentRef?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }

  const redemptionId = String(body.redemptionId || "");
  const paymentRef = String(body.paymentRef || "");
  if (!redemptionId && !paymentRef) return Response.json({ error: "Missing redemption" }, { status: 400 });

  const base = supabase.from("redemptions").select("*");
  const { data: redemption, error: rErr } = redemptionId
    ? await base.eq("id", redemptionId).single()
    : await base.eq("payment_ref", paymentRef).single();
  if (rErr || !redemption) return Response.json({ error: "Redemption not found" }, { status: 404 });

  if (redemption.status === "confirmed") return Response.json({ status: "confirmed", already: true });
  if (!redemption.payment_ref) return Response.json({ error: "Redemption has no payment reference" }, { status: 400 });

  // Verify against the provider that was used. Any provider/network error is
  // surfaced with its real message instead of a bare 500.
  let approved = false;
  let providerStatus = "UNKNOWN";
  try {
    if (redemption.method === "paystack") {
      const v = await verifyPaystack(redemption.payment_ref);
      // Amount must match what we expected — never trust the redirect alone.
      approved = v.success && Math.abs(v.amountNgn - Number(redemption.amount_ngn)) < 1;
      providerStatus = v.status;
    } else {
      const v = await confirmEspeesPayment(redemption.payment_ref);
      approved = v.status === "APPROVED";
      providerStatus = v.status;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment verification failed";
    console.error("[redeem/confirm] verify error:", msg);
    await supabase.from("redemptions").update({ provider_status: msg.slice(0, 200) }).eq("id", redemption.id);
    return Response.json({ status: "error", error: msg }, { status: 502 });
  }

  if (!approved) {
    const pending = providerStatus === "PENDING";
    await supabase.from("redemptions")
      .update({ status: pending ? "awaiting_payment" : "failed", provider_status: providerStatus })
      .eq("id", redemption.id);
    return Response.json({ status: pending ? "pending" : "failed", provider: providerStatus });
  }

  // Settle against the pledge.
  const { data: pledge, error: pErr } = await supabase
    .from("pledges").select("*").eq("id", redemption.pledge_id).single();
  if (pErr || !pledge) return Response.json({ error: "Pledge not found" }, { status: 404 });

  const newRedeemed = (Number(pledge.redeemed_amount) || 0) + Number(redemption.amount_ngn);
  const isFull = newRedeemed >= Number(pledge.amount) - 0.001;

  const { error: updErr } = await supabase.from("pledges").update({
    redeemed_amount: newRedeemed,
    status: isFull ? "redeemed" : "partially_redeemed",
    updated_at: new Date().toISOString(),
  }).eq("id", pledge.id);
  if (updErr) {
    console.error("[redeem/confirm] pledge update error:", updErr.message);
    return Response.json({ error: `Could not update pledge: ${updErr.message}` }, { status: 500 });
  }

  await supabase.from("giving_entries").insert({
    user_id: user.id,
    amount: Number(redemption.amount_ngn),
    type: "pledge_redemption",
    date: new Date().toISOString().split("T")[0],
    notes: `Redemption for pledge PLEDGE-${pledge.id}`,
  });

  await supabase.from("redemptions").update({
    status: "confirmed", provider_status: providerStatus, confirmed_at: new Date().toISOString(),
  }).eq("id", redemption.id);

  return Response.json({ status: "confirmed", isFull });
}
