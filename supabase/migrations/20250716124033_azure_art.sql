/*
  # Add cash_register_id to orders table

  1. New Columns
    - `cash_register_id` (uuid, nullable) - Links orders to cash registers
  
  2. Foreign Keys
    - Add foreign key constraint from orders.cash_register_id to pdv_cash_registers.id
    - Set ON DELETE SET NULL to handle cases where a cash register might be deleted
  
  3. Purpose
    - This allows tracking which cash register processed each order
    - Enables filtering orders by cash register for reporting and UI display
*/

-- Add cash_register_id column to orders table
ALTER TABLE public.orders
ADD COLUMN cash_register_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE public.orders
ADD CONSTRAINT orders_cash_register_id_fkey
FOREIGN KEY (cash_register_id) REFERENCES public.pdv_cash_registers(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_orders_cash_register_id ON public.orders(cash_register_id);