"use client";

import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BookOpen, Gem, Target, ShieldCheck,
  Check, TrendingUp, Wallet, HandCoins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CountUp from "@/components/CountUp";

const features = [
  { icon: BookOpen, title: "Log in seconds", body: "Record tithes, offerings, first fruits and seed with a single tap. Your full history, always at hand." },
  { icon: Gem, title: "Naira becomes Espees", body: "Every gift converts to Espees — the Kingdom's impact currency — so you can see the weight of what you sow." },
  { icon: Target, title: "Pledges, redeemed", body: "Set annual pledges, track partial redemptions, and get a gentle nudge before anything falls due." },
  { icon: ShieldCheck, title: "Private by design", body: "Your giving is yours. Only you — and your verified leader — ever see it." },
];

const steps = [
  { icon: HandCoins, title: "Give", body: "Enter a tithe, offering, first fruit or seed in a few taps — any time, from anywhere." },
  { icon: Gem, title: "Convert", body: "Your Naira is instantly weighed in Espees, so every gift carries a Kingdom value you can see." },
  { icon: Target, title: "Redeem", body: "Track pledges as they're fulfilled and close out the year with nothing left undone." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* soft ambient glow — no navbar on this PWA entry screen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-accent)_0%,transparent_70%)] opacity-70"
      />
      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center md:pt-28">
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl md:text-6xl">
          Keep a faithful ledger of every seed you sow.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          Log your tithes, offerings and pledges. Watch each gift become Espees —
          all in one quiet, modern place made for stewards.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/signup" />} size="lg" className="h-11 w-full px-6 sm:w-auto">
            Start your ledger <ArrowRight className="size-4" />
          </Button>
          <Button render={<Link href="/login" />} size="lg" variant="outline" className="h-11 w-full px-6 sm:w-auto">
            Log in
          </Button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Check className="size-4 text-primary" /> Free to start</span>
          <span className="flex items-center gap-1.5"><Check className="size-4 text-primary" /> No card required</span>
        </div>

        {/* Product preview */}
        <div className="mx-auto mt-16 max-w-md">
          <Preview />
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Three taps, start to finish</h2>
            <p className="mt-3 text-muted-foreground">From the moment you give to the year you close out clean.</p>
          </div>
          <ol className="mt-14 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-border bg-card p-6 text-left">
                <span className="absolute right-5 top-5 text-sm font-semibold tabular-nums text-muted-foreground/50">
                  0{i + 1}
                </span>
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-medium">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Espees explainer ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Gem className="size-3.5" /> What are Espees?
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">
              See the weight of what you sow.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Espees is the Kingdom&apos;s impact currency. As you record each gift, Kingdom Steward
              converts your Naira into Espees automatically — turning a number in an account into a
              measure of Kingdom impact you can watch grow across the year.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Automatic, real-time conversion on every entry",
                "One clear running total across all your giving",
                "Nothing to calculate — the ledger does the maths",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">Your Espees balance</p>
            <p className="mt-3 flex items-baseline justify-center gap-2 text-5xl font-semibold tracking-tight tabular-nums">
              <CountUp to={604} separator="," duration={1.6} />
              <span className="text-2xl font-medium text-muted-foreground">Esp</span>
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="tabular-nums">₦1,240,000</span>
              <ArrowRight className="size-4 text-primary" />
              <span className="tabular-nums text-foreground">604 Esp</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Everything a steward needs</h2>
            <p className="mt-3 text-muted-foreground">Simple to use, quietly powerful. Nothing you don&apos;t need.</p>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="mx-auto max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
            Start keeping your ledger today.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Give, and it will be given to you — a good measure, pressed down and running over.
          </p>
          <Button render={<Link href="/signup" />} size="lg" className="mt-8 h-11 px-6">
            Create your account <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 Kingdom Steward</span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="transition-colors hover:text-foreground">Log in</Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Product preview — a quiet summary card that mirrors the real dashboard */
function Preview() {
  const bars = [
    { m: "Jan", h: 38 }, { m: "Feb", h: 55 }, { m: "Mar", h: 44 },
    { m: "Apr", h: 68 }, { m: "May", h: 52 }, { m: "Jun", h: 82 },
  ];
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-left shadow-[0_24px_60px_-30px_rgba(50,30,120,0.35)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total given this year</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            ₦<CountUp to={1240000} separator="," duration={1.8} />
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <ArrowUpRight className="size-3" /> +18%
        </span>
      </div>

      {/* chart */}
      <div className="mt-8">
        <div className="flex h-32 items-end gap-2.5">
          {bars.map((b, i) => (
            <div
              key={b.m}
              className={`flex-1 rounded-lg transition-all ${i === bars.length - 1 ? "bg-primary" : "bg-primary/15"}`}
              style={{ height: `${b.h}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-2.5">
          {bars.map((b, i) => (
            <span
              key={b.m}
              className={`flex-1 text-center text-[11px] tabular-nums ${i === bars.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
            >
              {b.m}
            </span>
          ))}
        </div>
      </div>

      {/* stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Gem className="size-3.5 text-primary" /> Espees value
          </span>
          <p className="mt-1.5 text-lg font-semibold tabular-nums">604 Esp</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5 text-primary" /> Pledge redeemed
          </span>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15">
              <div className="h-full rounded-full bg-primary" style={{ width: "72%" }} />
            </div>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">72%</span>
          </div>
        </div>
      </div>

      {/* footer row */}
      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <Wallet className="size-3.5 text-primary" />
        <span>Next pledge due in 12 days</span>
      </div>
    </div>
  );
}
