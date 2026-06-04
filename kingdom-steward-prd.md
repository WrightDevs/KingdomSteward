# Kingdom Steward — Production PRD (Reworked)
### Tagline: Track your giving. See your impact in Espees.

---

## 1. Project Overview

**Product Name:** Kingdom Steward  
**Stack:** Vanilla HTML + CSS + JavaScript · Supabase (Auth + PostgreSQL) · Vercel  
**Timeline:** 2 days (one developer, no build tooling overhead)  
**Demo Target:** Qubator AI Foundry demo day

### Core User Story
A Loveworld member opens the app, signs up with their email, logs their tithe amount in Naira, and immediately sees their Espees equivalent on their personal dashboard — along with a running history of their giving consistency.

### MVP Scope

| IN (Ship in 2 days) | OUT (Version 2) |
|---|---|
| Email + password auth | Google OAuth |
| Log giving entry (amount, type, date, notes) | Payment processing |
| Live Espees preview while typing | Email receipts |
| Personal dashboard (monthly, yearly, streak, Espees total) | Leadership/admin dashboard |
| Giving history with type filter + delete | CSV export |
| Landing page | Real-time updates |
| Responsive mobile-first UI | Multi-currency support |
| CSS animations + micro-interactions | Push notifications |

### Success Metric for Demo
A user signs up, logs a tithe, and sees their Espees value — in under 60 seconds. That's the demo. Everything else is supporting cast.

---

## 2. Tech Stack (Locked)

| Category | Choice | Reason |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Your stack — zero config, ships fast |
| Auth + Database | Supabase | One tool handles both, RLS handles security |
| Charts | Chart.js (CDN) | One `<script>` tag, clean bar charts |
| Icons | Lucide Icons (CDN) | One `<script>` tag, consistent SVG icons |
| Fonts | Google Fonts (CDN) | No install needed |
| Deployment | Vercel | Static hosting, GitHub auto-deploy |

No npm. No build step. No TypeScript. No framework. Open the folder, write code, push to GitHub, done.

---

## 3. Folder Structure

```
kingdom-steward/
├── index.html              # Landing page
├── login.html              # Login
├── signup.html             # Signup
├── dashboard.html          # Main dashboard
├── give.html               # Log a giving entry
├── history.html            # Full giving history
│
├── css/
│   ├── main.css            # CSS variables, reset, typography, layout
│   ├── components.css      # Navbar, buttons, cards, toast, forms
│   ├── auth.css            # Login + signup page styles
│   ├── dashboard.css       # Stat cards, chart, recent entries
│   └── animations.css      # @keyframes, transitions, hover states
│
├── js/
│   ├── config.js           # Supabase credentials + Espees rate constant
│   ├── supabase-client.js  # Supabase client init, export `supabase`
│   ├── auth.js             # signup(), login(), logout(), requireAuth()
│   ├── giving.js           # createGiving(), getGivings(), deleteGiving()
│   ├── espees.js           # ngnToEspees(), formatEspees() — pure math
│   ├── dashboard.js        # computeStats(), renderCards(), renderChart()
│   └── history.js          # renderHistory(), filter logic
│
├── assets/
│   └── logo.svg
│
├── vercel.json             # Clean URL routing
└── README.md
```

---

## 4. Config File (No Build Step Needed)

Supabase's anon key is a **public key** — it is designed to exist in client-side code. Security is enforced entirely by RLS policies on the database, not by hiding this key. This is the standard Supabase pattern.

```javascript
// js/config.js
const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key',
  ESPEES_RATE: 2050  // 1 Espees = 2050 NGN (fixed rate)
};
```

Add `config.js` to `.gitignore` before pushing to a public GitHub repo.

---

## 5. Database Schema

Run this entire block in the Supabase SQL Editor. Nothing changes from the original architecture — it was solid.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Giving entries
CREATE TABLE giving_entries (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount     DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type       VARCHAR(20) NOT NULL CHECK (type IN ('tithe','offering','first_fruit','seed','other')),
  notes      TEXT,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_giving_user_date ON giving_entries(user_id, date DESC);
CREATE INDEX idx_giving_user_type ON giving_entries(user_id, type);

-- RLS
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Own giving select"  ON giving_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own giving insert"  ON giving_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own giving update"  ON giving_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own giving delete"  ON giving_entries FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 6. JS Module Responsibilities

### config.js
Holds credentials and the Espees rate constant. Loaded first on every page via `<script>` tag.

### supabase-client.js
```javascript
const { createClient } = supabase; // from CDN
const db = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
```
Exports `db`. Every other module imports this one instance.

### auth.js
```javascript
async function signUp(email, password, fullName) { ... }
async function signIn(email, password) { ... }
async function signOut() { ... }
async function getSession() { ... }

// Call this at the top of every protected page
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) window.location.href = '/login.html';
  return session;
}
```

### giving.js
```javascript
async function createGiving({ amount, type, date, notes }) {
  const { data: { session } } = await db.auth.getSession();
  return await db.from('giving_entries').insert({
    user_id: session.user.id,
    amount, type, date, notes
  });
}

async function getGivings({ startDate, endDate, type } = {}) {
  let query = db.from('giving_entries')
    .select('*')
    .order('date', { ascending: false });
  if (startDate) query = query.gte('date', startDate);
  if (endDate)   query = query.lte('date', endDate);
  if (type)      query = query.eq('type', type);
  return await query;
}

async function deleteGiving(id) {
  return await db.from('giving_entries').delete().eq('id', id);
}
```

### espees.js — Corrected Math
The original PRD had `ESPEES_RATE=0.012` which is wrong. With 1 Espees = 2050 NGN, to convert NGN to Espees you divide by 2050 — not multiply by 0.012 (which would give values ~24x too high).

```javascript
function ngnToEspees(amountNGN) {
  return (amountNGN / CONFIG.ESPEES_RATE).toFixed(4);
}

function formatEspees(amountNGN) {
  const val = ngnToEspees(amountNGN);
  return `${Number(val).toLocaleString()} Esp`;
  // e.g. ₦5,000 → 2.4390 Esp
  // e.g. ₦100,000 → 48.7805 Esp
}
```

### dashboard.js
Pulls all entries for the current user, computes stats client-side, then renders. No API route needed — for the data volumes an MVP will ever have, client-side computation is instant.

```javascript
function computeStats(entries) {
  const now = new Date();
  const thisMonth = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisYear = entries.filter(e => new Date(e.date).getFullYear() === now.getFullYear());

  const totalMonth = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalYear  = thisYear.reduce((sum, e) => sum + Number(e.amount), 0);

  // Streak: count consecutive weeks with at least one entry
  const streak = computeWeekStreak(entries);

  return { totalMonth, totalYear, espeesYear: ngnToEspees(totalYear), streak, totalEntries: entries.length };
}
```

---

## 7. Page-by-Page Specifications

### index.html — Landing Page
Hero with tagline + 2 CTAs (Login / Sign Up). A 3-step "How it works" row. Brief description of Espees. Footer with product name. This is the first thing a judge sees — make it count.

### login.html / signup.html
Centered card, max-width 420px. Email + password. Signup adds a Full Name field. Inline error messages (no `alert()`). On success, redirect to `/dashboard.html`. On load, check if already logged in — if yes, skip to dashboard.

### dashboard.html
`requireAuth()` on load. Four stat cards in a 2×2 grid:
- **This Month** — total NGN given this month
- **This Year** — total NGN given this year
- **Espees Value** — yearly total converted to Espees (this is the hero number)
- **Streak** — consecutive weeks with at least one entry

Below cards: Chart.js bar chart showing giving by month for the last 6 months.
Below chart: 5 most recent giving entries as a clean table.

### give.html
`requireAuth()` on load. Single-purpose form: Amount (NGN), Type (tithe/offering/first fruit/seed/other), Date (defaults to today), Notes (optional). **The key interaction:** as the user types in the amount field, a live preview below the input updates in real time showing the Espees equivalent. This is the demo moment — make it visually prominent.

```javascript
amountInput.addEventListener('input', () => {
  const val = parseFloat(amountInput.value) || 0;
  espeesPreview.textContent = `≈ ${formatEspees(val)}`;
});
```

### history.html
`requireAuth()` on load. Full giving history, newest first. A type filter dropdown at the top. Each row: date, type badge, amount in NGN, Espees equivalent, delete button. Delete triggers a confirmation toast before executing.

---

## 8. Design System

```css
/* css/main.css */
:root {
  /* Colors */
  --clr-primary:       #059669;   /* Emerald 600 — trust, growth */
  --clr-primary-light: #d1fae5;   /* Emerald 100 */
  --clr-accent:        #f59e0b;   /* Amber 500 — Espees highlight */
  --clr-indigo:        #6366f1;   /* Indigo — spiritual accent */
  --clr-bg:            #f8fafc;   /* Slate 50 */
  --clr-surface:       #ffffff;
  --clr-text:          #0f172a;   /* Slate 900 */
  --clr-muted:         #64748b;   /* Slate 500 */
  --clr-border:        #e2e8f0;   /* Slate 200 */
  --clr-danger:        #ef4444;

  /* Spacing */
  --radius:  12px;
  --radius-sm: 8px;
  --shadow:  0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);

  /* Typography */
  --font-display: 'Instrument Serif', serif;  /* Import from Google Fonts */
  --font-body:    'DM Sans', sans-serif;       /* Import from Google Fonts */
}
```

### Animations (CSS only — no Framer Motion)
```css
/* css/animations.css */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes countUp {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.stat-card {
  animation: fadeSlideUp 0.4s ease both;
}
.stat-card:nth-child(1) { animation-delay: 0.05s; }
.stat-card:nth-child(2) { animation-delay: 0.10s; }
.stat-card:nth-child(3) { animation-delay: 0.15s; }
.stat-card:nth-child(4) { animation-delay: 0.20s; }

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  transition: var(--transition);
}
```

---

## 9. CDN Script Tags (Every Protected Page)
```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- Chart.js (dashboard only) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest"></script>

<!-- App scripts (order matters) -->
<script src="/js/config.js"></script>
<script src="/js/supabase-client.js"></script>
<script src="/js/auth.js"></script>
<script src="/js/espees.js"></script>
<script src="/js/giving.js"></script>
<script src="/js/dashboard.js"></script> <!-- page-specific last -->
```

---

## 10. Vercel Config

```json
// vercel.json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

`cleanUrls: true` makes `/dashboard.html` accessible as `/dashboard`. Cleaner URLs for the demo.

---

## 11. What Was Cut from the Original PRD (and Why)

| Removed | Reason |
|---|---|
| Next.js 14 App Router | Framework learning curve would consume all of Day 1 |
| TypeScript | Zero value for a 2-day demo, adds config overhead |
| React Hook Form + Zod | Native HTML5 validation + thin JS checks is sufficient |
| Framer Motion | CSS `@keyframes` + `transition` achieves 90% of the effect |
| Google OAuth | 2–4 hour Google Cloud setup with zero user-facing benefit for demo |
| shadcn/ui | Custom CSS variables ship faster when it's your own system |
| Multi-currency (USD/GBP/NGN) | NGN only. Espees conversion is NGN→Espees. One chain, zero edge cases |
| API routes (Next.js) | Client-side Supabase calls are simpler and equally fast for MVP scale |
| Recharts | Chart.js via CDN is one script tag, same visual result |

---

## 12. 2-Day Build Checklist

### Day 1 — Foundation, Auth, Core Giving

- [ ] Create GitHub repo + folder structure
- [ ] Write `config.js` with Supabase credentials + Espees rate
- [ ] Supabase: run SQL schema in editor
- [ ] Build `supabase-client.js`
- [ ] Build `auth.js` (signUp, signIn, signOut, requireAuth)
- [ ] Build `login.html` + `signup.html` with full CSS
- [ ] Build `components.css` (navbar, buttons, toast, form elements)
- [ ] Build `espees.js` (ngnToEspees, formatEspees)
- [ ] Build `giving.js` (createGiving, getGivings, deleteGiving)
- [ ] Build `give.html` with live Espees preview on amount input
- [ ] **Checkpoint:** user signs up → logs a tithe → sees Supabase row created

---

### Day 2 — Dashboard, History, Polish, Ship

- [ ] Build `dashboard.js` (computeStats, renderCards, renderChart)
- [ ] Build `dashboard.html` with 4 stat cards + Chart.js bar chart + recent entries
- [ ] Build `history.html` + `history.js` with type filter + delete
- [ ] Build `index.html` (landing page — hero, how it works, CTA)
- [ ] Write `animations.css` — staggered card reveal, hover states
- [ ] Full mobile responsive pass (test at 375px, 768px, 1280px)
- [ ] Add `vercel.json`
- [ ] Push to GitHub → connect to Vercel → deploy
- [ ] Run full demo flow: signup → log tithe → see dashboard → check history
- [ ] **Checkpoint:** complete flow under 60 seconds ✅

---

## 13. Demo Script (Day 2 Evening)

1. Open landing page — 5 seconds, read the tagline
2. Click Sign Up — fill in name, email, password — 15 seconds
3. Redirected to dashboard — empty state with CTA to give
4. Click "Log Giving" — enter ₦50,000, select Tithe, watch Espees preview update live
5. Submit — redirected to dashboard
6. Dashboard shows: ₦50,000 this month, ₦50,000 this year, **24.3902 Esp**, streak: 1 week
7. Click History — one row, clean table, Espees column visible
8. Done. Total elapsed: under 60 seconds.

That Espees number updating live while typing is the thing people will remember.

---

*Build it. Ship it. Let the numbers speak.*
