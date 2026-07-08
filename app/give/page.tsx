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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gem, Loader2 } from "lucide-react";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const types = [
  { value: "tithe", label: "Tithe" },
  { value: "offering", label: "Offering" },
  { value: "first_fruit", label: "First Fruit" },
  { value: "seed", label: "Seed" },
  { value: "other", label: "Other" },
];

export default function GivePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("tithe");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      setDate(new Date().toISOString().split("T")[0]);
    });
  }, [router]);

  const espeesPreview = formatEspees(parseFloat(amount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("giving_entries").insert([{
      user_id: user.id, amount: parseFloat(amount), type, date, notes,
    }]);
    setLoading(false);
    if (error) {
      toast.error("Couldn't save entry", { description: error.message });
    } else {
      toast.success("Giving logged", { description: `${espeesPreview} added to your impact.` });
      setAmount(""); setNotes("");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Log giving</h1>
          <p className="mt-1 text-sm text-muted-foreground">Record a gift and watch it become Espees.</p>
        </div>

        <Card>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (NGN)</Label>
                <Input id="amount" type="number" required min="1" step="0.01" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg tabular" />
                {/* live Espees preview */}
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                  <Gem className="size-4 text-primary" />
                  <span className="text-muted-foreground">Yields</span>
                  <span className="font-semibold text-primary tabular">{espeesPreview}</span>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Category</Label>
                  <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
                    {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required value={date}
                    onChange={(e) => setDate(e.target.value)} className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea id="notes" rows={3} placeholder="Any specific details…"
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button render={<Link href="/dashboard" />} variant="outline" className="flex-1">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-[2]">
                  {loading ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : "Save entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
