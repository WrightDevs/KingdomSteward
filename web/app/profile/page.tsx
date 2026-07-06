"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { kingdomZones } from "@/lib/zones";
import { formatEspees } from "@/lib/espees";
import { computeWeekStreak, peakMonth } from "@/lib/stats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Gem, Flame, TrendingUp, Share2, Save, LogOut, Loader2, } from "lucide-react";
import html2canvas from "html2canvas";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [zone, setZone] = useState("");
  const [church, setChurch] = useState("");
  const [stats, setStats] = useState({ total: 0, espees: "0 Esp", streak: 0, peakMonth: "-" });

  const cardRef = useRef<HTMLDivElement>(null);
  const zoneOptions = Object.keys(kingdomZones).sort();
  const churchOptions = zone && kingdomZones[zone] ? Array.from(new Set(kingdomZones[zone])).sort() : [];

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const m = session.user.user_metadata || {};
      setFullName(m.full_name || ""); setEmail(session.user.email || "");
      setTitle(m.title || ""); setZone(m.zone || ""); setChurch(m.church || "");

      const { data } = await supabase.from("giving_entries").select("amount, date")
        .eq("user_id", session.user.id);
      if (data) {
        const sum = data.reduce((a, c) => a + Number(c.amount), 0);
        setStats({
          total: sum, espees: formatEspees(sum),
          streak: computeWeekStreak(data as any), peakMonth: peakMonth(data as any).label,
        });
      }
      setLoading(false);
    })();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName, title, zone, church } });
    setSaving(false);
    error ? toast.error(error.message) : toast.success("Profile updated");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Could not render image");
      const file = new File([blob], "kingdom-impact.png", { type: "image/png" });
      const nav = navigator as any;
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "My Kingdom Impact" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "kingdom-impact.png"; a.click();
        URL.revokeObjectURL(url);
      }
      toast.success("Impact card ready to share");
    } catch (err: any) {
      toast.error(err.message || "Share failed");
    } finally {
      setSharing(false);
    }
  };

  const initials = (fullName || "S").split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  if (loading) {
    return <AppShell><div className="py-20 text-center text-muted-foreground">Loading…</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your details and kingdom impact.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Details */}
        <Card className="lg:col-span-3 h-fit">
          <CardContent className="pt-2">
            <div className="mb-6 flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{fullName || "Steward"}</div>
                <div className="text-sm text-muted-foreground">{email}</div>
              </div>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <select id="zone" value={zone} onChange={(e) => { setZone(e.target.value); setChurch(""); }} className={selectClass}>
                  <option value="">Select zone</option>
                  {zoneOptions.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="church">Local church</Label>
                <select id="church" value={church} disabled={!zone} onChange={(e) => setChurch(e.target.value)} className={selectClass}>
                  <option value="">{zone ? "Select church" : "Choose a zone first"}</option>
                  {churchOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : <><Save className="size-4" /> Save changes</>}
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout} className="gap-2 text-destructive">
                  <LogOut className="size-4" /> Log out
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Impact card */}
        <div className="space-y-4 lg:col-span-2">
          <div ref={cardRef} className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span className="size-4"></span> Kingdom Impact
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Gem className="size-6" />
                <span className="text-3xl font-semibold tabular">{stats.espees}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1.5 opacity-80"><TrendingUp className="size-3.5" /> Given</div>
                  <div className="mt-0.5 font-medium tabular">₦{stats.total.toLocaleString()}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 opacity-80"><Flame className="size-3.5" /> Streak</div>
                  <div className="mt-0.5 font-medium tabular">{stats.streak} wk</div>
                </div>
              </div>
              <div className="mt-4 border-t border-white/20 pt-3 text-xs opacity-70">
                Peak month · {stats.peakMonth} · kingdomsteward.app
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleShare} disabled={sharing} className="w-full gap-2">
            {sharing ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Share2 className="size-4" /> Share my impact</>}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
