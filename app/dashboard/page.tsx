"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { formatEspees, ngnToEspees } from "@/lib/espees";
import { computeStats, last6Months, impactTier } from "@/lib/stats";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Wallet,
  Gem,
  Flame,
  CalendarClock,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const LEADER_TITLES = ["Pastor", "Cell Leader", "Zonal Pastor", "Zonal Secretary", "Deacon", "Deaconess"];

const typeStyles: Record<string, string> = {
  tithe: "bg-primary/10 text-primary",
  offering: "bg-chart-4/15 text-chart-4",
  first_fruit: "bg-chart-2/15 text-chart-2",
  seed: "bg-chart-3/15 text-chart-3",
  pledge_redemption: "bg-chart-3/15 text-chart-3",
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Steward");
  const [meta, setMeta] = useState<any>({});
  const [stats, setStats] = useState({ totalMonth: 0, totalYear: 0, espeesYear: 0, streak: 0 });
  const [tier, setTier] = useState("Bronze");
  const [chart, setChart] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [recent, setRecent] = useState<any[]>([]);
  const [reminder, setReminder] = useState({ count: 0, isOverdue: false });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const m = session.user.user_metadata || {};
      setMeta(m);
      const parts = (m.full_name || "Steward").trim().split(/\s+/);
      setDisplayName(parts.length > 1 ? parts[1] : parts[0]);

      const { data: entries } = await supabase
        .from("giving_entries").select("*").eq("user_id", session.user.id)
        .order("date", { ascending: false });
      const rows = entries || [];

      const s = computeStats(rows);
      setStats({
        totalMonth: s.totalMonth,
        totalYear: s.totalYear,
        espeesYear: Number(ngnToEspees(s.totalYear)),
        streak: s.streak,
      });
      setTier(impactTier(Number(ngnToEspees(s.totalYear))));
      setRecent(rows.slice(0, 6));
      setChart(last6Months(rows));

      const { data: pledges } = await supabase
        .from("pledges").select("due_date, status").eq("user_id", session.user.id)
        .in("status", ["pending", "partially_redeemed"]);
      if (pledges?.length) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        let count = 0, isOverdue = false;
        for (const p of pledges) {
          const diff = Math.ceil((new Date(p.due_date).getTime() - today.getTime()) / 86400000);
          if (diff < 0) { isOverdue = true; count++; } else if (diff <= 7) count++;
        }
        setReminder({ count, isOverdue });
      }
      setLoading(false);
    })();
  }, [router]);

  const isLeader = !!meta.title && LEADER_TITLES.includes(meta.title);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          {meta.zone || "No zone set"}{meta.church ? ` · ${meta.church}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Welcome, {meta.title ? `${meta.title} ` : ""}{displayName}
        </h1>
      </div>

      {/* Pledge reminder */}
      {reminder.count > 0 && (
        <div className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
          reminder.isOverdue
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-chart-4/30 bg-chart-4/10 text-foreground"
        }`}>
          <AlertTriangle className="size-4 shrink-0" />
          <span className="flex-1">
            {reminder.isOverdue
              ? <><strong>{reminder.count}</strong> pledge{reminder.count > 1 ? "s" : ""} overdue for redemption.</>
              : <><strong>{reminder.count}</strong> pledge{reminder.count > 1 ? "s" : ""} due within 7 days.</>}
          </span>
          <Link href="/pledges" className="font-medium hover:underline">View</Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="This month" loading={loading}
          value={<>₦{stats.totalMonth.toLocaleString()}</>} />
        <StatCard icon={ArrowUpRight} label="This year" loading={loading}
          value={<>₦{stats.totalYear.toLocaleString()}</>} />
        <StatCard icon={Gem} label={`Espees · ${tier}`} loading={loading} highlight
          value={<>{stats.espeesYear.toLocaleString()} <span className="text-lg">Esp</span></>} />
        <StatCard icon={Flame} label="Giving streak" loading={loading}
          value={<>{stats.streak} <span className="text-lg">wk</span></>} />
      </div>

      {/* Chart + recent */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="pt-2">
            <div className="mb-1 flex items-baseline justify-between">
              <h3 className="font-medium">6-month trend</h3>
              <span className="text-xs text-muted-foreground">Naira given per month</span>
            </div>
            <div className="h-64">
              {!loading && (
                <Bar
                  data={{
                    labels: chart.labels,
                    datasets: [{
                      data: chart.data,
                      backgroundColor: chart.data.map((_, i) =>
                        i === chart.data.length - 1
                          ? "oklch(0.55 0.19 273)"
                          : "oklch(0.62 0.17 273 / 0.22)"),
                      hoverBackgroundColor: "oklch(0.55 0.19 273)",
                      borderRadius: 8,
                      borderSkipped: false,
                      maxBarThickness: 34,
                      categoryPercentage: 0.7,
                      barPercentage: 0.9,
                    }],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    layout: { padding: { top: 8 } },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "oklch(0.21 0.03 266)",
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        titleColor: "rgba(255,255,255,0.65)",
                        bodyColor: "#fff",
                        bodyFont: { weight: 600 },
                        callbacks: {
                          label: (ctx) => "₦" + Number(ctx.parsed.y).toLocaleString(),
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        border: { display: false },
                        grid: { color: "rgba(120,120,140,0.10)" },
                        ticks: {
                          maxTicksLimit: 4,
                          color: "rgba(120,120,140,0.8)",
                          font: { size: 11 },
                          callback: (v) =>
                            "₦" + new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(v)),
                        },
                      },
                      x: {
                        border: { display: false },
                        grid: { display: false },
                        ticks: { color: "rgba(120,120,140,0.8)", font: { size: 11 } },
                      },
                    },
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="pt-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">Recent giving</h3>
              <Link href="/history" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : recent.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <CalendarClock className="mx-auto mb-2 size-8 opacity-40" />
                No giving logged yet.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${typeStyles[e.type] || "bg-muted text-muted-foreground"} border-0 capitalize`}>
                        {String(e.type).replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium tabular">₦{Number(e.amount).toLocaleString()}</div>
                      <div className="text-xs text-primary tabular">{formatEspees(e.amount)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {isLeader && (
        <div className="mt-6">
          <Button render={<Link href="/leader-dashboard" />} variant="outline" className="gap-2">
            Open Leadership Hub <ArrowUpRight className="size-4" />
          </Button>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({
  icon: Icon, label, value, loading, highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className={`size-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className={`text-2xl font-semibold tabular ${highlight ? "text-primary" : ""}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
