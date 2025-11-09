import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SpendingTrendsProps {
  expenses: Expense[];
}

export const SpendingTrends = ({ expenses }: SpendingTrendsProps) => {
  const getWeeklyData = () => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekKey = `Week ${8 - i}`;
      weeks[weekKey] = 0;
    }

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const weeksDiff = Math.floor((now.getTime() - expDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksDiff >= 0 && weeksDiff < 8) {
        const weekKey = `Week ${8 - weeksDiff}`;
        weeks[weekKey] = (weeks[weekKey] || 0) + exp.amount;
      }
    });

    return Object.entries(weeks).map(([week, amount]) => ({
      week,
      amount: parseFloat(amount.toFixed(2))
    }));
  };

  const weeklyData = getWeeklyData();
  const currentWeek = weeklyData[weeklyData.length - 1]?.amount || 0;
  const previousWeek = weeklyData[weeklyData.length - 2]?.amount || 0;
  const percentChange = previousWeek > 0 ? ((currentWeek - previousWeek) / previousWeek) * 100 : 0;

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Spending Trends 📈</h3>
        <div className="flex items-center gap-2">
          {percentChange > 0 ? (
            <TrendingUp className="w-5 h-5 text-destructive" />
          ) : (
            <TrendingDown className="w-5 h-5 text-success" />
          )}
          <span className={`font-semibold ${percentChange > 0 ? 'text-destructive' : 'text-success'}`}>
            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Week-over-week comparison: ${currentWeek.toFixed(2)} this week vs ${previousWeek.toFixed(2)} last week
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="week" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
