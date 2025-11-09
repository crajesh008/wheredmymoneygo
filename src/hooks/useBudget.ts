import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBudget = () => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .select('monthly_budget')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setMonthlyBudget(Number(data.monthly_budget));
    }
  };

  const updateBudget = async (newBudget: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('budgets')
      .upsert({
        user_id: user.id,
        monthly_budget: newBudget,
      }, {
        onConflict: 'user_id'
      });

    if (!error) {
      setMonthlyBudget(newBudget);
    }
  };

  return {
    monthlyBudget,
    updateBudget,
  };
};
