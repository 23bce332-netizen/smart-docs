import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { messages, userId } = await req.json();

    const { data: docs } = await supabase
      .from("documents")
      .select("product_name, purchase_date, expiry_date, warranty_duration, file_name")
      .eq("user_id", userId);

    const docsContext = docs?.length
      ? `User's documents:\n${docs.map((d: any) =>
          `- ${d.product_name || d.file_name}: purchased ${d.purchase_date || "unknown"}, expires ${d.expiry_date || "unknown"}, warranty ${d.warranty_duration || "unknown"} months`
        ).join("\n")}`
      : "User has no documents uploaded yet.";

    const systemPrompt = `You are DocVault AI Assistant. You help users manage their documents and warranties.
You have access to the user's document data:

${docsContext}

Answer questions about warranties, expiry dates, and document management. Be concise and helpful.`;

    const gatewayMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: gatewayMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content || "I couldn't process that. Please try again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chatbot error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
