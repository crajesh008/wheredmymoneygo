import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGoals(data.map(goal => ({
        id: goal.id,
        name: goal.name,
        target_amount: Number(goal.target_amount),
        current_amount: Number(goal.current_amount),
        deadline: goal.deadline || undefined,
        icon: goal.icon || '🎯',
        created_at: goal.created_at,
        updated_at: goal.updated_at
      })));
    }
    setLoading(false);
  };

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        deadline: goal.deadline || null,
        icon: goal.icon
      })
      .select()
      .single();

    if (!error && data) {
      const newGoal: SavingsGoal = {
        id: data.id,
        name: data.name,
        target_amount: Number(data.target_amount),
        current_amount: Number(data.current_amount),
        deadline: data.deadline || undefined,
        icon: data.icon || '🎯',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setGoals([newGoal, ...goals]);
      return newGoal;
    }
    return null;
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const { error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setGoals(goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)));
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (!error) {
      setGoals(goals.filter((goal) => goal.id !== id));
    }
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
  };
};