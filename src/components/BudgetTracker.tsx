import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Expense } from '@/hooks/useExpenses';
import { useState } from 'react';
import { Settings } from 'lucide-react';

interface BudgetTrackerProps {
  expenses: Expense[];
  monthlyBudget: number;
  onBudgetUpdate: (newBudget: number) => void;
}

export const BudgetTracker = ({ expenses, monthlyBudget, onBudgetUpdate }: BudgetTrackerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthTotal = expenses
    .filter((exp) => new Date(exp.date) >= startOfMonth)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const remaining = monthlyBudget - monthTotal;
  const percentUsed = (monthTotal / monthlyBudget) * 100;

  const handleSave = () => {
    const newBudget = Number(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      onBudgetUpdate(newBudget);
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Monthly Budget 🎯</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="Enter budget"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1">Save</Button>
            <Button 
              onClick={() => {
                setIsEditing(false);
                setBudgetInput(monthlyBudget.toString());
              }} 
              size="sm" 
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Budget</span>
              <span className="text-2xl font-bold text-foreground">${monthlyBudget.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Spent</span>
              <span className="text-xl font-semibold text-foreground">${monthTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className={`text-xl font-semibold ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>
                ${Math.abs(remaining).toFixed(2)}
              </span>
            </div>

            <Progress value={Math.min(percentUsed, 100)} className="h-3" />

            {percentUsed > 90 && (
              <div className={`text-sm p-3 rounded-lg ${
                percentUsed >= 100 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-warning/10 text-warning-foreground'
              }`}>
                {percentUsed >= 100 
                  ? '⚠️ Budget exceeded! Time to review spending.'
                  : '⚡ Close to budget limit! Be mindful.'}
              </div>
            )}

            {percentUsed <= 50 && monthTotal > 0 && (
              <div className="text-sm p-3 rounded-lg bg-success/10 text-success">
                ✨ Great job! You're staying within budget.
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
