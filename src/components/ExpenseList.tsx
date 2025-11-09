import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expense } from '@/hooks/useExpenses';
import { Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
}

const getMoodEmoji = (mood: Expense['mood']) => {
  switch (mood) {
    case 'Happy': return '😊';
    case 'Stressed': return '😰';
    case 'Bored': return '😑';
    case 'Neutral': return '😐';
  }
};

const getCategoryEmoji = (category: Expense['category']) => {
  switch (category) {
    case 'Food': return '🍔';
    case 'Travel': return '✈️';
    case 'Shopping': return '🛍️';
    case 'Rent': return '🏠';
    case 'Other': return '📦';
  }
};

export const ExpenseList = ({ expenses, onDelete, onUpdate }: ExpenseListProps) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food');
  const [mood, setMood] = useState<Expense['mood']>('Neutral');
  const [note, setNote] = useState('');

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setMood(expense.mood);
    setNote(expense.note);
  };

  const handleSave = () => {
    if (editingExpense && amount && !isNaN(Number(amount))) {
      onUpdate(editingExpense.id, {
        amount: Number(amount),
        category,
        mood,
        note,
      });
      setEditingExpense(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="p-8 shadow-card text-center">
        <p className="text-muted-foreground text-lg">No expenses yet. Add your first one! 🎯</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Recent Expenses 📝</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{getCategoryEmoji(expense.category)}</span>
                  <span className="font-semibold text-foreground">${expense.amount.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{expense.category}</span>
                  <span className="text-xl">{getMoodEmoji(expense.mood)}</span>
                </div>
                {expense.note && (
                  <p className="text-sm text-muted-foreground italic">"{expense.note}"</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(expense.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(expense)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(expense.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Amount ($)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as Expense['category'])}>
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">🍔 Food</SelectItem>
                  <SelectItem value="Travel">✈️ Travel</SelectItem>
                  <SelectItem value="Shopping">🛍️ Shopping</SelectItem>
                  <SelectItem value="Rent">🏠 Rent</SelectItem>
                  <SelectItem value="Other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-mood">Mood</Label>
              <Select value={mood} onValueChange={(val) => setMood(val as Expense['mood'])}>
                <SelectTrigger id="edit-mood">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Happy">😊 Happy</SelectItem>
                  <SelectItem value="Stressed">😰 Stressed</SelectItem>
                  <SelectItem value="Bored">😑 Bored</SelectItem>
                  <SelectItem value="Neutral">😐 Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-note">Note</Label>
              <Textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">Save Changes</Button>
              <Button onClick={() => setEditingExpense(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
