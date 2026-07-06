"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Target, Loader2, CalendarClock } from "lucide-react";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  partially_redeemed: { label: "Partial", className: "bg-chart-4/15 text-chart-4" },
  redeemed: { label: "Redeemed", className: "bg-chart-3/15 text-chart-3" },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive" },
};

export default function PledgesPage() {
  const router = useRouter();
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("tithe");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [method, setMethod] = useState<"espees" | "paystack">("espees");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      setDueDate(new Date().toISOString().split("T")[0]);
      await load(session.user.id);
      setLoading(false);
    })();
  }, [router]);

  // Handle the return from the pay portal.
  // Espees: ?redeem=<redemptionId>[&failed=1]. Paystack: ?reference=<ref>&trxref=<ref>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redeemId = params.get("redeem");
    const payRef = params.get("reference") || params.get("trxref");
    if (!redeemId && !payRef) return;
    const failed = params.get("failed") === "1";
    window.history.replaceState({}, "", "/pledges"); // clean the URL

    (async () => {
      if (failed) { toast.error("Payment was not completed"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const t = toast.loading("Confirming your payment…");
      try {
        const res = await fetch("/api/redeem/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(redeemId ? { redemptionId: redeemId } : { paymentRef: payRef }),
        });
        const data = await res.json();
        console.log("[redeem/confirm]", res.status, data);
        if (data.status === "confirmed") {
          toast.success(data.isFull ? "Pledge fully redeemed" : "Redemption recorded", { id: t });
        } else if (data.status === "pending") {
          toast.message("Payment is still processing — check back shortly", { id: t });
        } else {
          const detail = data.error || (data.provider ? `payment status: ${data.provider}` : "unknown error");
          toast.error(`Payment could not be confirmed — ${detail}`, { id: t });
        }
      } catch (e) {
        console.error("[redeem/confirm] client error", e);
        toast.error("Could not confirm payment", { id: t });
      } finally {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) load(s.user.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (uid: string) => {
    const { data } = await supabase.from("pledges").select("*")
      .eq("user_id", uid).order("created_at", { ascending: false });
    if (data) setPledges(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("pledges").insert({
      user_id: user.id, amount: parseFloat(amount), category,
      due_date: dueDate, notes, status: "pending", redeemed_amount: 0,
    });
    setSubmitting(false);
    if (error) { toast.error("Couldn't create pledge"); return; }
    toast.success("Pledge created");
    setAmount(""); setNotes("");
    load(user.id);
  };

  const openRedeem = (p: any) => { setCurrent(p); setRedeemAmount(""); setModalOpen(true); };

  // Start a real Espees payment. Nothing is marked redeemed here — the pledge
  // only updates after the payment is confirmed server-side on return.
  const startRedeem = async () => {
    if (!current || !user) return;
    const rAmt = parseFloat(redeemAmount);
    if (!Number.isFinite(rAmt) || rAmt <= 0) { toast.error("Enter a valid amount"); return; }
    if (rAmt > remaining + 0.001) { toast.error("Amount exceeds the outstanding pledge"); return; }
    setRedeeming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("Please log in again"); setRedeeming(false); return; }
      const res = await fetch("/api/redeem/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pledgeId: current.id, amountNgn: rAmt, method, origin: window.location.origin }),
      });
      const data = await res.json();
      if (!res.ok || !data.payUrl) throw new Error(data.error || "Could not start payment");
      window.location.href = data.payUrl; // redirect to the Espees pay portal
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start payment");
      setRedeeming(false);
    }
  };

  const remaining = current ? parseFloat(current.amount) - (parseFloat(current.redeemed_amount) || 0) : 0;
  const quick = (pct: number) => setRedeemAmount((remaining * pct).toFixed(2));

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Pledges</h1>
        <p className="mt-1 text-sm text-muted-foreground">Commit, track, and redeem your giving goals.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Create */}
        <Card className="lg:col-span-2 h-fit">
          <CardContent className="pt-2">
            <h3 className="mb-4 font-medium">New pledge</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-amount">Amount (NGN)</Label>
                <Input id="p-amount" type="number" required min="1" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 tabular" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-cat">Category</Label>
                <select id="p-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                  <option value="tithe">Tithe</option>
                  <option value="offering">Offering</option>
                  <option value="first_fruit">First Fruit</option>
                  <option value="seed">Seed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-due">Redemption date</Label>
                <Input id="p-due" type="date" required value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-notes">Notes</Label>
                <Input id="p-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-11" />
              </div>
              <Button type="submit" disabled={submitting} className="mt-2 h-11 w-full text-base">
                {submitting ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : "Create pledge"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-4 lg:col-span-3">
          {loading ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
          ) : pledges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
                <Target className="mb-3 size-10 opacity-40" />
                <h3 className="font-medium text-foreground">No pledges yet</h3>
                <p className="mt-1 text-sm">Create your first pledge to start tracking.</p>
              </CardContent>
            </Card>
          ) : (
            pledges.map((p) => {
              const total = parseFloat(p.amount);
              const redeemed = parseFloat(p.redeemed_amount) || 0;
              const pct = Math.min(100, Math.round((redeemed / total) * 100));
              const meta = statusMeta[p.status] || statusMeta.pending;
              return (
                <Card key={p.id}>
                  <CardContent className="pt-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-semibold tabular">₦{total.toLocaleString()}</span>
                          <Badge className={`${meta.className} border-0`}>{meta.label}</Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                          <CalendarClock className="size-3.5" />
                          {String(p.category).replace(/_/g, " ")} · due {new Date(p.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      {p.status !== "redeemed" && (
                        <Button size="sm" onClick={() => openRedeem(p)}>Redeem</Button>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground tabular">
                        <span>₦{redeemed.toLocaleString()} redeemed</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Redeem dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem pledge</DialogTitle>
            <DialogDescription>
              {current && <>₦{remaining.toLocaleString()} remaining of ₦{parseFloat(current.amount).toLocaleString()}.</>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => quick(0.25)}>25%</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => quick(0.5)}>50%</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => quick(1)}>Full</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="redeem">Amount to redeem now (NGN)</Label>
              <Input id="redeem" type="number" min="1" step="0.01" value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)} className="h-11 tabular" />
            </div>
            <div className="space-y-2">
              <Label>Pay with</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["espees", "paystack"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                      method === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-transparent text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {m === "paystack" ? "Paystack (card)" : "Espees"}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={startRedeem} disabled={redeeming || !redeemAmount} className="h-11 w-full text-base">
              {redeeming ? <><Loader2 className="size-4 animate-spin" /> Redirecting…</> : "Continue to payment"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You&apos;ll be taken to {method === "paystack" ? "Paystack" : "Espees"} to complete payment securely.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
