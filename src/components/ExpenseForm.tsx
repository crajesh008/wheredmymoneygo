import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
}

export const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food');
  const [mood, setMood] = useState<Expense['mood']>('Neutral');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount))) return;

    onSubmit({
      amount: Number(amount),
      category,
      mood,
      note,
      date: new Date().toISOString(),
    });

    setAmount('');
    setNote('');
  };

  return (
    <Card className="p-6 shadow-card bg-card">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Add Expense 💸</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="text-lg"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(val) => setCategory(val as Expense['category'])}>
            <SelectTrigger id="category">
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
          <Label htmlFor="mood">Mood at Purchase</Label>
          <Select value={mood} onValueChange={(val) => setMood(val as Expense['mood'])}>
            <SelectTrigger id="mood">
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
          <Label htmlFor="note">Add description (optional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why did you buy this?"
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full bg-gradient-mint text-lg py-6">
          Add Expense
        </Button>
      </form>
    </Card>
  );
};
