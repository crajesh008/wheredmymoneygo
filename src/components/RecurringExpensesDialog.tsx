import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRecurringExpenses, RecurringExpense } from '@/hooks/useRecurringExpenses';
import { Repeat, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const RecurringExpensesDialog = () => {
  const { recurringExpenses, addRecurringExpense, toggleRecurringExpense, deleteRecurringExpense } = useRecurringExpenses();
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food' as RecurringExpense['category'],
    note: '',
    frequency: 'monthly' as RecurringExpense['frequency'],
    start_date: new Date().toISOString().split('T')[0]
  });

  const calculateNextDate = (startDate: string, frequency: string): string => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    const nextDate = calculateNextDate(formData.start_date, formData.frequency);
    
    await addRecurringExpense({
      amount: parseFloat(formData.amount),
      category: formData.category,
      note: formData.note,
      frequency: formData.frequency,
      start_date: formData.start_date,
      next_date: nextDate,
      is_active: true
    });

    setFormData({
      amount: '',
      category: 'Food',
      note: '',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
    toast({ title: "Recurring expense added! 🔄" });
  };

  const frequencyLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Repeat className="w-4 h-4 mr-2" />
          Recurring
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recurring Expenses</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring Expense
            </Button>
          )}

          {showForm && (
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(v: any) => setFormData({ ...formData, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Note</Label>
                <Input
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="e.g., Netflix subscription"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">Save</Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {recurringExpenses.map((expense) => (
              <div key={expense.id} className="border border-border rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">{expense.category}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{frequencyLabels[expense.frequency]}</span>
                  </div>
                  {expense.note && <p className="text-sm text-muted-foreground">{expense.note}</p>}
                  <p className="text-xs text-muted-foreground">Next: {expense.next_date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={expense.is_active}
                    onCheckedChange={(checked) => toggleRecurringExpense(expense.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRecurringExpense(expense.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {recurringExpenses.length === 0 && !showForm && (
              <p className="text-center text-muted-foreground py-8">No recurring expenses yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
