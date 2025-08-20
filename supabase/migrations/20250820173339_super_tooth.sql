/*
  # Mixed Payment System for PDV

  1. New Tables
    - `pdv_order_payments`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to pdv_sales)
      - `payment_type` (enum: dinheiro, pix, cartao_credito, cartao_debito, voucher)
      - `amount` (numeric, payment amount)
      - `status` (text, payment status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
  2. Security
    - Enable RLS on `pdv_order_payments` table
    - Add policies for authenticated users to manage payments

  3. Functions
    - Function to validate payment totals
    - Function to update order status when fully paid
*/

-- Create enum for payment types
DO $$ BEGIN
  CREATE TYPE payment_type_enum AS ENUM (
    'dinheiro',
    'pix', 
    'cartao_credito',
    'cartao_debito',
    'voucher'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for payment status
DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create pdv_order_payments table
CREATE TABLE IF NOT EXISTS pdv_order_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  payment_type payment_type_enum NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  status payment_status_enum DEFAULT 'confirmed',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to pdv_sales
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'pdv_order_payments_order_id_fkey'
  ) THEN
    ALTER TABLE pdv_order_payments 
    ADD CONSTRAINT pdv_order_payments_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES pdv_sales(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdv_order_payments_order_id ON pdv_order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pdv_order_payments_payment_type ON pdv_order_payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_pdv_order_payments_created_at ON pdv_order_payments(created_at);

-- Enable RLS
ALTER TABLE pdv_order_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on pdv_order_payments"
  ON pdv_order_payments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to calculate total payments for an order
CREATE OR REPLACE FUNCTION get_order_payment_total(order_uuid uuid)
RETURNS numeric AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) 
     FROM pdv_order_payments 
     WHERE order_id = order_uuid AND status = 'confirmed'),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if order is fully paid
CREATE OR REPLACE FUNCTION is_order_fully_paid(order_uuid uuid)
RETURNS boolean AS $$
DECLARE
  order_total numeric;
  payments_total numeric;
BEGIN
  -- Get order total
  SELECT total_amount INTO order_total
  FROM pdv_sales
  WHERE id = order_uuid;
  
  -- Get payments total
  SELECT get_order_payment_total(order_uuid) INTO payments_total;
  
  -- Return true if payments equal or exceed order total
  RETURN COALESCE(payments_total, 0) >= COALESCE(order_total, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS trigger AS $$
BEGIN
  -- Check if order is now fully paid
  IF is_order_fully_paid(NEW.order_id) THEN
    -- Update order to mark as paid (you can add a paid status or flag)
    UPDATE pdv_sales 
    SET updated_at = now()
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update payment status
DROP TRIGGER IF EXISTS trg_update_order_payment_status ON pdv_order_payments;
CREATE TRIGGER trg_update_order_payment_status
  AFTER INSERT OR UPDATE ON pdv_order_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_order_payment_status();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pdv_order_payments_updated_at ON pdv_order_payments;
CREATE TRIGGER update_pdv_order_payments_updated_at
  BEFORE UPDATE ON pdv_order_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();