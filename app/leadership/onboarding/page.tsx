"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { kingdomZones } from "@/lib/zones";
import AppShell from "@/components/AppShell";
import { SearchableSelect } from "@/components/searchable-select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, Loader2, Clock, CheckCircle2, Gem, ArrowRight, Landmark, Copy, Link2 } from "lucide-react";

const ROLES = [
  "Pastor", "Zonal Pastor", "Zonal Secretary", "Cell Leader", "Deacon", "Deaconess", "Church Admin",
];

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export default function LeadershipOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState<any>(null);
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [form, setForm] = useState({
    role: "", zone: "", church: "", subGroup: "", espeesWallet: "",
    bankName: "", bankCode: "", accountNumber: "",
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const m = session.user.user_metadata || {};
      setForm((f) => ({ ...f, role: m.title || "", zone: m.zone || "", church: m.church || "", subGroup: m.sub_group || "" }));

      const { data } = await supabase
        .from("church_leaders")
        .select("*, churches(name, zone, status, invite_code)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length) setClaim(data[0]);

      fetch("/api/paystack/banks")
        .then((r) => r.json())
        .then((d) => setBanks(d.banks || []))
        .catch(() => setBanks([]));

      setLoading(false);
    })();
  }, [router]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v, ...(k === "zone" ? { church: "" } : {}) }));

  const setBank = (name: string) =>
    setForm((f) => ({ ...f, bankName: name, bankCode: banks.find((b) => b.name === name)?.code || "" }));

  const zoneOptions = Object.keys(kingdomZones).sort();
  const churchOptions =
    form.zone && kingdomZones[form.zone] ? Array.from(new Set(kingdomZones[form.zone])).sort() : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role || !form.zone || !form.church) {
      toast.error("Role, zone and church are required");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/leadership/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit");
      toast.success("Submitted — pending admin approval");
      setClaim({
        status: "pending", role: form.role, zone: form.zone,
        churches: { name: form.church, status: "pending", invite_code: data.inviteCode },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-8 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leadership onboarding</h1>
          <p className="text-sm text-muted-foreground">Connect to your church and set up its account.</p>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
      ) : claim ? (
        <StatusCard claim={claim} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3 h-fit">
            <CardContent className="pt-2">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Your role</Label>
                  <select id="role" required value={form.role}
                    onChange={(e) => set("role", e.target.value)} className={selectClass}>
                    <option value="">Select your role</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zone / Ministry centre</Label>
                  <SearchableSelect
                    id="zone" name="zone" required items={zoneOptions}
                    value={form.zone} onValueChange={(v) => set("zone", v)}
                    placeholder="Type to search your zone" emptyText="No zone matches that search"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="church">Church / Group</Label>
                  <SearchableSelect
                    id="church" name="church" items={churchOptions}
                    value={form.church} onValueChange={(v) => set("church", v)}
                    disabled={!form.zone || churchOptions.length === 0}
                    placeholder={
                      !form.zone ? "Choose a zone first"
                        : churchOptions.length === 0 ? "No groups listed for this zone"
                        : "Type to search your church"
                    }
                    emptyText="No church matches that search"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subGroup">
                    Sub-group <span className="text-xs font-normal text-muted-foreground">(leave blank if you lead the whole group)</span>
                  </Label>
                  <Input id="subGroup" placeholder="e.g. your cell / fellowship" value={form.subGroup}
                    onChange={(e) => set("subGroup", e.target.value)} className="h-11" />
                  <p className="text-xs text-muted-foreground">
                    Set this to lead a specific sub-group — you&apos;ll only see your sub-group&apos;s members. Leave blank to see group-wide totals.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet" className="flex items-center gap-1.5">
                    <Gem className="size-3.5 text-primary" /> Church Espees wallet
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="wallet" placeholder="0x…" value={form.espeesWallet}
                    onChange={(e) => set("espeesWallet", e.target.value)} className="h-11 font-mono text-sm" />
                </div>

                {/* Church bank account — where card (Paystack) redemptions settle */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                    <Landmark className="size-4 text-primary" /> Church bank account
                    <span className="text-xs font-normal text-muted-foreground">(for card payouts)</span>
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank">Bank</Label>
                      <SearchableSelect
                        id="bank"
                        items={banks.map((b) => b.name)}
                        value={form.bankName}
                        onValueChange={setBank}
                        disabled={banks.length === 0}
                        placeholder={banks.length === 0 ? "Bank list unavailable" : "Type to search your bank"}
                        emptyText="No bank matches that search"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acct">Account number</Label>
                      <Input id="acct" inputMode="numeric" maxLength={10} placeholder="0123456789"
                        value={form.accountNumber}
                        onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, ""))}
                        className="h-11 tabular" />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="h-11 w-full text-base">
                  {submitting ? <><Loader2 className="size-4 animate-spin" /> Submitting…</> : "Submit for approval"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-4 pt-2 text-sm">
                <h3 className="font-medium">What happens next</h3>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-2.5"><Step n={1} /> We create your church&apos;s account with its Espees wallet, bank account, and a unique member-invite link.</li>
                  <li className="flex gap-2.5"><Step n={2} /> A super-admin reviews and approves your claim.</li>
                  <li className="flex gap-2.5"><Step n={3} /> Share your invite link so members join the right church — no mistakes.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatusCard({ claim }: { claim: any }) {
  const approved = claim.status === "approved";
  const churchName = claim.churches?.name || claim.church || "your church";
  const inviteCode = claim.churches?.invite_code as string | undefined;
  const inviteUrl = inviteCode && typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}` : "";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <span className={`mb-5 grid size-16 place-items-center rounded-full ${approved ? "bg-chart-3/15" : "bg-chart-4/15"}`}>
            {approved ? <CheckCircle2 className="size-9 text-chart-3" /> : <Clock className="size-9 text-chart-4" />}
          </span>
          <h2 className="text-2xl font-semibold">{approved ? "You're all set" : "Awaiting approval"}</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            {approved
              ? `Your leadership of ${churchName} is active.`
              : `Your claim for ${churchName} is pending a super-admin review. We'll unlock the leadership tools once it's approved.`}
          </p>

          <div className="mt-6 w-full space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <Row label="Role" value={claim.role} />
            <Row label="Zone" value={claim.zone} />
            <Row label="Church" value={churchName} />
            <Row label="Status" value={
              <Badge className={`border-0 ${approved ? "bg-chart-3/15 text-chart-3" : "bg-chart-4/15 text-chart-4"}`}>
                {approved ? "Approved" : "Pending"}
              </Badge>
            } />
          </div>

          {approved && (
            <Button render={<Link href="/leader-dashboard" />} className="mt-6">
              Open Leadership Hub <ArrowRight className="size-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {inviteUrl && <InviteCard url={inviteUrl} />}
    </div>
  );
}

function InviteCard({ url }: { url: string }) {
  return (
    <Card>
      <CardContent className="pt-2">
        <p className="flex items-center gap-1.5 font-medium">
          <Link2 className="size-4 text-primary" /> Member onboarding link
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Share this so your members sign up straight into your church — their zone and church are locked, so no mistakes.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
          <code className="flex-1 truncate px-1 text-xs">{url}</code>
          <Button size="sm" variant="outline" className="shrink-0 gap-1.5"
            onClick={() => { navigator.clipboard?.writeText(url); toast.success("Link copied"); }}>
            <Copy className="size-3.5" /> Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground">
      {n}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
