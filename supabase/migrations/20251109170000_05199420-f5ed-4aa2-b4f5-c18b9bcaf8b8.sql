-- Add category budgets to the budgets table
ALTER TABLE budgets ADD COLUMN category_budgets JSONB DEFAULT '{
  "Food": 0,
  "Travel": 0,
  "Shopping": 0,
  "Rent": 0,
  "Other": 0
}'::jsonb;