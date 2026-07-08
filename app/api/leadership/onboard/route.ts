import type { NextRequest } from "next/server";
import { supabaseForToken, bearer } from "@/lib/supabase-server";
import { resolveAccount } from "@/lib/paystack-api";

// Leadership onboarding: connects a leader to their church and creates the
// church sub-account (Espees wallet + bank account + a unique member invite
// code). Church + claim are created 'pending' for super-admin approval.
export async function POST(req: NextRequest) {
  const token = bearer(req);
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseForToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    zone?: string; church?: string; role?: string; subGroup?: string; espeesWallet?: string;
    bankName?: string; bankCode?: string; accountNumber?: string;
  };
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }

  const zone = String(body.zone || "").trim();
  const church = String(body.church || "").trim();
  const role = String(body.role || "").trim();
  const subGroup = String(body.subGroup || "").trim();
  const espeesWallet = String(body.espeesWallet || "").trim();
  const bankName = String(body.bankName || "").trim();
  const bankCode = String(body.bankCode || "").trim();
  const accountNumber = String(body.accountNumber || "").trim();
  if (!zone || !church || !role) {
    return Response.json({ error: "Zone, church and role are required" }, { status: 400 });
  }

  // Find or create the church sub-account for this zone + church.
  const { data: existing, error: findErr } = await supabase
    .from("churches").select("id, invite_code").eq("zone", zone).eq("name", church).maybeSingle();
  if (findErr) return Response.json({ error: `Could not look up church: ${findErr.message}` }, { status: 500 });

  let churchId: string;
  let inviteCode: string | null;

  if (existing) {
    churchId = existing.id;
    inviteCode = existing.invite_code ?? null;
  } else {
    // Best-effort bank account name resolution (may be unavailable in test mode).
    let accountName: string | null = null;
    if (bankCode && accountNumber) {
      try { accountName = await resolveAccount(bankCode, accountNumber); } catch { accountName = null; }
    }
    inviteCode = crypto.randomUUID().replace(/-/g, "").slice(0, 10);

    const { data: created, error: cErr } = await supabase
      .from("churches")
      .insert({
        zone, name: church, status: "pending", created_by: user.id,
        espees_wallet: espeesWallet || null,
        invite_code: inviteCode,
        bank_name: bankName || null,
        bank_code: bankCode || null,
        account_number: accountNumber || null,
        account_name: accountName,
      })
      .select("id, invite_code").single();
    if (cErr || !created) {
      if (cErr && /duplicate|unique/i.test(cErr.message)) {
        return Response.json(
          { error: "This church already exists — ask a super-admin for a leader invite link." },
          { status: 409 },
        );
      }
      return Response.json(
        { error: cErr?.message ? `Could not create church: ${cErr.message}` : "Could not create church" },
        { status: 500 },
      );
    }
    churchId = created.id;
    inviteCode = created.invite_code;
  }

  // Create the pending leadership claim (unique per user+church).
  const { error: lErr } = await supabase.from("church_leaders").insert({
    user_id: user.id, church_id: churchId, zone, role, status: "pending",
  });
  if (lErr && !/duplicate|unique/i.test(lErr.message)) {
    return Response.json({ error: `Could not submit leadership claim: ${lErr.message}` }, { status: 500 });
  }

  await supabase.from("profiles").update({ title: role, zone, church, sub_group: subGroup || null }).eq("id", user.id);

  return Response.json({ status: "pending", churchId, inviteCode });
}
