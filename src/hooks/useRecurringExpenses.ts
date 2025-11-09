import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RecurringExpense {
  id: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Shopping' | 'Rent' | 'Other';
  note: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  next_date: string;
  is_active: boolean;
}

export const useRecurringExpenses = () => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  const fetchRecurringExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('next_date', { ascending: true });

    if (!error && data) {
      setRecurringExpenses(data.map(exp => ({
        id: exp.id,
        amount: Number(exp.amount),
        category: exp.category as any,
        note: exp.note || '',
        frequency: exp.frequency as any,
        start_date: exp.start_date,
        next_date: exp.next_date,
        is_active: exp.is_active
      })));
    }
  };

  const addRecurringExpense = async (expense: Omit<RecurringExpense, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert({
        user_id: user.id,
        amount: expense.amount,
        category: expense.category,
        note: expense.note,
        frequency: expense.frequency,
        start_date: expense.start_date,
        next_date: expense.next_date,
        is_active: expense.is_active
      })
      .select()
      .single();

    if (!error && data) {
      const newExpense: RecurringExpense = {
        id: data.id,
        amount: Number(data.amount),
        category: data.category as any,
        note: data.note || '',
        frequency: data.frequency as any,
        start_date: data.start_date,
        next_date: data.next_date,
        is_active: data.is_active
      };
      setRecurringExpenses([...recurringExpenses, newExpense]);
      return newExpense;
    }
    return null;
  };

  const toggleRecurringExpense = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('recurring_expenses')
      .update({ is_active })
      .eq('id', id);

    if (!error) {
      setRecurringExpenses(recurringExpenses.map(exp => 
        exp.id === id ? { ...exp, is_active } : exp
      ));
    }
  };

  const deleteRecurringExpense = async (id: string) => {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id);

    if (!error) {
      setRecurringExpenses(recurringExpenses.filter(exp => exp.id !== id));
    }
  };

  return {
    recurringExpenses,
    addRecurringExpense,
    toggleRecurringExpense,
    deleteRecurringExpense,
    refreshRecurringExpenses: fetchRecurringExpenses
  };
};
