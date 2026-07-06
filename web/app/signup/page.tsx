"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Link2 } from "lucide-react";

// Members can only join via their church's invite link, so mistakes picking a
// zone / group / sub-group are impossible. This page just accepts a code (or a
// pasted link) and forwards to the locked /join flow.
export default function SignupPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    // Accept a bare code, or a full/partial URL like .../join/<code>?sg=...
    const match = raw.match(/\/join\/([^/?#\s]+)([^\s]*)/i);
    if (match) {
      router.push(`/join/${match[1]}${match[2] || ""}`);
      return;
    }
    if (/[\s/\\]/.test(raw)) {
      setErrorMsg("That doesn't look like a valid code or link.");
      return;
    }
    router.push(`/join/${encodeURIComponent(raw)}`);
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Link2 className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Join your church</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter the invite link or code your church leader gave you.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Invite link or code</Label>
            <Input id="code" required autoFocus placeholder="Paste link or enter code"
              value={value} onChange={(e) => { setValue(e.target.value); setErrorMsg(""); }}
              className="h-11" />
          </div>

          {errorMsg && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMsg}</p>
          )}

          <Button type="submit" className="h-11 w-full text-base">
            Continue <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have a link? Ask your church leader for one.
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
