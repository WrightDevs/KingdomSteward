# Kingdom Steward — System Architecture and Features

## 1. System Architecture Overview

Kingdom Steward is built using a modern, lightweight, "no-build" architecture. It completely avoids complex frontend frameworks (like React or Next.js) and build tools (like Webpack or Vite) in favor of Vanilla web technologies paired with a powerful Backend-as-a-Service (BaaS).

### Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Backend & Database:** Supabase (PostgreSQL).
- **Authentication:** Supabase Auth (Email/Password).
- **Hosting:** Vercel (Static Deployment).
- **Data Visualization & Assets:** Chart.js (CDN), Lucide Icons (CDN), Google Fonts.

### Why this Architecture?
- **Speed & Simplicity:** Zero compilation time. You can open any HTML file directly in the browser to test, and deployments take seconds.
- **Security:** The database is secured at the lowest level using PostgreSQL Row Level Security (RLS) policies, meaning the frontend can safely interact with the database directly.
- **Modularity:** Separation of concerns is maintained through highly modular JavaScript files and CSS stylesheets without needing a bundler.

---

## 2. Core Features

### User Authentication & Profiles
- **Secure Login/Signup:** Powered natively by Supabase Auth.
- **Extended Profiles:** Users provide their Title, Zone, and Church during registration. This localized metadata is essential for accurate data matching in the Leader Dashboard.

### Personal Dashboard & Giving Tracking
- **Espees Conversion:** Real-time conversion of Naira (NGN) to Espees (Esp) based on a fixed rate configuration (1 Esp = 2050 NGN).
- **Statistical Analytics:** Displays total monthly giving, yearly giving, Espees value, and consistency streaks in visually appealing metric cards.
- **Data Visualization:** Integrated Chart.js displays a 6-month historical giving bar chart.

### Entry Logging & History
- **Log Giving:** Users can input amount, type (e.g., Tithe, Offering, First Fruit, Rhapsody of Realities, InnerCity Missions, etc.), date, and notes.
- **Live Preview:** As users type an amount, the exact Espees equivalent is shown dynamically on the screen.
- **History Management:** Full historical ledger of all giving with the ability to filter by giving type and delete erroneous entries.

### Pledges & Partial Redemptions
- **Pledge Tracking:** Users can make a financial pledge toward a specific goal or ministry arm.
- **Partial Payments (Glassmorphism UI):** Users can fulfill their pledges in installments using a premium Glassmorphism modal interface. The system tracks the target amount, amount paid, and remaining balance dynamically.
- **Visual Progress:** Progress bars clearly display the completion percentage of each pledge.

### Leader Dashboard
- **Role-Based Access Control (RBAC):** Authorized leaders can access a specialized administrative dashboard.
- **Aggregated Analytics:** Leaders can view the total giving, total pledges, and overall consistency of members specifically within their assigned Zone or Church.
- **RLS Security:** Supabase RLS policies guarantee that a leader can *only* see aggregated data for users matching their exact Zone/Church. They cannot view data across other zones.

### Export & Reporting
- **PDF Report Generation:** Users can generate and download their giving reports and pledge statuses formatted cleanly as PDFs for personal records.

---

## 3. Directory & File Structure

```text
kingdom-steward/
├── index.html              # Landing page
├── login.html              # User login
├── signup.html             # User registration
├── dashboard.html          # Main member dashboard
├── give.html               # Form to log a new giving entry
├── history.html            # Full giving ledger & filters
├── pledges.html            # Pledges & partial payment tracking
├── leader-dashboard.html   # Aggregated view for Zone/Church leaders
├── profile.html            # User settings & profile updates
│
├── css/                    # Modular stylesheets
│   ├── main.css            # CSS variables, typography, reset
│   ├── components.css      # Reusable UI (buttons, cards, forms)
│   ├── auth.css            # Login/Signup specific styles
│   ├── dashboard.css       # Layouts for stats and charts
│   └── animations.css      # Keyframes and transitions
│
├── js/                     # Modular JavaScript
│   ├── config.js           # Environment variables (Supabase Keys, Espees Rate)
│   ├── supabase-client.js  # Initializes Supabase instance
│   ├── auth.js             # Handles auth state and session checking
│   ├── giving.js           # CRUD operations for giving entries
│   ├── espees.js           # Math utilities for currency conversion
│   ├── dashboard.js        # Logic for stat calculation and Chart.js
│   └── zones.js            # Configuration mapping Zones to Churches
│
├── supabase/               # SQL migrations and schema definitions
│   ├── supabase_schema.sql          # Core tables (profiles, giving_entries)
│   ├── supabase_pledges.sql         # Pledges schema
│   ├── supabase_partial_pledges.sql # Partial payments schema
│   └── supabase_leaders.sql         # Leader roles & RLS policies
│
└── vercel.json             # Vercel configuration for clean routing
```

---

## 4. Database Schema Overview

The Supabase PostgreSQL database consists of several core tables, all secured via Row Level Security (RLS).

1. **`auth.users` (Supabase Native):** Handles core identity, passwords, and user sessions.
2. **`profiles`:** Tied 1:1 with `auth.users`. Stores `full_name`, `title`, `zone`, and `church`. A trigger automatically creates a profile when a new user signs up.
3. **`giving_entries`:** Stores the individual financial contributions. Includes `amount`, `type`, `date`, and `notes`. RLS ensures regular users can only Select/Insert/Update/Delete their own entries.
4. **`pledges`:** Stores user commitments. Tracks `target_amount`, `status`, and `type`.
5. **`pledge_payments`:** Links to a specific pledge. Stores the `amount_paid` and `date` for partial redemptions.
6. **`leader_roles` (Implicit/Explicit):** Manages which profiles have elevated read privileges for their specific `zone` or `church`.

---

## 5. Application Data Flow

1. **Client-Side Compute:** Because the scale of individual giving entries is manageable in the browser, data operations (like calculating the "Streak" or summarizing "This Month") are fetched raw from Supabase and computed instantly in the browser via JavaScript (`dashboard.js`).
2. **Security Edge:** The `SUPABASE_ANON_KEY` is public. Security is completely enforced by PostgreSQL RLS. If a user tries to query `giving_entries` from the browser console, the database will only return rows where `auth.uid() = user_id`.
3. **Deployment:** Pushing code to GitHub triggers a Vercel webhook. Vercel serves the static HTML/CSS/JS files directly on a global CDN.
