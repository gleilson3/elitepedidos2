/*
  # Create PDV2 Operators Table

  1. New Tables
    - `pdv2_operators`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, unique, not null)
      - `password_hash` (text, not null)
      - `is_active` (boolean, default true)
      - `permissions` (jsonb, default empty object)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp, nullable)

  2. Security
    - Enable RLS on `pdv2_operators` table
    - Add policy for all operations (public access for PDV system)

  3. Indexes
    - Index on code for login lookups
    - Index on is_active for filtering active operators
*/

CREATE TABLE IF NOT EXISTS pdv2_operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  permissions jsonb DEFAULT '{
    "can_cancel": false,
    "can_discount": false,
    "can_use_scale": false,
    "can_view_sales": false,
    "can_view_orders": false,
    "can_view_reports": false,
    "can_view_products": false,
    "can_view_operators": false,
    "can_manage_products": false,
    "can_manage_settings": false,
    "can_view_attendance": false,
    "can_view_cash_report": false,
    "can_view_sales_report": false,
    "can_view_cash_register": false
  }'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  last_login timestamp with time zone
);

-- Enable RLS
ALTER TABLE pdv2_operators ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on pdv2_operators"
  ON pdv2_operators
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pdv2_operators_code ON pdv2_operators(code);
CREATE INDEX IF NOT EXISTS idx_pdv2_operators_active ON pdv2_operators(is_active);
CREATE INDEX IF NOT EXISTS idx_pdv2_operators_name ON pdv2_operators(name);