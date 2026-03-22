import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { fileName, fileType, fileBase64 } = await req.json();

    const systemPrompt = `You are an AI that extracts product and warranty information from documents.
Extract the following if possible:
- product_name: the product or item name
- purchase_date: in YYYY-MM-DD format
- warranty_duration: in months (integer)

Return ONLY valid JSON with these three fields. If you cannot determine a field, use null.`;

    const userContent: any[] = [];

    if (fileBase64 && fileType) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${fileType};base64,${fileBase64}` },
      });
      userContent.push({
        type: "text",
        text: `Extract product and warranty information from this document. File name: "${fileName}"`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `Document file name: "${fileName}", type: "${fileType}". Extract what you can from the name.`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "{}";
    const extracted = JSON.parse(text);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Extract error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
