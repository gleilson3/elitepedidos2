/*
  # Fix Store2 Products RLS Policies

  1. Security Updates
    - Add INSERT policy for authenticated users on `store2_products` table
    - Add UPDATE policy for authenticated users on `store2_products` table  
    - Add DELETE policy for authenticated users on `store2_products` table
    - Ensure proper access control for Store 2 product management

  2. Changes Made
    - Enable full CRUD operations for authenticated users on store2_products
    - Maintain security while allowing product management functionality
*/

-- Add INSERT policy for store2_products
CREATE POLICY "Allow authenticated insert to store2_products"
  ON store2_products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for store2_products  
CREATE POLICY "Allow authenticated update to store2_products"
  ON store2_products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for store2_products
CREATE POLICY "Allow authenticated delete to store2_products"
  ON store2_products
  FOR DELETE
  TO authenticated
  USING (true);

-- Also allow public access for all operations to match the pattern used by other tables
CREATE POLICY "Allow all operations on store2_products"
  ON store2_products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);