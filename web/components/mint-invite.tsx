"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/searchable-select";
import { kingdomZones } from "@/lib/zones";
import { toast } from "sonner";
import { Copy, Loader2, UserPlus } from "lucide-react";

type Tier = "zonal" | "group" | "subgroup";

// Mints a delegated leader invite for the tier directly below the caller.
// - zonal: super-admin picks a zone.
// - group: zonal pastor picks a group (church) in their zone.
// - subgroup: group pastor names a sub-group in their church.
export function MintInvite({ tier, zone, title, help }: { tier: Tier; zone?: string; title: string; help: string }) {
  const [pickZone, setPickZone] = useState("");
  const [pickChurch, setPickChurch] = useState("");
  const [sub, setSub] = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");

  const churchOptions = tier === "group" && zone && kingdomZones[zone]
    ? Array.from(new Set(kingdomZones[zone])).sort() : [];

  const mint = async () => {
    setBusy(true);
    try {
      const args =
        tier === "zonal" ? { p_tier: "zonal", p_zone: pickZone, p_church: null, p_sub_group: null }
        : tier === "group" ? { p_tier: "group", p_zone: zone, p_church: pickChurch, p_sub_group: null }
        : { p_tier: "subgroup", p_zone: null, p_church: null, p_sub_group: sub };
      const { data, error } = await supabase.rpc("mint_leader_invite", args);
      if (error) throw error;
      setUrl(`${window.location.origin}/onboard-leader/${data}`);
      toast.success("Invite link created");
    } catch (e: any) {
      toast.error(e.message || "Could not create invite");
    } finally {
      setBusy(false);
    }
  };

  const ready = tier === "zonal" ? !!pickZone : tier === "group" ? !!pickChurch : sub.trim().length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 font-medium"><UserPlus className="size-4 text-primary" /> {title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{help}</p>

      <div className="mt-3 space-y-3">
        {tier === "zonal" && (
          <SearchableSelect items={Object.keys(kingdomZones).sort()} value={pickZone}
            onValueChange={setPickZone} placeholder="Search zone" />
        )}
        {tier === "group" && (
          <SearchableSelect items={churchOptions} value={pickChurch}
            onValueChange={setPickChurch} placeholder="Search group / church" />
        )}
        {tier === "subgroup" && (
          <div className="space-y-2">
            <Label htmlFor="sg">Sub-group name</Label>
            <Input id="sg" value={sub} onChange={(e) => setSub(e.target.value)}
              placeholder="e.g. Alpha Cell" className="h-11" />
          </div>
        )}

        {url ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
            <code className="flex-1 truncate px-1 text-xs">{url}</code>
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5"
              onClick={() => { navigator.clipboard?.writeText(url); toast.success("Copied"); }}>
              <Copy className="size-3.5" /> Copy
            </Button>
          </div>
        ) : (
          <Button onClick={mint} disabled={busy || !ready} className="h-10 w-full">
            {busy ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : "Create invite link"}
          </Button>
        )}
        {url && (
          <Button variant="ghost" size="sm" onClick={() => { setUrl(""); setPickZone(""); setPickChurch(""); setSub(""); }}>
            Create another
          </Button>
        )}
      </div>
    </div>
  );
}
