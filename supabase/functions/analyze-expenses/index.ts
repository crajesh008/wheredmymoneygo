import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { expenses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a detailed analysis prompt
    const expenseSummary = expenses.map((e: any) => 
      `$${e.amount} on ${e.category} (${e.mood}) - ${e.note || 'no note'}`
    ).join('\n');

    const categoryTotals = expenses.reduce((acc: any, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const moodTotals = expenses.reduce((acc: any, e: any) => {
      acc[e.mood] = (acc[e.mood] || 0) + e.amount;
      return acc;
    }, {});

    const systemPrompt = `You are a mindful spending coach. Analyze expense data and provide personalized, actionable insights. 
    Focus on patterns between spending and emotional states. Be encouraging but honest. 
    Keep insights concise (2-3 sentences max) and actionable.`;

    const userPrompt = `Analyze these expenses and provide ONE key personalized insight:

Recent expenses:
${expenseSummary}

Category totals: ${JSON.stringify(categoryTotals)}
Mood when spending: ${JSON.stringify(moodTotals)}

Give a brief, personalized insight that helps them understand their spending patterns and emotional triggers.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Keep tracking your expenses mindfully!";

    return new Response(
      JSON.stringify({ insight }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-expenses error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
