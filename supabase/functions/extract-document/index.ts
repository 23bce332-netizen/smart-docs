import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const { fileName, fileType, fileBase64 } = await req.json();

    const prompt = `You are an AI that extracts product and warranty information from documents.
Extract the following if possible:
- product_name: the product or item name
- purchase_date: in YYYY-MM-DD format
- warranty_duration: in months (integer)

Return ONLY valid JSON with these three fields. If you cannot determine a field, use null.`;

    const parts: any[] = [{ text: prompt }];

    if (fileBase64 && fileType) {
      // Send the actual file to Gemini's vision model
      parts.push({
        inline_data: {
          mime_type: fileType,
          data: fileBase64,
        },
      });
    } else {
      // Fallback: use file name hints
      parts.push({ text: `Document file name: "${fileName}", type: "${fileType}". Extract what you can from the name.` });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
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
