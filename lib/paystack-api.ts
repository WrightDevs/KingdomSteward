// Server-only Paystack client. Secret key must never reach the browser.
// Flow: initialize (server) -> redirect to authorization_url -> verify (server).
// Paystack is NGN-native; amounts are sent in kobo (NGN * 100).

const BASE = "https://api.paystack.co";

function secret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export interface InitInput {
  email: string;
  amountNgn: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  subaccount?: string; // route settlement to a church's Paystack subaccount
}

export async function initializePaystack(input: InitInput): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNgn * 100), // kobo
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
      ...(input.subaccount ? { subaccount: input.subaccount } : {}),
    }),
  });

  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok || !data?.status || !data?.data?.authorization_url) {
    throw new Error(data?.message || `Paystack init failed (HTTP ${res.status})`);
  }
  return { authorizationUrl: data.data.authorization_url as string, reference: data.data.reference as string };
}

export async function listBanks(): Promise<{ name: string; code: string }[]> {
  const res = await fetch(`${BASE}/bank?currency=NGN&perPage=100`, {
    headers: { Authorization: `Bearer ${secret()}` },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.status || !Array.isArray(data.data)) {
    throw new Error(data?.message || `Paystack bank list failed (HTTP ${res.status})`);
  }
  return data.data.map((b: { name: string; code: string }) => ({ name: b.name, code: b.code }));
}

/** Create a Paystack subaccount so a church's card redemptions settle to its bank. */
export async function createSubaccount(input: { businessName: string; bankCode: string; accountNumber: string }): Promise<string> {
  const res = await fetch(`${BASE}/subaccount`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      business_name: input.businessName,
      settlement_bank: input.bankCode,
      account_number: input.accountNumber,
      percentage_charge: 0, // church receives the full amount (less Paystack fees)
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.status || !data?.data?.subaccount_code) {
    throw new Error(data?.message || `Paystack subaccount failed (HTTP ${res.status})`);
  }
  return data.data.subaccount_code as string;
}

/** Resolve a bank account to its owner name (best-effort — may be unavailable in test mode). */
export async function resolveAccount(bankCode: string, accountNumber: string): Promise<string | null> {
  const res = await fetch(
    `${BASE}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    { headers: { Authorization: `Bearer ${secret()}` } },
  );
  const data = await res.json().catch(() => null);
  return data?.data?.account_name ?? null;
}

export async function verifyPaystack(reference: string): Promise<{ success: boolean; status: string; amountNgn: number }> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
  });

  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }
  const status: string = data?.data?.status || "unknown";
  return {
    success: status === "success",
    status,
    amountNgn: Number(data?.data?.amount ?? 0) / 100,
  };
}
