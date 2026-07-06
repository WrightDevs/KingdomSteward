import type { NextRequest } from "next/server";
import { supabaseForToken, bearer } from "@/lib/supabase-server";
import { createSubaccount } from "@/lib/paystack-api";
import type { SupabaseClient } from "@supabase/supabase-js";

async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
}

// Super-admin approve/reject for church sub-accounts and leadership claims.
// Approving a church with bank details also creates its Paystack subaccount so
// future card redemptions settle to the church's bank.
export async function POST(req: NextRequest) {
  const token = bearer(req);
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseForToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(supabase, user.id))) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body: { type?: string; id?: string; action?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }

  const type = body.type;
  const id = String(body.id || "");
  const action = body.action;
  if ((type !== "church" && type !== "claim") || !id || (action !== "approve" && action !== "reject")) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const status = action === "approve" ? "approved" : "revoked";

  if (type === "claim") {
    const { error } = await supabase.from("church_leaders").update({ status }).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, status });
  }

  // type === "church"
  const { data: church, error: cErr } = await supabase.from("churches").select("*").eq("id", id).single();
  if (cErr || !church) return Response.json({ error: "Church not found" }, { status: 404 });

  let subaccount: string | null = church.paystack_subaccount || null;
  let subaccountNote: string | undefined;
  if (action === "approve" && !subaccount && church.bank_code && church.account_number) {
    try {
      subaccount = await createSubaccount({
        businessName: church.name,
        bankCode: church.bank_code,
        accountNumber: church.account_number,
      });
    } catch (e) {
      subaccountNote = e instanceof Error ? e.message : "subaccount creation failed";
      console.error("[admin/approve] subaccount:", subaccountNote);
    }
  }

  const { error: uErr } = await supabase.from("churches")
    .update({ status, paystack_subaccount: subaccount }).eq("id", id);
  if (uErr) return Response.json({ error: uErr.message }, { status: 500 });

  return Response.json({ ok: true, status, paystackSubaccount: subaccount, subaccountNote });
}
