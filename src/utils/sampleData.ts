import { supabase } from '@/integrations/supabase/client';

const categories = ['Food', 'Groceries', 'Travel', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Rent', 'Other'] as const;
const moods = ['Happy', 'Stressed', 'Bored', 'Neutral'] as const;

const expenseExamples = {
  Food: [
    { title: 'Dinner at Italian restaurant', amount: [40, 80] },
    { title: 'Sushi takeout', amount: [35, 60] },
    { title: 'Pizza delivery', amount: [20, 35] },
    { title: 'Morning coffee', amount: [4, 8] },
    { title: 'Lunch at food truck', amount: [12, 18] }
  ],
  Groceries: [
    { title: 'Weekly grocery shopping', amount: [80, 150] },
    { title: 'Farmers market produce', amount: [25, 50] },
    { title: 'Bulk items from Costco', amount: [100, 200] },
    { title: 'Quick store run', amount: [15, 30] },
    { title: 'Organic vegetables', amount: [20, 40] }
  ],
  Travel: [
    { title: 'Flight to New York', amount: [200, 500] },
    { title: 'Hotel booking', amount: [150, 300] },
    { title: 'Airbnb weekend getaway', amount: [180, 350] },
    { title: 'Train tickets', amount: [40, 80] },
    { title: 'Airport parking', amount: [25, 60] }
  ],
  Transportation: [
    { title: 'Uber to office', amount: [12, 25] },
    { title: 'Gas station fill-up', amount: [40, 70] },
    { title: 'Monthly metro pass', amount: [80, 120] },
    { title: 'Parking garage', amount: [15, 30] },
    { title: 'Car wash', amount: [10, 25] }
  ],
  Shopping: [
    { title: 'New running shoes', amount: [60, 140] },
    { title: 'Work clothes', amount: [50, 150] },
    { title: 'Electronics accessory', amount: [30, 100] },
    { title: 'Home decor items', amount: [40, 120] },
    { title: 'Book purchase', amount: [15, 35] }
  ],
  Entertainment: [
    { title: 'Movie tickets', amount: [20, 40] },
    { title: 'Concert tickets', amount: [60, 150] },
    { title: 'Streaming subscription', amount: [10, 20] },
    { title: 'Video game purchase', amount: [40, 70] },
    { title: 'Museum admission', amount: [15, 30] }
  ],
  Healthcare: [
    { title: 'Doctor visit copay', amount: [30, 60] },
    { title: 'Pharmacy prescription', amount: [15, 50] },
    { title: 'Dental cleaning', amount: [80, 150] },
    { title: 'Gym membership', amount: [40, 80] },
    { title: 'Vitamins and supplements', amount: [20, 45] }
  ],
  Utilities: [
    { title: 'Electricity bill', amount: [60, 120] },
    { title: 'Water bill', amount: [30, 60] },
    { title: 'Internet service', amount: [50, 90] },
    { title: 'Mobile phone bill', amount: [40, 80] },
    { title: 'Gas heating', amount: [50, 100] }
  ],
  Education: [
    { title: 'Online course subscription', amount: [30, 100] },
    { title: 'Textbook purchase', amount: [50, 150] },
    { title: 'Workshop registration', amount: [80, 200] },
    { title: 'Professional certification', amount: [200, 500] },
    { title: 'School supplies', amount: [25, 60] }
  ],
  Rent: [
    { title: 'Monthly rent payment', amount: [800, 1500] },
    { title: 'Security deposit', amount: [1000, 2000] },
    { title: 'Renters insurance', amount: [20, 50] },
    { title: 'HOA fees', amount: [100, 300] },
    { title: 'Storage unit rental', amount: [60, 150] }
  ],
  Other: [
    { title: 'Birthday gift', amount: [30, 80] },
    { title: 'Charity donation', amount: [25, 100] },
    { title: 'Pet supplies', amount: [30, 70] },
    { title: 'Hair salon', amount: [40, 100] },
    { title: 'Miscellaneous expense', amount: [15, 50] }
  ]
};

export const clearAndGenerateSampleData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Clear existing expenses
  await supabase
    .from('expenses')
    .delete()
    .eq('user_id', user.id);

  const expenses = [];
  const now = new Date();
  
  // Generate expenses for the last 6 months
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 1);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    // 12-20 expenses per month
    const expensesInMonth = Math.floor(Math.random() * 9) + 12;
    
    for (let i = 0; i < expensesInMonth; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const expenseDate = new Date(date.getFullYear(), date.getMonth(), day);
      
      const examples = expenseExamples[category];
      const example = examples[Math.floor(Math.random() * examples.length)];
      const [minAmount, maxAmount] = example.amount;
      const amount = Math.random() * (maxAmount - minAmount) + minAmount;
      
      expenses.push({
        user_id: user.id,
        title: example.title,
        amount: Math.round(amount * 100) / 100,
        category,
        mood,
        note: '',
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

export const generateSampleData = clearAndGenerateSampleData;