import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SpendingChartsProps {
  expenses: Expense[];
}

const COLORS = {
  Food: 'hsl(160 65% 45%)',
  Travel: 'hsl(200 70% 60%)',
  Shopping: 'hsl(280 65% 60%)',
  Rent: 'hsl(40 95% 55%)',
  Other: 'hsl(0 0% 60%)',
};

export const SpendingCharts = ({ expenses }: SpendingChartsProps) => {
  // Category data
  const categoryData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

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
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expenses yet. Start tracking!
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
