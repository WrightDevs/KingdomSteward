"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, ShieldCheck, Church } from "lucide-react";

// Per-church member onboarding link. The zone + church are locked to the invite,
// so members can't sign up into the wrong place.
export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = String(params.code || "");

  const [church, setChurch] = useState<{ zone: string; name: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ title: "", fullName: "", email: "", phone: "", password: "", subGroup: "" });
  // A sub-group leader's link can carry ?sg=<sub-group>, which locks it.
  const [lockedSubGroup, setLockedSubGroup] = useState<string | null>(null);

  useEffect(() => {
    const sg = new URLSearchParams(window.location.search).get("sg");
    if (sg) { setLockedSubGroup(sg); setForm((f) => ({ ...f, subGroup: sg })); }
    (async () => {
      const { data } = await supabase.rpc("church_by_invite", { p_code: code });
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) setNotFound(true); else setChurch(row);
      setLoading(false);
    })();
  }, [code]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone_number: form.phone,
            title: form.title,
            zone: church.zone,
            church: church.name,
            sub_group: form.subGroup,
            role: "member",
          },
        },
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invalid invite link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This church onboarding link isn&apos;t valid. Ask your leader for a new one.
          </p>
          <Button render={<Link href="/signup" />} variant="outline" className="mt-6">Go to sign up</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Join your church</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Create your Kingdom Steward account.</p>

        {/* Locked church — no picking the wrong one */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Church className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{church!.name}</p>
            <p className="truncate text-xs text-muted-foreground">{church!.zone}</p>
          </div>
          <ShieldCheck className="size-4 shrink-0 text-primary" />
        </div>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Bro. / Sis." value={form.title}
                onChange={(e) => set("title", e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" required placeholder="John Doe" value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subGroup">
              Sub-group {lockedSubGroup ? "" : <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
            </Label>
            <Input id="subGroup" value={form.subGroup} readOnly={!!lockedSubGroup}
              placeholder="e.g. your cell / fellowship"
              onChange={(e) => set("subGroup", e.target.value)}
              className={`h-11 ${lockedSubGroup ? "bg-muted/50 text-muted-foreground" : ""}`} />
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

          {errorMsg && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMsg}</p>
          )}

          <Button type="submit" disabled={submitting} className="h-11 w-full text-base">
            {submitting ? <><Loader2 className="size-4 animate-spin" /> Creating account…</> : <>Create account <ArrowRight className="size-4" /></>}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
