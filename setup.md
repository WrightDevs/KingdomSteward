# Twilio & Splash Screen Setup Guide

This document outlines the steps required to finalize the setup of the Twilio SMS/Email reminder system and the new PWA splash screen.

## 1. Database Migration
Since we added SMS functionality, we need to store users' phone numbers.
1. Open your [Supabase Dashboard](https://app.supabase.com/).
2. Navigate to the **SQL Editor**.
3. Open and run the `supabase/add_phone_number.sql` script to add the `phone_number` column to the `profiles` table and update the auth trigger.

## 2. Twilio & SendGrid API Setup
You need to provide your Edge Function with the correct API credentials.
1. Go to **Supabase Dashboard > Project Settings > Edge Functions**.
2. Under "Secrets", add the following variables:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID.
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token.
   - `TWILIO_PHONE_NUMBER`: Your Twilio Sender Phone Number (e.g., `+1234567890`).
   - `SENDGRID_API_KEY`: Your SendGrid API Key for sending emails.
3. Deploy the updated function:
   ```bash
   supabase functions deploy pledge-reminders
   ```

## 3. Automating the Reminders (Cron Job)
To ensure reminders are sent automatically every day, set up a cron schedule using `pg_cron` in your Supabase SQL Editor:
```sql
select
  cron.schedule(
    'daily-pledge-reminders',
    '0 8 * * *', -- Runs every day at 8:00 AM UTC
    $$
    select net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/pledge-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) as request_id;
    $$
  );
```
*Note: Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` with your actual Supabase URL and Anon Key.*

## 4. PWA Splash Screen Validation
- The app now loads `index.html` as the Splash Screen by default. 
- The previous marketing landing page has been moved to `landing.html`.
- Test the signup flow (`/signup.html`) to verify that the newly added phone number field works properly and saves to the database.
