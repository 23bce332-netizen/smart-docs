import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find untriggered reminders that are due
    const today = new Date().toISOString().split("T")[0];
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*, documents(*)")
      .eq("triggered", false)
      .lte("reminder_date", today);

    if (error) throw error;
    if (!reminders?.length) {
      return new Response(JSON.stringify({ message: "No reminders to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const reminder of reminders) {
      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(reminder.user_id);
      const email = userData?.user?.email;
      if (!email) continue;

      const productName = reminder.documents?.product_name || reminder.documents?.file_name || "your document";
      const expiryDate = reminder.documents?.expiry_date || "unknown";

      // Send email via Resend
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DocVault <onboarding@resend.dev>",
          to: [email],
          subject: `Warranty Reminder: ${productName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1d4ed8;">DocVault Warranty Reminder</h2>
              <p>This is a reminder about your warranty for <strong>${productName}</strong>.</p>
              <p>Expiry date: <strong>${expiryDate}</strong></p>
              <p>Please take action if needed before the warranty expires.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px;">Sent by DocVault - Smart Document & Warranty Manager</p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) {
        await supabase
          .from("reminders")
          .update({ triggered: true })
          .eq("id", reminder.id);
        sent++;
      }
    }

    return new Response(JSON.stringify({ message: `Processed ${sent} reminders` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Reminder error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
