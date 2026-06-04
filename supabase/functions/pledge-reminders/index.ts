import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// This Edge Function is designed to be run on a schedule (pg_cron) or via an external cron service.
// It checks for pending pledges that are due soon or overdue and sends an email reminder.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

serve(async (req) => {
  try {
    console.log("Checking for pledges due soon...");

    // 1. Calculate dates (e.g., exactly 7 days from now, and exactly yesterday for overdue)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const yesterdayStr = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];

    // 2. Fetch pledges due in exactly 7 days OR that just became overdue yesterday
    const { data: pledges, error } = await supabase
      .from('pledges')
      .select('*, profiles(full_name), auth_users:user_id(email)')
      .in('status', ['pending', 'partially_redeemed'])
      .or(`due_date.eq.${nextWeekStr},due_date.eq.${yesterdayStr}`);

    if (error) throw error;
    if (!pledges || pledges.length === 0) {
      return new Response(JSON.stringify({ message: "No pledges require reminders today." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${pledges.length} pledges needing reminders.`);

    // 3. Send Emails via Resend
    let emailsSent = 0;
    
    for (const pledge of pledges) {
      // Note: In a real Supabase setup, getting the user's email requires joining the auth.users table.
      // We assume you have a way to fetch the email, or you store email in the profiles table.
      // For this example, let's assume we have the email.
      const userEmail = "user@example.com"; // Replace with actual fetched email
      const userName = pledge.profiles?.full_name || "Steward";
      
      const isOverdue = new Date(pledge.due_date) < new Date();
      const subject = isOverdue 
        ? `Overdue Pledge Reminder: ${pledge.category.replace('_', ' ').toUpperCase()}`
        : `Upcoming Pledge Reminder: ${pledge.category.replace('_', ' ').toUpperCase()}`;
        
      const amountStr = `₦${Number(pledge.amount).toLocaleString()}`;
      
      const htmlBody = `
        <h2>Hello ${userName},</h2>
        <p>This is a gentle reminder regarding your kingdom investment pledge.</p>
        <p><strong>Category:</strong> ${pledge.category.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Amount:</strong> ${amountStr}</p>
        <p><strong>Status:</strong> <span style="color:${isOverdue ? 'red' : 'orange'}">${isOverdue ? 'OVERDUE' : 'DUE SOON'}</span></p>
        <br/>
        <p>You can redeem this pledge and log it in your Kingdom Steward dashboard.</p>
        <p>God bless you abundantly!</p>
      `;

      // Send via Resend API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Kingdom Steward <reminders@yourdomain.com>",
          to: userEmail,
          subject: subject,
          html: htmlBody,
        }),
      });

      if (res.ok) emailsSent++;
    }

    return new Response(JSON.stringify({ message: `Successfully sent ${emailsSent} reminders.` }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
})
