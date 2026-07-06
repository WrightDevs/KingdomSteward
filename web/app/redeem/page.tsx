"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Gem, ArrowRight, CheckCircle2, ShieldCheck, Wallet, Loader2, Copy, Inbox, Info,
} from "lucide-react";

const ESPEES_RATE = Number(process.env.NEXT_PUBLIC_ESPEES_RATE) || 2050; // NGN per Esp

// Mock wallet — replaced by the Espees API later.
const MOCK_BALANCE = 604.5;

const fmt = (n: number, dp = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });

export default function RedeemPage() {
  const [balance] = useState(MOCK_BALANCE);
  const [amount, setAmount] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<null | { amount: number; ref: string }>(null);

  const value = parseFloat(amount) || 0;
  const ngn = value * ESPEES_RATE;
  const tooMuch = value > balance;
  const canReview = value > 0 && !tooMuch;

  const quick = (pct: number) => setAmount((balance * pct).toFixed(2));

  const confirm = () => {
    setProcessing(true);
    // Simulated settle — swap for the Espees redemption call later.
    setTimeout(() => {
      setProcessing(false);
      setReviewOpen(false);
      setDone({ amount: value, ref: "RDM-" + Math.random().toString(36).slice(2, 8).toUpperCase() });
      setAmount("");
    }, 1100);
  };

  // ---------- Empty state ----------
  if (balance <= 0 && !done) {
    return (
      <AppShell>
        <PageHead />
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted"><Inbox className="size-7 text-muted-foreground" /></span>
            <h2 className="text-xl font-semibold">No Espees to redeem yet</h2>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              Log your giving to start earning Espees. Once your balance grows, you can redeem it here.
            </p>
            <Button render={<Link href="/give" />} className="mt-6">Log giving<ArrowRight className="size-4" /></Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  // ---------- Success state ----------
  if (done) {
    return (
      <AppShell>
        <PageHead />
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <span className="mb-5 grid size-16 place-items-center rounded-full bg-chart-3/15">
              <CheckCircle2 className="size-9 text-chart-3" />
            </span>
            <h2 className="text-2xl font-semibold">Redemption confirmed</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {fmt(done.amount)} Esp redeemed successfully.
            </p>

            <div className="mt-6 w-full space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <Row label="Amount redeemed" value={`${fmt(done.amount)} Esp`} />
              <Row label="Value" value={`₦${fmt(done.amount * ESPEES_RATE, 0)}`} />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="flex items-center gap-1.5 font-medium tabular">
                  {done.ref}
                  <button onClick={() => navigator.clipboard?.writeText(done.ref)} aria-label="Copy reference" className="text-muted-foreground hover:text-foreground">
                    <Copy className="size-3.5" />
                  </button>
                </span>
              </div>
              <Row label="Status" value={<Badge className="bg-chart-3/15 text-chart-3 border-0">Completed</Badge>} />
            </div>

            <div className="mt-6 flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDone(null)}>Make another</Button>
              <Button render={<Link href="/dashboard" />} className="flex-1">Done</Button>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  // ---------- Form state ----------
  return (
    <AppShell>
      <PageHead />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Balance */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm opacity-90"><Wallet className="size-4" /> Espees balance</span>
                <Badge className="gap-1 border-0 bg-white/15 text-white"><ShieldCheck className="size-3" /> Verified</Badge>
              </div>
              <div className="mt-5 flex items-end gap-2">
                <Gem className="mb-1 size-7" />
                <span className="text-4xl font-semibold tabular">{fmt(balance)}</span>
                <span className="mb-1 text-lg opacity-80">Esp</span>
              </div>
              <p className="mt-1 text-sm opacity-80 tabular">≈ ₦{fmt(balance * ESPEES_RATE, 0)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Redeemed Espees are converted at ₦{fmt(ESPEES_RATE, 0)} per Esp. Redemptions are final once confirmed.
          </div>
        </div>

        {/* Redeem form */}
        <Card className="lg:col-span-3 h-fit">
          <CardContent className="pt-2">
            <h3 className="mb-4 font-medium">Redeem Espees</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount to redeem</Label>
                <button onClick={() => quick(1)} className="text-xs font-medium text-primary hover:underline">
                  Max {fmt(balance)} Esp
                </button>
              </div>
              <div className="relative">
                <Gem className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`h-12 pl-9 text-lg tabular ${tooMuch ? "border-destructive focus-visible:ring-destructive/30" : ""}`} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={tooMuch ? "text-destructive" : "text-muted-foreground"}>
                  {tooMuch ? "Amount exceeds your balance" : <>≈ ₦{fmt(ngn, 0)}</>}
                </span>
                <span className="text-muted-foreground tabular">Balance: {fmt(balance)} Esp</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => quick(0.25)}>25%</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => quick(0.5)}>50%</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => quick(0.75)}>75%</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => quick(1)}>Max</Button>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="purpose">Purpose (optional)</Label>
              <select id="purpose" className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30">
                <option>Pledge redemption</option>
                <option>Offering</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>

            <Button className="mt-6 h-11 w-full text-base" disabled={!canReview} onClick={() => setReviewOpen(true)}>
              Review redemption <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Review / confirm modal */}
      <Dialog open={reviewOpen} onOpenChange={(o) => !processing && setReviewOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm redemption</DialogTitle>
            <DialogDescription>Please review the details before confirming.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <Row label="Redeeming" value={<span className="text-base font-semibold tabular">{fmt(value)} Esp</span>} />
            <Row label="Value" value={`₦${fmt(ngn, 0)}`} />
            <Row label="Fee" value="₦0" />
            <div className="h-px bg-border" />
            <Row label="Remaining balance" value={`${fmt(balance - value)} Esp`} />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled={processing} onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button className="flex-1" disabled={processing} onClick={confirm}>
              {processing ? <><Loader2 className="size-4 animate-spin" /> Processing…</> : <>Confirm <CheckCircle2 className="size-4" /></>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function PageHead() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">Redeem Espees</h1>
      <p className="mt-1 text-sm text-muted-foreground">Convert your Espees impact balance.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}
