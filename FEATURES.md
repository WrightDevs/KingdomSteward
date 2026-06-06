# Kingdom Steward: Feature Documentation

Kingdom Steward is a premium, progressive web application (PWA) designed to seamlessly track global kingdom investments, tithes, and offerings. Built on a modern tech stack (Vanilla JS, CSS, Supabase), it provides a native app feel alongside powerful data synchronization and automated reminders.

Below is a detailed breakdown of all platform features.

---

## 1. Offline Giving & Background Sync
The app is engineered to function flawlessly in low-connectivity environments using Service Workers and IndexedDB.

### How it works:
- **Offline Detection**: When a user attempts to log a giving entry without an active internet connection, the app intercepts the request instead of throwing an error.
- **Local Storage (IndexedDB)**: The giving payload (amount, type, date, notes) is securely written to the device's local database (`OfflineGivingManager`), flagged as `synced: false`, and timestamped.
- **Service Worker SyncManager**: The app registers a background sync event (`sync-giving`). 
- **Automatic Recovery**: The moment the device regains internet access (even if the browser is closed on supported Android devices), the Service Worker automatically flushes the queue, securely POSTing the data to Supabase and deleting the local cache. The user receives a native push notification: *"Your offline giving has been recorded!"*

---

## 2. Automated Pledge Reminders (Email & SMS)
To encourage consistency and ensure pledges are fulfilled, Kingdom Steward implements an automated reminder system based on pledge due dates.

### Reminder Schedule:
1. **7 Days Before Due Date**: 
   - *Purpose*: Gentle upcoming awareness.
   - *Message*: Reminds the user of the specific pledge purpose and the remaining balance.
2. **1 Day Before Due Date**: 
   - *Purpose*: Immediate action required.
   - *Message*: "Your pledge is due tomorrow. Complete your redemption now."
3. **1 Day Overdue**: 
   - *Purpose*: Graceful follow-up.
   - *Message*: "You missed a pledge deadline. You can still redeem your pledge today."

*(Note: The actual delivery of Email/SMS is typically handled via a Supabase Edge Function running a daily cron job (`pg_cron`) that queries the `pledges` table and triggers a service like Resend or Twilio).*

---

## 3. Pledge Management & Partial Redemptions
Users can make long-term financial commitments and track their progress over time.

- **Pledge Creation**: Users declare an expected amount, purpose, and deadline.
- **Partial Redemptions**: Instead of requiring the full amount at once, users can log partial payments (e.g., redeeming ₦50,000 towards a ₦200,000 pledge).
- **Visual Progress**: A dynamic progress bar calculates the percentage of the pledge fulfilled in real-time, automatically marking the pledge as "Completed" when the balance reaches zero.

---

## 4. Real-Time Dashboard & Analytics
The primary interface provides users with an instant snapshot of their kingdom impact.

- **Consistency Streak**: Tracks consecutive weeks of giving to gamify and encourage regular tithing.
- **Financial Aggregation**: Dynamically calculates "This Month" and "This Year" totals based on historical entries.
- **Espees Conversion**: Specific giving categories (like Rhapsody of Realities) are automatically converted into "Espees" (a specialized ministry currency) and highlighted prominently on the dashboard.
- **Data Visualization**: A Chart.js integration displays a 6-month historical bar chart, allowing users to visualize their giving trends.

---

## 5. Leader Dashboard (Role-Based Access)
Kingdom Steward supports hierarchical permissions to allow church administrators to view aggregated data.

- **Role-Based Security**: Supabase Row Level Security (RLS) policies ensure that regular users only see their own data, while users flagged as "Leaders" can query data matching their specific Zone or Church.
- **Zone/Church Filtering**: Leaders can filter total giving volumes by specific dates, ministries, and members within their jurisdiction.

---

## 6. Progressive Web App (PWA) Capabilities
Kingdom Steward behaves exactly like a native app downloaded from the App Store or Google Play.

- **Installable**: Users can "Add to Home Screen".
- **App Store Ready**: The `manifest.json` is perfectly configured with 192x192 and 512x512 maskable icons, screenshots, and native UI overlays, meeting all PWABuilder criteria for packaging into APK (Android) and IPA (iOS) files.
- **Native UI Polish**: The interface features edge-to-edge rendering, iOS translucent status bars, removal of browser chrome (address bars), and disabled pull-to-refresh for a strictly native feel.

---

## 7. Profile & Ministry Architecture
- **Ministry Details**: Users register under specific Zones and Local Churches, establishing a structured hierarchy for reporting.
- **Titles**: Supports comprehensive ministry titles (Brother, Sister, Pastor, Deacon, Cell Leader, Zonal Manager, etc.).
- **Account Management**: A modernized, card-based interface allows users to update their personal information seamlessly.

---

## 8. PDF Report Generation
For personal accounting or tax purposes, users can generate physical records of their digital giving.
- **Custom Generation**: Integrates with libraries (like `jspdf` or `html2pdf`) to capture a user's giving history, format it into a professional receipt with the Kingdom Steward logo, and download it directly to their device.
