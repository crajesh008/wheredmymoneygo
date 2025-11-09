-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Create RLS policies for receipts bucket
CREATE POLICY "Users can upload their own receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add receipt_url column to expenses table
ALTER TABLE expenses ADD COLUMN receipt_url text;

-- Create recurring_expenses table
CREATE TABLE recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  note text,
  frequency text NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  start_date date NOT NULL,
  next_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on recurring_expenses
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_expenses
CREATE POLICY "Users can view their own recurring expenses"
ON recurring_expenses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring expenses"
ON recurring_expenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring expenses"
ON recurring_expenses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring expenses"
ON recurring_expenses
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX idx_recurring_expenses_next_date ON recurring_expenses(next_date) WHERE is_active = true;