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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Expense } from '@/hooks/useExpenses';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id' | 'timestamp'> & { receipt_url?: string }) => void;
}

export const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food');
  const [mood, setMood] = useState<Expense['mood']>('Neutral');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max size is 5MB", variant: "destructive" });
        return;
      }
      setReceipt(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!receipt) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = receipt.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('receipts')
      .upload(fileName, receipt);

    if (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", variant: "destructive" });
      return null;
    }

    const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount))) return;

    setIsUploading(true);
    const receipt_url = await uploadReceipt();

    onSubmit({
      amount: Number(amount),
      category,
      mood,
      note,
      date: date.toISOString(),
      receipt_url: receipt_url || undefined
    });

    setAmount('');
    setNote('');
    setDate(new Date());
    setReceipt(null);
    setReceiptPreview(null);
    setIsUploading(false);
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
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
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

        <div>
          <Label htmlFor="receipt">Receipt (optional)</Label>
          <div className="space-y-2">
            {receiptPreview ? (
              <div className="relative border border-border rounded-lg p-2">
                <img src={receiptPreview} alt="Receipt preview" className="max-h-32 rounded" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1"
                  onClick={() => {
                    setReceipt(null);
                    setReceiptPreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptChange}
                  className="hidden"
                />
                <Label htmlFor="receipt" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload receipt</span>
                </Label>
              </div>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-mint text-lg py-6"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Add Expense'}
        </Button>
      </form>
    </Card>
  );
};
