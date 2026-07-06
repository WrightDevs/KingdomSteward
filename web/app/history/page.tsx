"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { formatEspees } from "@/lib/espees";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Printer, Inbox, Trash2, Plus } from "lucide-react";

const selectClass =
  "h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const typeStyles: Record<string, string> = {
  tithe: "bg-primary/10 text-primary",
  offering: "bg-chart-4/15 text-chart-4",
  first_fruit: "bg-chart-2/15 text-chart-2",
  seed: "bg-chart-3/15 text-chart-3",
  pledge_redemption: "bg-chart-3/15 text-chart-3",
};

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase
        .from("giving_entries").select("*")
        .eq("user_id", session.user.id).order("date", { ascending: false });
      setEntries(data || []);
      setLoading(false);
    })();
  }, [router]);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("giving_entries").delete().eq("id", id);
    if (error) { toast.error("Couldn't delete entry"); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry deleted");
  };

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Giving history</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your complete record of giving.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="size-4" /> Print
          </Button>
          <Button render={<Link href="/give" />} size="sm" className="gap-1.5">
            <Plus className="size-4" /> Log giving
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-2">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">
              {loading ? "…" : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`}
            </span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={selectClass}>
              <option value="all">All categories</option>
              <option value="tithe">Tithe</option>
              <option value="offering">Offering</option>
              <option value="first_fruit">First Fruit</option>
              <option value="seed">Seed</option>
              <option value="other">Other</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
              <Inbox className="mb-3 size-10 opacity-40" />
              <h3 className="font-medium text-foreground">No entries found</h3>
              <p className="mt-1 text-sm">Nothing logged in this category yet.</p>
              <Button render={<Link href="/give" />} className="mt-4">Log giving</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Espees</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted-foreground">{new Date(e.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`${typeStyles[e.type] || "bg-muted text-muted-foreground"} border-0 capitalize`}>
                        {String(e.type).replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular">₦{Number(e.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-right text-primary tabular">{formatEspees(e.amount)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(e.id)}
                        aria-label="Delete entry" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
