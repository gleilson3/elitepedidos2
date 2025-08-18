/*
  # Add weight column to store1_table_sale_items table

  1. Changes
    - Add `weight` column to `store1_table_sale_items` table
    - Column type: numeric(10,3) to match other weight columns in the system
    - Allow null values since existing records won't have this data
    - Add index for performance when querying by weight

  2. Notes
    - This resolves the "Could not find the 'weight' column" error
    - The column is added as nullable to avoid issues with existing data
    - Uses same precision as weight_kg column for consistency
*/

-- Add the missing weight column to store1_table_sale_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store1_table_sale_items' AND column_name = 'weight'
  ) THEN
    ALTER TABLE store1_table_sale_items ADD COLUMN weight numeric(10,3);
  END IF;
END $$;

-- Add index for performance when querying by weight
CREATE INDEX IF NOT EXISTS idx_store1_table_sale_items_weight 
ON store1_table_sale_items (weight) 
WHERE weight IS NOT NULL;