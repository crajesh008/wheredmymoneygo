import { supabase } from '@/integrations/supabase/client';

const categories = ['Food', 'Travel', 'Shopping', 'Rent', 'Other'] as const;
const moods = ['Happy', 'Stressed', 'Bored', 'Neutral'] as const;

const notes = {
  Food: ['Lunch with friends', 'Groceries', 'Coffee', 'Dinner out', 'Breakfast'],
  Travel: ['Uber ride', 'Gas', 'Train ticket', 'Parking', 'Bus fare'],
  Shopping: ['New shoes', 'Clothing', 'Electronics', 'Books', 'Home decor'],
  Rent: ['Monthly rent', 'Utilities', 'Internet bill', 'Phone bill', 'Insurance'],
  Other: ['Gift', 'Donation', 'Subscription', 'Misc', 'Healthcare']
};

export const generateSampleData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const expenses = [];
  const now = new Date();
  
  // Generate expenses for the last 6 months
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 1);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    // 10-20 expenses per month
    const expensesInMonth = Math.floor(Math.random() * 11) + 10;
    
    for (let i = 0; i < expensesInMonth; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const expenseDate = new Date(date.getFullYear(), date.getMonth(), day);
      
      let amount: number;
      if (category === 'Rent') {
        amount = Math.random() * 500 + 800; // $800-$1300
      } else if (category === 'Food') {
        amount = Math.random() * 50 + 10; // $10-$60
      } else if (category === 'Travel') {
        amount = Math.random() * 100 + 20; // $20-$120
      } else if (category === 'Shopping') {
        amount = Math.random() * 200 + 30; // $30-$230
      } else {
        amount = Math.random() * 100 + 15; // $15-$115
      }
      
      const notesList = notes[category];
      const note = notesList[Math.floor(Math.random() * notesList.length)];
      
      expenses.push({
        user_id: user.id,
        amount: Math.round(amount * 100) / 100,
        category,
        mood,
        note,
        date: expenseDate.toISOString().split('T')[0],
        timestamp: expenseDate.getTime()
      });
    }
  }

  const { error } = await supabase
    .from('expenses')
    .insert(expenses);

  if (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }

  return expenses.length;
};