# Kingdom Steward — App Structure & Product Roadmap

This document outlines the full structural architecture of the Kingdom Steward application, detailing the features currently available in the Minimum Viable Product (MVP) and the prospective features planned for the full production version.

---

## 1. Full Structure of the App

The application is built on a lightweight, highly efficient "no-build" architecture, maximizing speed and ease of deployment.

### **Frontend (Client-Side)**
* **Core Tech:** Vanilla HTML5, CSS3, JavaScript (ES6+). No frameworks (like React) or bundlers (like Webpack).
* **Styling System:** Modular CSS with distinct files for components (`components.css`), layout (`main.css`), animations (`animations.css`), and page-specific styles.
* **Libraries via CDN:** 
  * `Chart.js` for data visualization (bar charts on the dashboard).
  * `Lucide Icons` for crisp, scalable SVG iconography.
  * `Supabase JS Client` for connecting to the database.

### **Backend & Database (Server-Side)**
* **Platform:** Supabase (PostgreSQL).
* **Authentication:** Supabase Auth handling email/password sign-ups and session management.
* **Data Security:** PostgreSQL Row Level Security (RLS) ensures that all data queries are strictly scoped (users only see their own data; verified leaders only see data in their zone).
* **Schema:** Consists of `profiles`, `giving_entries`, `pledges`, and `pledge_payments` tables.

### **Deployment & Routing**
* **Host:** Vercel (Static Hosting).
* **Routing:** Clean URLs configured via `vercel.json`.
* **PWA Structure:** The root `/` (`index.html`) is a dynamic Splash Screen. The marketing overview is located at `/landing.html`.

---

## 2. What the MVP Has Currently (Shipped Features)

The current version of the application is a fully functional MVP designed for rapid data entry, visualization, and pledge tracking.

### 👤 Identity & Onboarding
* **Splash Screen:** A fast, animated PWA splash screen for returning and new users.
* **Secure Auth:** Email and password sign-up/login.
* **Extended Profiles:** Users register with their Full Name, Phone Number (for SMS), Title, Zone, and Local Church.

### 💰 Giving & Espees Conversion
* **Log Entries:** Users can log financial giving (Amount, Type, Date, Notes).
* **Live Espees Calculator:** As the user types their giving amount in Naira, the UI instantly calculates and previews the exact Espees equivalent (Fixed rate: 1 Esp = 2050 NGN).
* **Giving Ledger:** A complete history view where users can see all past entries, filter them by giving type (Tithe, First Fruit, etc.), and delete erroneous entries.

### 📊 Personal Dashboard
* **Metric Cards:** Displays "Total This Month," "Total This Year," "Total Espees Value," and "Giving Streak" (consecutive weeks of giving).
* **Visual Analytics:** A 6-month historical bar chart showing giving trends.

### 🎯 Pledges & Partial Redemptions
* **Pledge Creation:** Users can create a specific pledge (target amount, purpose, and deadline).
* **Installment Payments:** A premium, glassmorphism-styled interface allows users to record partial payments toward a pledge.
* **Progress Tracking:** Visual progress bars automatically update as partial redemptions are made.
* **Automated Reminders (Twilio):** A Supabase Edge Function runs daily to send SMS (via Twilio) and Email (via SendGrid) reminders for due and overdue pledges.

### 👥 Leader Capabilities (Basic)
* **Zonal Dashboard:** Users with leader titles can access a specialized dashboard that aggregates total giving and active pledges for members specifically within their Zone and Church.

---

## 3. What the Prospective Full Version Can Offer (V2 & Beyond)

The future roadmap focuses on enhancing security, introducing real financial transactions, and expanding accessibility.

### 🔒 Zero-Trust Security Architecture
* **Verified Leaders Table:** Moving away from self-selected titles, leaders will be provisioned by Super-Admins in a secure, backend-only `verified_leaders` table. This guarantees zero vulnerability or unauthorized access to zonal financial data globally.

### 💳 Real-Time Payment Integration
* **In-App Giving:** Integrating payment gateways (like Paystack, Flutterwave, or Stripe) so users can actually *make* their giving or pledge redemption directly through the app, rather than just logging it after the fact.

### 📄 Export & Automated Reporting
* **PDF/CSV Generation:** Allowing users and leaders to download automated, beautifully formatted PDF receipts, giving statements, or CSV data dumps for offline use.
* **Email Receipts:** Automatically emailing a branded receipt and Espees confirmation whenever a giving entry is logged.

### 🌍 Global Scale & Localization
* **Multi-Currency Support:** Allowing users to input giving in USD, GBP, EUR, ZAR, etc., and having the system use live or fixed exchange rates to accurately calculate the universal Espees value.
* **Social Logins:** Single Sign-On (SSO) via Google or Apple for frictionless onboarding.

### 🔔 Engagement & Retention
* **Push Notifications:** Reminders for upcoming pledge deadlines or encouraging messages to maintain a giving streak.
* **Gamification:** Earning digital badges or milestones for reaching certain Espees thresholds or maintaining long streaks.

### 📱 Native Mobile App
* **App Store Release:** Wrapping the progressive web app (PWA) into a native iOS and Android application (via React Native or Capacitor) for presence on the App Store and Google Play, enabling offline mode and native biometric login (FaceID/Fingerprint).
