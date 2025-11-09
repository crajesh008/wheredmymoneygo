import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';

interface SummaryCardsProps {
  expenses: Expense[];
}

export const SummaryCards = ({ expenses }: SummaryCardsProps) => {
  const now = new Date();
  const today = now.toDateString();
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayTotal = expenses
    .filter((exp) => new Date(exp.date).toDateString() === today)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const weekTotal = expenses
    .filter((exp) => new Date(exp.date) >= startOfWeek)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const monthTotal = expenses
    .filter((exp) => new Date(exp.date) >= startOfMonth)
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 shadow-card bg-gradient-to-br from-card to-muted border-border">
        <div className="text-sm text-muted-foreground mb-2">Today 📅</div>
        <div className="text-3xl font-bold text-foreground">${todayTotal.toFixed(2)}</div>
      </Card>

      <Card className="p-6 shadow-card bg-gradient-to-br from-card to-muted border-border">
        <div className="text-sm text-muted-foreground mb-2">This Week 📊</div>
        <div className="text-3xl font-bold text-foreground">${weekTotal.toFixed(2)}</div>
      </Card>

      <Card className="p-6 shadow-card bg-gradient-to-br from-card to-muted border-border">
        <div className="text-sm text-muted-foreground mb-2">This Month 💰</div>
        <div className="text-3xl font-bold text-foreground">${monthTotal.toFixed(2)}</div>
      </Card>
    </div>
  );
};
