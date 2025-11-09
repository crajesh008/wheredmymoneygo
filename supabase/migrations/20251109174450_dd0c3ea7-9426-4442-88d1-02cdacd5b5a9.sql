-- Add title column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Expense';