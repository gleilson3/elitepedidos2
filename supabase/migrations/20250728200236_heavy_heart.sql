/*
  # Fix Foreign Key Relationships for Table Sales

  1. Schema Updates
    - Add missing current_sale_id columns to tables
    - Create proper foreign key constraints
    - Update existing data to maintain consistency

  2. Tables Modified
    - `store1_tables` - Add current_sale_id foreign key
    - `store2_tables` - Add current_sale_id foreign key

  3. Foreign Key Constraints
    - Link tables to their current active sales
    - ON DELETE SET NULL to handle sale deletion gracefully
*/

-- Add current_sale_id column to store1_tables if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store1_tables' AND column_name = 'current_sale_id'
  ) THEN
    ALTER TABLE store1_tables ADD COLUMN current_sale_id uuid;
  END IF;
END $$;

-- Add current_sale_id column to store2_tables if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store2_tables' AND column_name = 'current_sale_id'
  ) THEN
    ALTER TABLE store2_tables ADD COLUMN current_sale_id uuid;
  END IF;
END $$;

-- Add foreign key constraint for store1_tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'store1_tables_current_sale_id_fkey'
  ) THEN
    ALTER TABLE store1_tables 
    ADD CONSTRAINT store1_tables_current_sale_id_fkey 
    FOREIGN KEY (current_sale_id) 
    REFERENCES store1_table_sales(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint for store2_tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'store2_tables_current_sale_id_fkey'
  ) THEN
    ALTER TABLE store2_tables 
    ADD CONSTRAINT store2_tables_current_sale_id_fkey 
    FOREIGN KEY (current_sale_id) 
    REFERENCES store2_table_sales(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store1_tables_current_sale_id 
ON store1_tables(current_sale_id) 
WHERE current_sale_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_store2_tables_current_sale_id 
ON store2_tables(current_sale_id) 
WHERE current_sale_id IS NOT NULL;

-- Update table status based on current sales
UPDATE store1_tables 
SET status = CASE 
  WHEN current_sale_id IS NOT NULL THEN 'ocupada'::table_status
  ELSE 'livre'::table_status
END;

UPDATE store2_tables 
SET status = CASE 
  WHEN current_sale_id IS NOT NULL THEN 'ocupada'::table_status
  ELSE 'livre'::table_status
END;