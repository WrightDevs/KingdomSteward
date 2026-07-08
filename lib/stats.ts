// lib/stats.ts — giving analytics (ported from old js/dashboard.js)

export interface Entry {
  amount: number | string;
  date: string;
  type?: string;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weekStart(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // back to Sunday
  return x.getTime();
}

// Consecutive weeks (ending this or last week) that have at least one entry.
export function computeWeekStreak(entries: Entry[]): number {
  if (!entries?.length) return 0;

  const weeks = new Set<number>();
  for (const e of entries) weeks.add(weekStart(new Date(e.date)));

  let expected = weekStart(new Date());
  if (!weeks.has(expected)) {
    if (weeks.has(expected - ONE_WEEK_MS)) expected -= ONE_WEEK_MS;
    else return 0;
  }

  let streak = 0;
  while (weeks.has(expected)) {
    streak++;
    expected -= ONE_WEEK_MS;
  }
  return streak;
}

export interface Stats {
  totalMonth: number;
  totalYear: number;
  streak: number;
  totalEntries: number;
}

export function computeStats(entries: Entry[]): Stats {
  const now = new Date();
  let totalMonth = 0;
  let totalYear = 0;
  for (const e of entries) {
    const d = new Date(e.date);
    const amt = Number(e.amount);
    if (d.getFullYear() === now.getFullYear()) {
      totalYear += amt;
      if (d.getMonth() === now.getMonth()) totalMonth += amt;
    }
  }
  return { totalMonth, totalYear, streak: computeWeekStreak(entries), totalEntries: entries.length };
}

// Last 6 months aggregated for the bar chart.
export function last6Months(entries: Entry[]): { labels: string[]; data: number[] } {
  const now = new Date();
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString("default", { month: "short" }));
    let total = 0;
    for (const e of entries) {
      const ed = new Date(e.date);
      if (ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()) total += Number(e.amount);
    }
    data.push(total);
  }
  return { labels, data };
}

// Highest-giving month across all entries.
export function peakMonth(entries: Entry[]): { label: string; amount: number } {
  const buckets = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, (buckets.get(key) || 0) + Number(e.amount));
  }
  let best = { label: "-", amount: 0 };
  for (const [key, amount] of buckets) {
    if (amount > best.amount) {
      const [y, m] = key.split("-").map(Number);
      const label = new Date(y, m, 1).toLocaleString("default", { month: "short", year: "numeric" });
      best = { label, amount };
    }
  }
  return best;
}

// Bronze/Silver/Gold/Platinum by yearly espees value.
export function impactTier(espeesYear: number): string {
  if (espeesYear > 100) return "Platinum";
  if (espeesYear > 50) return "Gold";
  if (espeesYear > 10) return "Silver";
  return "Bronze";
}
