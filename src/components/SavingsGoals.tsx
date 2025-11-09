import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { Plus, Trash2, TrendingUp, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SavingsGoals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useSavingsGoals();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');

  const iconOptions = ['🎯', '🏠', '🚗', '✈️', '💰', '🎓', '💍', '🎮', '📱', '🎨'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !targetAmount || isNaN(Number(targetAmount))) return;

    const goalData = {
      name,
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount) || 0,
      deadline: deadline || undefined,
      icon
    };

    if (editingId) {
      await updateGoal(editingId, goalData);
      toast({ title: "Goal updated! 🎯" });
    } else {
      await addGoal(goalData);
      toast({ title: "Goal created! 🎯", description: `Saving for ${name}` });
    }

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setIcon('🎯');
    setEditingId(null);
  };

  const handleEdit = (goal: any) => {
    setEditingId(goal.id);
    setName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setCurrentAmount(goal.current_amount.toString());
    setDeadline(goal.deadline || '');
    setIcon(goal.icon);
    setOpen(true);
  };

  const handleAddContribution = async (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.current_amount + amount;
    await updateGoal(goalId, { current_amount: newAmount });
    
    if (newAmount >= goal.target_amount) {
      toast({ 
        title: "Goal achieved! 🎉", 
        description: `You've reached your ${goal.name} goal!` 
      });
    } else {
      toast({ title: "Contribution added! 💰" });
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Savings Goals 🎯</h3>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Goal' : 'Create Savings Goal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Icon</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {iconOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`text-2xl p-2 rounded border ${icon === emoji ? 'border-primary bg-primary/10' : 'border-border'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target-amount">Target Amount ($)</Label>
                <Input
                  id="target-amount"
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="current-amount">Current Amount ($)</Label>
                <Input
                  id="current-amount"
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Goal' : 'Create Goal'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No savings goals yet. Create one to start saving! 💰
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const remaining = goal.target_amount - goal.current_amount;

            return (
              <div key={goal.id} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.icon}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{goal.name}</h4>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(goal)}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${goal.current_amount.toFixed(2)} / ${goal.target_amount.toFixed(2)}
                    </span>
                    <span className={`font-medium ${progress >= 100 ? 'text-success' : 'text-foreground'}`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(progress, 100)} 
                    className={`h-2 ${progress >= 100 ? '[&>div]:bg-success' : ''}`}
                  />
                  {remaining > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Add contribution"
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = (e.target as HTMLInputElement).value;
                            if (value && !isNaN(Number(value))) {
                              handleAddContribution(goal.id, Number(value));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        ${remaining.toFixed(2)} left
                      </span>
                    </div>
                  )}
                  {progress >= 100 && (
                    <div className="text-sm p-2 rounded bg-success/10 text-success text-center font-medium">
                      🎉 Goal Achieved!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};