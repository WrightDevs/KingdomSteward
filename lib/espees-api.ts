// Server-only Espees Merchant Web API client.
// Never import this from a client component — it uses the secret ESPEES_API_KEY.
// Docs: "espees documentation.md" (repo root). Flow: create product -> pay -> confirm.

const API_BASE = "https://api.espees.org/v2";
const PAY_BASE = "https://payment.espees.org/pay";

function apiKey(): string {
  const key = process.env.ESPEES_API_KEY;
  if (!key) throw new Error("ESPEES_API_KEY is not configured");
  return key;
}

export interface CreateProductInput {
  sku: string;
  narration: string;
  priceEsp: number;
  successUrl: string;
  failUrl: string;
  userData?: Record<string, unknown>;
  merchantWallet?: string; // per-church wallet; falls back to the env wallet
}

export interface CreateProductResult {
  paymentRef: string;
  payUrl: string;
}

/** Step 1: create the product/charge in Espees and get a payment_ref + hosted pay URL. */
export async function createEspeesProduct(input: CreateProductInput): Promise<CreateProductResult> {
  const wallet = input.merchantWallet || process.env.ESPEES_MERCHANT_WALLET;
  if (!wallet) throw new Error("No Espees merchant wallet configured for this church");
  const res = await fetch(`${API_BASE}/payment/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey() },
    body: JSON.stringify({
      product_sku: input.sku,
      narration: input.narration,
      price: input.priceEsp,
      merchant_wallet: wallet,
      success_url: input.successUrl,
      fail_url: input.failUrl,
      user_data: input.userData ?? {},
    }),
  });

  let data: any = null;
  try { data = await res.json(); } catch { /* non-JSON error body */ }

  if (!res.ok || !data?.payment_ref) {
    throw new Error(data?.message || `Espees product creation failed (HTTP ${res.status})`);
  }
  return { paymentRef: data.payment_ref as string, payUrl: `${PAY_BASE}/${data.payment_ref}` };
}

export type EspeesTxStatus = "APPROVED" | "DECLINE" | "PENDING" | "NOT FOUND" | "UNKNOWN";

export interface ConfirmResult {
  status: EspeesTxStatus;
  raw: any;
}

/** Step 3: server-side confirm a payment by its ref. Only APPROVED means paid. */
export async function confirmEspeesPayment(paymentRef: string): Promise<ConfirmResult> {
  const res = await fetch(`${API_BASE}/payment/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey() },
    body: JSON.stringify({ payment_ref: paymentRef }),
  });

  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }

  const raw = data?.transaction_status;
  const status: EspeesTxStatus =
    raw === "APPROVED" || raw === "DECLINE" || raw === "PENDING" || raw === "NOT FOUND"
      ? raw
      : "UNKNOWN";
  return { status, raw: data };
}
