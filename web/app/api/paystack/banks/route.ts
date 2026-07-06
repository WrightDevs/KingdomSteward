import { listBanks, isPaystackConfigured } from "@/lib/paystack-api";

// Returns the Nigerian bank list for the church bank-account dropdown.
// Non-sensitive; used by the leadership onboarding form.
export async function GET() {
  if (!isPaystackConfigured()) {
    return Response.json({ banks: [], error: "Paystack is not configured" }, { status: 200 });
  }
  try {
    const banks = await listBanks();
    return Response.json({ banks });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not load banks";
    return Response.json({ banks: [], error: msg }, { status: 200 });
  }
}
