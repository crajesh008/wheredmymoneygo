import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Expense } from '@/hooks/useExpenses';
import { CategoryBudgets } from '@/hooks/useBudget';
import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface BudgetTrackerProps {
  expenses: Expense[];
  monthlyBudget: number;
  categoryBudgets: CategoryBudgets;
  onBudgetUpdate: (newBudget: number) => void;
  onCategoryBudgetsUpdate: (newCategoryBudgets: CategoryBudgets) => void;
}

export const BudgetTracker = ({ 
  expenses, 
  monthlyBudget, 
  categoryBudgets,
  onBudgetUpdate,
  onCategoryBudgetsUpdate 
}: BudgetTrackerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [categoryInputs, setCategoryInputs] = useState<CategoryBudgets>(categoryBudgets);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthTotal = expenses
    .filter((exp) => new Date(exp.date) >= startOfMonth)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = expenses
    .filter((exp) => new Date(exp.date) >= startOfMonth)
    .reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

  const remaining = monthlyBudget - monthTotal;
  const percentUsed = (monthTotal / monthlyBudget) * 100;

  const handleSave = () => {
    const newBudget = Number(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      onBudgetUpdate(newBudget);
      setIsEditing(false);
    }
  };

  const handleSaveCategoryBudgets = () => {
    onCategoryBudgetsUpdate(categoryInputs);
    setShowCategories(false);
  };

  const categories: (keyof CategoryBudgets)[] = ['Food', 'Travel', 'Shopping', 'Rent', 'Other'];
  const categoryEmojis = {
    Food: '🍔',
    Travel: '✈️',
    Shopping: '🛍️',
    Rent: '🏠',
    Other: '📦',
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

            {/* Category Budgets Section */}
            <div className="border-t border-border pt-4 mt-4">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
                onClick={() => setShowCategories(!showCategories)}
              >
                <span className="text-sm font-medium">Category Budgets</span>
                {showCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showCategories && (
                <div className="mt-4 space-y-3">
                  {categories.map((cat) => {
                    const spent = categoryTotals[cat] || 0;
                    const budget = categoryBudgets[cat] || 0;
                    const percent = budget > 0 ? (spent / budget) * 100 : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {categoryEmojis[cat]} {cat}
                          </span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={categoryInputs[cat]}
                              onChange={(e) => setCategoryInputs({
                                ...categoryInputs,
                                [cat]: Number(e.target.value)
                              })}
                              className="w-20 h-7 text-xs"
                              placeholder="0"
                            />
                            <span className="text-xs text-muted-foreground">
                              ${spent.toFixed(0)} spent
                            </span>
                          </div>
                        </div>
                        {budget > 0 && (
                          <Progress 
                            value={Math.min(percent, 100)} 
                            className="h-1.5"
                          />
                        )}
                      </div>
                    );
                  })}
                  <Button 
                    onClick={handleSaveCategoryBudgets} 
                    size="sm" 
                    className="w-full mt-2"
                  >
                    Save Category Budgets
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
