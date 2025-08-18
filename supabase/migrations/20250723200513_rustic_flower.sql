/*
  # Create PDV2 Cash Entries Table

  1. New Tables
    - `pdv2_cash_entries`
      - `id` (uuid, primary key)
      - `register_id` (uuid, foreign key to pdv2_cash_registers)
      - `type` (text, 'income' or 'expense')
      - `amount` (numeric, not null)
      - `description` (text, not null)
      - `payment_method` (text, not null)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `pdv2_cash_entries` table
    - Add policy for all operations (public access for PDV system)

  3. Constraints
    - Check constraint for type (income/expense)
    - Check constraint for positive amount

  4. Indexes
    - Index on register_id for cash register lookups
    - Index on type for filtering by entry type
    - Index on created_at for date filtering
*/

CREATE TABLE IF NOT EXISTS pdv2_cash_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id uuid REFERENCES pdv2_cash_registers(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text NOT NULL,
  payment_method text DEFAULT 'dinheiro' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE pdv2_cash_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on pdv2_cash_entries"
  ON pdv2_cash_entries
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add constraints
ALTER TABLE pdv2_cash_entries 
ADD CONSTRAINT pdv2_cash_entries_type_check 
CHECK (type IN ('income', 'expense'));

ALTER TABLE pdv2_cash_entries 
ADD CONSTRAINT pdv2_cash_entries_amount_check 
CHECK (amount > 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pdv2_cash_entries_register_id ON pdv2_cash_entries(register_id);
CREATE INDEX IF NOT EXISTS idx_pdv2_cash_entries_type ON pdv2_cash_entries(type);
CREATE INDEX IF NOT EXISTS idx_pdv2_cash_entries_created_at ON pdv2_cash_entries(created_at);