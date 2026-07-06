"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, ShieldCheck, Church } from "lucide-react";

const TIER_TITLE: Record<string, string> = { zonal: "Zonal Pastor", group: "Group Pastor", subgroup: "Sub-group Leader" };

// Unified leader onboarding via a delegated invite (any tier). Scope is locked
// to the invite; the leader just makes an account and is auto-approved.
export default function OnboardLeaderPage() {
  const params = useParams();
  const router = useRouter();
  const code = String(params.code || "");

  const [inv, setInv] = useState<{ tier: string; zone: string | null; church: string | null; sub_group: string | null } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("leader_invite_info", { p_code: code });
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) setNotFound(true); else setInv(row);
      setLoading(false);
    })();
  }, [code]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inv) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      const title = TIER_TITLE[inv.tier] || "Cell Leader";
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName, phone_number: form.phone, title,
            zone: inv.zone, church: inv.church, sub_group: inv.sub_group, role: "member",
          },
        },
      });
      if (error) throw error;
      const { error: rpcErr } = await supabase.rpc("accept_leader_invite", { p_code: code });
      if (rpcErr) throw rpcErr;
      router.push("/leader-dashboard");
    } catch (err: any) {
      setErrorMsg(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-6"><Loader2 className="size-6 animate-spin text-muted-foreground" /></main>;
  }
  if (notFound) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invalid or used leader link</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ask whoever invited you for a fresh one.</p>
          <Button render={<Link href="/login" />} variant="outline" className="mt-6">Go to log in</Button>
        </div>
      </main>
    );
  }

  const scope = [inv!.zone, inv!.church, inv!.sub_group].filter(Boolean).join(" · ");

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Set up your leadership</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          You&apos;re being onboarded as <span className="font-medium text-foreground">{TIER_TITLE[inv!.tier]}</span>.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Church className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{scope || "Your zone"}</p>
            <p className="truncate text-xs text-muted-foreground">Scope locked to this invite</p>
          </div>
          <ShieldCheck className="size-4 shrink-0 text-primary" />
        </div>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" required placeholder="John Doe" value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required placeholder="you@example.com" value={form.email}
              onChange={(e) => set("email", e.target.value)} className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" required placeholder="+234…" value={form.phone}
                onChange={(e) => set("phone", e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} placeholder="••••••••"
                value={form.password} onChange={(e) => set("password", e.target.value)} className="h-11" />
            </div>
          </div>

          {errorMsg && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMsg}</p>}

          <Button type="submit" disabled={submitting} className="h-11 w-full text-base">
            {submitting ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : <>Create leader account <ArrowRight className="size-4" /></>}
          </Button>
        </form>
      </div>
    </main>
  );
}
