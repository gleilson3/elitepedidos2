/*
  # Add display_order column to store2_products

  1. Changes
    - Add `display_order` column to `store2_products` table
    - Set default value to 1 for consistency with pdv_products table
    - Update existing records to have display_order = 1

  2. Notes
    - This column is used for custom product ordering in the interface
    - Follows the same pattern as the pdv_products table
*/

-- Add display_order column to store2_products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store2_products' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE store2_products ADD COLUMN display_order integer DEFAULT 1;
  END IF;
END $$;

-- Update existing records to have display_order = 1
UPDATE store2_products 
SET display_order = 1 
WHERE display_order IS NULL;

-- Create index for better performance on ordering
CREATE INDEX IF NOT EXISTS idx_store2_products_display_order 
ON store2_products USING btree (display_order);