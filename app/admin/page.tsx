"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MintInvite } from "@/components/mint-invite";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck, Building2, Users, Check, X, Loader2, Inbox, Gem, Landmark, Plus } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [churches, setChurches] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [busy, setBusy] = useState<string>("");

  const load = async () => {
    const { data: c } = await supabase.from("churches").select("*").eq("status", "pending").order("created_at", { ascending: false });
    const { data: cl } = await supabase
      .from("church_leaders")
      .select("*, churches(name, zone), profiles(full_name, email)")
      .eq("status", "pending").order("created_at", { ascending: false });
    setChurches(c || []);
    setClaims(cl || []);
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!admin) { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);
      await load();
      setLoading(false);
    })();
  }, [router]);

  const act = async (type: "church" | "claim", id: string, action: "approve" | "reject") => {
    setBusy(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ type, id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      if (type === "church") setChurches((xs) => xs.filter((x) => x.id !== id));
      else setClaims((xs) => xs.filter((x) => x.id !== id));
      toast.success(action === "approve" ? "Approved" : "Rejected");
      if (data.subaccountNote) toast.message(`Note: bank subaccount not created — ${data.subaccountNote}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy("");
    }
  };

  if (!loading && !isAdmin) {
    return (
      <AppShell>
        <Card>
          <CardContent className="flex flex-col items-center py-20 text-center">
            <ShieldAlert className="mb-3 size-12 text-destructive" />
            <h2 className="text-xl font-semibold">Admins only</h2>
            <p className="mt-1 text-sm text-muted-foreground">You don&apos;t have super-admin access.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin approvals</h1>
          <p className="text-sm text-muted-foreground">Review and approve church accounts and leadership claims.</p>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
      ) : (
        <div className="space-y-8">
          {/* Invite a zonal pastor (top of the delegated chain) */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Plus className="size-4" /> Invite a zonal pastor
            </h2>
            <MintInvite tier="zonal" title="New zonal pastor"
              help="Pick a zone and share the link. They onboard, then invite their group pastors — no admin action needed after this." />
          </section>

          {/* Church sub-accounts */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="size-4" /> Church accounts <Badge className="border-0 bg-muted text-muted-foreground">{churches.length}</Badge>
            </h2>
            {churches.length === 0 ? (
              <Empty label="No pending church accounts." />
            ) : (
              <div className="space-y-3">
                {churches.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-2">
                      <div className="min-w-0">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.zone}</p>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1.5"><Gem className="size-3.5 text-primary" /> {c.espees_wallet || <span className="italic">no wallet</span>}</p>
                          <p className="flex items-center gap-1.5"><Landmark className="size-3.5 text-primary" />
                            {c.bank_name ? `${c.bank_name} · ${c.account_number}${c.account_name ? ` · ${c.account_name}` : ""}` : <span className="italic">no bank account</span>}
                          </p>
                        </div>
                      </div>
                      <Actions busy={busy === c.id} onApprove={() => act("church", c.id, "approve")} onReject={() => act("church", c.id, "reject")} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Leadership claims */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4" /> Leadership claims <Badge className="border-0 bg-muted text-muted-foreground">{claims.length}</Badge>
            </h2>
            {claims.length === 0 ? (
              <Empty label="No pending leadership claims." />
            ) : (
              <div className="space-y-3">
                {claims.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-2">
                      <div className="min-w-0">
                        <p className="font-medium">{c.profiles?.full_name || c.profiles?.email || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.role} · {c.churches?.name || "—"} · {c.zone}
                        </p>
                      </div>
                      <Actions busy={busy === c.id} onApprove={() => act("claim", c.id, "approve")} onReject={() => act("claim", c.id, "reject")} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}

function Actions({ busy, onApprove, onReject }: { busy: boolean; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" disabled={busy} onClick={onReject} className="gap-1.5">
        <X className="size-3.5" /> Reject
      </Button>
      <Button size="sm" disabled={busy} onClick={onApprove} className="gap-1.5">
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Approve
      </Button>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-10 text-center text-sm text-muted-foreground">
        <Inbox className="mb-2 size-8 opacity-40" /> {label}
      </CardContent>
    </Card>
  );
}
