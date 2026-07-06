"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { formatEspees } from "@/lib/espees";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MintInvite } from "@/components/mint-invite";
import {
  ShieldAlert, ShieldCheck, Printer, Inbox, Users, Gem, Wallet, ArrowRight,
  Link2, Copy, ChevronDown, Search, Target,
} from "lucide-react";
import { toast } from "sonner";

const LEADER_TITLES = ["Pastor", "Cell Leader", "Zonal Pastor", "Zonal Secretary", "Deacon", "Deaconess"];

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  partially_redeemed: { label: "Partial", className: "bg-chart-4/15 text-chart-4" },
  redeemed: { label: "Redeemed", className: "bg-chart-3/15 text-chart-3" },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive" },
};

const TYPE_LABELS: Record<string, string> = {
  tithe: "Tithe", offering: "Offering", first_fruit: "First Fruit",
  seed: "Seed", pledge_redemption: "Pledge redemption",
};
const label = (v: string) => TYPE_LABELS[v] || String(v).replace(/_/g, " ");

interface MemberRow {
  id: string; full_name: string | null; title: string | null; email: string | null;
  given: number; entries: any[]; pledges: any[]; pledged: number; redeemed: number;
}

export default function LeaderDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [meta, setMeta] = useState<any>({});
  const [stats, setStats] = useState({ members: 0, espees: 0, pledged: 0, redeemed: 0 });
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invite, setInvite] = useState<{ code: string; church: string; subGroup: string } | null>(null);
  const [isGroupPastor, setIsGroupPastor] = useState(false);
  const [isZonal, setIsZonal] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const md = session.user.user_metadata || {};

      // The profile row is the source of truth (onboarding writes sub_group here).
      const { data: prof } = await supabase
        .from("profiles").select("title, zone, church, sub_group").eq("id", session.user.id).single();
      const title = prof?.title || md.title;
      const zone = prof?.zone ?? md.zone;
      const church = prof?.church ?? md.church;
      const subGroup = (prof?.sub_group || "").trim();
      setMeta({ zone, church, title, subGroup });
      if (!title || !LEADER_TITLES.includes(title)) { setIsLeader(false); setLoading(false); return; }
      setIsLeader(true);
      const zonal = title === "Zonal Pastor" || title === "Zonal Secretary";
      setIsZonal(zonal);

      const { data: cl } = await supabase
        .from("church_leaders").select("status, churches(name, invite_code)")
        .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1);
      const clRow: any = cl?.[0];
      const ch: any = Array.isArray(clRow?.churches) ? clRow.churches[0] : clRow?.churches;
      if (ch?.invite_code) setInvite({ code: ch.invite_code, church: ch.name, subGroup });

      // Zonal pastor: zone-wide TOTALS only (all groups), never members.
      if (zonal) {
        setIsGroupPastor(true);
        const { data: totals } = await supabase.rpc("my_zone_totals");
        const t: any = Array.isArray(totals) ? totals[0] : totals;
        setStats({
          members: Number(t?.members) || 0, espees: Number(t?.given) || 0,
          pledged: Number(t?.pledged) || 0, redeemed: Number(t?.redeemed) || 0,
        });
        setLoading(false);
        return;
      }

      // Group-level pastor (no sub_group): group-wide TOTALS only, never members.
      if (!subGroup) {
        setIsGroupPastor(true);
        const { data: totals } = await supabase.rpc("my_group_totals");
        const t: any = Array.isArray(totals) ? totals[0] : totals;
        setStats({
          members: Number(t?.members) || 0, espees: Number(t?.given) || 0,
          pledged: Number(t?.pledged) || 0, redeemed: Number(t?.redeemed) || 0,
        });
        setLoading(false);
        return;
      }

      // Sub-group leader: full member detail (RLS scopes reads to this sub-group).
      const [{ data: mem }, { data: e }, { data: p }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, title, email").eq("zone", zone).eq("church", church).eq("sub_group", subGroup),
        supabase.from("giving_entries").select("*").order("date", { ascending: false }),
        supabase.from("pledges").select("*").order("created_at", { ascending: false }),
      ]);

      const byMember = new Map<string, MemberRow>();
      for (const mm of mem || []) {
        byMember.set(mm.id, { ...mm, given: 0, entries: [], pledges: [], pledged: 0, redeemed: 0 });
      }
      for (const r of e || []) {
        const rec = byMember.get(r.user_id);
        if (rec) { rec.given += Number(r.amount) || 0; rec.entries.push(r); }
      }
      for (const q of p || []) {
        const rec = byMember.get(q.user_id);
        if (rec) { rec.pledges.push(q); rec.pledged += Number(q.amount) || 0; rec.redeemed += Number(q.redeemed_amount) || 0; }
      }
      const rows = Array.from(byMember.values()).sort((a, b) => b.given - a.given);
      setMembers(rows);
      setStats({
        members: rows.length,
        espees: rows.reduce((s, r) => s + r.given, 0),
        pledged: rows.reduce((s, r) => s + r.pledged, 0),
        redeemed: rows.reduce((s, r) => s + r.redeemed, 0),
      });
      setLoading(false);
    })();
  }, [router]);

  const filtered = query
    ? members.filter((m) => (m.full_name || m.email || "").toLowerCase().includes(query.toLowerCase()))
    : members;

  if (!isLeader && !loading) {
    return (
      <AppShell>
        <Card>
          <CardContent className="flex flex-col items-center py-20 text-center">
            <ShieldAlert className="mb-3 size-12 text-destructive" />
            <h2 className="text-xl font-semibold">Access denied</h2>
            <p className="mt-1 text-sm text-muted-foreground">You need leadership clearance to view this page.</p>
            <Button render={<Link href="/leadership/onboarding" />} className="mt-6">
              Onboard as a leader <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {meta.zone || "Zone"}{meta.church ? ` · ${meta.church}` : ""}{meta.subGroup ? ` · ${meta.subGroup}` : ""}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Leadership Hub</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button render={<Link href="/leadership/onboarding" />} variant="outline" size="sm" className="gap-1.5">
            <ShieldCheck className="size-4" /> Church account
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="size-4" /> Print report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Church members" value={stats.members} loading={loading} />
        <Stat icon={Gem} label="Espees generated" value={formatEspees(stats.espees)} loading={loading} highlight />
        <Stat icon={Target} label="Total pledged" value={`₦${stats.pledged.toLocaleString()}`} loading={loading} />
        <Stat icon={Wallet} label="Pledges redeemed" value={`₦${stats.redeemed.toLocaleString()}`} loading={loading} />
      </div>

      {invite && (
        <Card className="mt-6">
          <CardContent className="pt-2">
            <p className="flex items-center gap-1.5 font-medium">
              <Link2 className="size-4 text-primary" /> Member onboarding link
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share this link — members sign up straight into {invite.church}{invite.subGroup ? ` · ${invite.subGroup}` : ""}, with the zone, church{invite.subGroup ? " and sub-group" : ""} locked so no mistakes are made.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
              <code className="flex-1 truncate px-1 text-xs">
                {inviteUrl(invite)}
              </code>
              <Button size="sm" variant="outline" className="shrink-0 gap-1.5"
                onClick={() => { navigator.clipboard?.writeText(inviteUrl(invite)); toast.success("Link copied"); }}>
                <Copy className="size-3.5" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delegated invite: mint the tier directly below */}
      {isZonal && (
        <div className="mt-6">
          <MintInvite tier="group" zone={meta.zone} title="Invite a group pastor"
            help="Pick a group in your zone and share the link. They onboard and can then invite their own sub-group leaders." />
        </div>
      )}
      {isGroupPastor && !isZonal && (
        <div className="mt-6">
          <MintInvite tier="subgroup" title="Invite a sub-group leader"
            help="Name a sub-group and share the link. That leader sees only their sub-group's members." />
        </div>
      )}

      {isGroupPastor && (
        <Card className="mt-6">
          <CardContent className="pt-2">
            <p className="flex items-center gap-1.5 font-medium"><Users className="size-4 text-primary" /> Group overview</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You lead the whole group, so you see group-wide totals above. Individual member details stay private to each sub-group&apos;s leader.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Per-member breakdown — sub-group leaders only */}
      {!isGroupPastor && (
      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium">Members <span className="text-muted-foreground">({members.length})</span></h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members" className="h-10 pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent><Empty label={members.length ? "No members match your search." : "No members found for your church yet."} /></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => <MemberCard key={m.id} m={m} />)}
          </div>
        )}
      </div>
      )}
    </AppShell>
  );
}

function inviteUrl(inv: { code: string; subGroup: string }): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const sg = inv.subGroup ? `?sg=${encodeURIComponent(inv.subGroup)}` : "";
  return `${origin}/join/${inv.code}${sg}`;
}

function MemberCard({ m }: { m: MemberRow }) {
  const name = m.full_name || m.email || "Unknown";
  const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const byType = (Object.entries(
    m.entries.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + (Number(e.amount) || 0);
      return acc;
    }, {}),
  ) as [string, number][]).sort((a, b) => b[1] - a[1]);
  return (
    <details className="group rounded-xl border border-border bg-card open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{m.title ? `${m.title} ` : ""}{name}</p>
          <p className="truncate text-xs text-muted-foreground">{m.entries.length} gifts · {m.pledges.length} pledges</p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">Given</p>
          <p className="font-semibold tabular">₦{m.given.toLocaleString()}</p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">Redeemed</p>
          <p className="font-semibold tabular">₦{m.redeemed.toLocaleString()}</p>
        </div>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-5 border-t border-border p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Given" value={`₦${m.given.toLocaleString()}`} />
          <MiniStat label="Espees" value={formatEspees(m.given)} primary />
          <MiniStat label="Pledged" value={`₦${m.pledged.toLocaleString()}`} />
          <MiniStat label="Redeemed" value={`₦${m.redeemed.toLocaleString()}`} />
        </div>

        {/* What the giving was for — breakdown by purpose */}
        {byType.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Giving by purpose</p>
            <div className="flex flex-wrap gap-2">
              {byType.map(([type, amt]) => (
                <span key={type} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
                  <span className="font-medium">{label(type)}</span>
                  <span className="tabular text-muted-foreground">₦{amt.toLocaleString()}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {m.pledges.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Pledges</p>
            <div className="space-y-2">
              {m.pledges.map((p) => {
                const total = Number(p.amount) || 0;
                const red = Number(p.redeemed_amount) || 0;
                const pct = total ? Math.min(100, Math.round((red / total) * 100)) : 0;
                const sm = statusMeta[p.status] || statusMeta.pending;
                return (
                  <div key={p.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {label(p.category)} <span className="tabular text-muted-foreground">· ₦{total.toLocaleString()}</span>
                      </span>
                      <Badge className={`${sm.className} border-0`}>{sm.label}</Badge>
                    </div>
                    {p.notes && <p className="mt-0.5 text-xs italic text-muted-foreground">&ldquo;{p.notes}&rdquo;</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ₦{red.toLocaleString()} redeemed · due {new Date(p.due_date).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={pct} className="h-1.5" />
                      <span className="text-xs tabular text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {m.entries.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Giving history</p>
            <div className="divide-y divide-border rounded-lg border border-border">
              {m.entries.slice(0, 12).map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{label(e.type)}</span>
                    {e.notes && <span className="ml-1.5 text-xs text-muted-foreground">— {e.notes}</span>}
                    <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <span className="tabular">₦{(Number(e.amount) || 0).toLocaleString()}</span>
                  <span className="w-20 shrink-0 text-right text-xs tabular text-primary">{formatEspees(e.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {m.pledges.length === 0 && m.entries.length === 0 && (
          <p className="text-sm text-muted-foreground">No giving or pledges yet.</p>
        )}
      </div>
    </details>
  );
}

function MiniStat({ label, value, primary }: { label: string; value: React.ReactNode; primary?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-semibold tabular ${primary ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, loading, highlight }: {
  icon: React.ComponentType<{ className?: string }>; label: string;
  value: React.ReactNode; loading: boolean; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className={`size-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        {loading ? <Skeleton className="h-8 w-20" /> :
          <div className={`text-2xl font-semibold tabular ${highlight ? "text-primary" : ""}`}>{value}</div>}
      </CardContent>
    </Card>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
      <Inbox className="mb-2 size-8 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
