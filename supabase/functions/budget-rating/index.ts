import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's expenses
    const { data: expenses } = await supabaseClient
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    // Fetch user's budget
    const { data: budget } = await supabaseClient
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!expenses || expenses.length === 0) {
      return new Response(JSON.stringify({ 
        rating: 'N/A',
        message: 'No expense data available yet. Start tracking your expenses to get insights!',
        score: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate monthly spending
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const monthlyBudget = budget?.monthly_budget || 0;

    // Prepare data for AI analysis
    const categorySpending: Record<string, number> = {};
    monthlyExpenses.forEach(exp => {
      categorySpending[exp.category] = (categorySpending[exp.category] || 0) + Number(exp.amount);
    });

    const prompt = `Analyze this user's budget adherence and provide a concise rating:

Monthly Budget: $${monthlyBudget.toFixed(2)}
Total Spent This Month: $${totalSpent.toFixed(2)}
Category Budgets: ${JSON.stringify(budget?.category_budgets || {})}
Actual Category Spending: ${JSON.stringify(categorySpending)}
Number of Expenses: ${monthlyExpenses.length}

Provide a rating from A+ to F and a brief personalized message (max 2 sentences) about their budget adherence. Be encouraging but honest.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful financial advisor. Provide ratings from A+ to F and brief, encouraging messages.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Calculate score (0-100)
    const budgetRatio = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    let score = 100;
    if (budgetRatio > 100) score = Math.max(0, 100 - (budgetRatio - 100));
    else score = 100 - (budgetRatio * 0.2);

    return new Response(JSON.stringify({ 
      rating: aiResponse,
      totalSpent,
      monthlyBudget,
      score: Math.round(score)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in budget-rating function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
