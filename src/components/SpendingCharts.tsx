import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

interface SpendingChartsProps {
  expenses: Expense[];
}

const COLORS = {
  Food: 'hsl(160 65% 45%)',
  Groceries: 'hsl(120 55% 50%)',
  Travel: 'hsl(200 70% 60%)',
  Transportation: 'hsl(220 60% 55%)',
  Shopping: 'hsl(280 65% 60%)',
  Entertainment: 'hsl(300 70% 65%)',
  Healthcare: 'hsl(340 60% 55%)',
  Utilities: 'hsl(180 50% 50%)',
  Education: 'hsl(260 60% 60%)',
  Rent: 'hsl(40 95% 55%)',
  Other: 'hsl(0 0% 60%)',
};

export const SpendingCharts = ({ expenses }: SpendingChartsProps) => {
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const allCategories = ['Food', 'Groceries', 'Travel', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Rent', 'Other'];

  // Category data
  const categoryData = allCategories.map(category => ({
    name: category,
    value: expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0)
  }));

  const visibleCategoryData = categoryData.filter(item => !hiddenCategories.has(item.name) && item.value > 0);

  const handleLegendClick = (category: string) => {
    setHiddenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Daily spending for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyData = last7Days.map((date) => {
    const dayExpenses = expenses.filter(
      (exp) => new Date(exp.date).toDateString() === date.toDateString()
    );
    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: total,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Spending by Category 🥧</h3>
        {visibleCategoryData.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {allCategories.map(category => {
                const isHidden = hiddenCategories.has(category);
                const hasData = categoryData.find(c => c.name === category)?.value || 0;
                return (
                  <button
                    key={category}
                    onClick={() => handleLegendClick(category)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                      isHidden 
                        ? "bg-muted/30 border-border/50 text-muted-foreground line-through opacity-50" 
                        : "border-border text-foreground hover:bg-muted/50",
                      !hasData && "opacity-40"
                    )}
                    style={{ 
                      backgroundColor: !isHidden && hasData ? `${COLORS[category as keyof typeof COLORS]}20` : undefined,
                      borderColor: !isHidden && hasData ? COLORS[category as keyof typeof COLORS] : undefined
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={visibleCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {visibleCategoryData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {categoryData.every(c => c.value === 0) ? 'No expenses yet. Start tracking!' : 'All categories hidden. Click a category above to show it.'}
          </div>
        )}
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Daily Spending (Last 7 Days) 📈</h3>
        {dailyData.some((d) => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Start adding expenses to see trends!
          </div>
        )}
      </Card>
    </div>
  );
};