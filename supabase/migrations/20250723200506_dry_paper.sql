/*
  # Create PDV2 Cash Registers Table

  1. New Tables
    - `pdv2_cash_registers`
      - `id` (uuid, primary key)
      - `opening_amount` (numeric, not null)
      - `closing_amount` (numeric, nullable)
      - `difference` (numeric, nullable)
      - `opened_at` (timestamp, default now)
      - `closed_at` (timestamp, nullable)
      - `operator_id` (uuid, foreign key to pdv2_operators)
      - `store_id` (uuid, foreign key to stores)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `pdv2_cash_registers` table
    - Add policy for all operations (public access for PDV system)

  3. Indexes
    - Index on opened_at for date filtering
    - Index on closed_at for status filtering
    - Index on operator_id for operator reports
    - Index on store_id for store filtering
*/

CREATE TABLE IF NOT EXISTS pdv2_cash_registers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_amount numeric(10,2) NOT NULL,
  closing_amount numeric(10,2),
  difference numeric(10,2),
  opened_at timestamp with time zone DEFAULT now() NOT NULL,
  closed_at timestamp with time zone,
  operator_id uuid REFERENCES pdv2_operators(id),
  store_id uuid REFERENCES stores(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE pdv2_cash_registers ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on pdv2_cash_registers"
  ON pdv2_cash_registers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pdv2_cash_registers_opened_at ON pdv2_cash_registers(opened_at);
CREATE INDEX IF NOT EXISTS idx_pdv2_cash_registers_closed_at ON pdv2_cash_registers(closed_at);
CREATE INDEX IF NOT EXISTS idx_pdv2_cash_registers_operator_id ON pdv2_cash_registers(operator_id);
CREATE INDEX IF NOT EXISTS idx_pdv2_cash_registers_store_id ON pdv2_cash_registers(store_id);