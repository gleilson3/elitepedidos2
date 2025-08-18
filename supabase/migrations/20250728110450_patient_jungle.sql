/*
  # Fix delivery_products RLS policy

  1. Security
    - Add INSERT policy for delivery_products table to allow product creation
    - Allow authenticated and anonymous users to insert products
    - This enables the admin panel to create new products

  2. Changes
    - Create policy "Allow insert for delivery_products" on delivery_products table
    - Grant INSERT permissions to public role
    - Ensure product creation works from the admin interface
*/

-- Add INSERT policy for delivery_products table
CREATE POLICY "Allow insert for delivery_products" 
ON delivery_products 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Also ensure UPDATE and DELETE policies exist for complete CRUD operations
CREATE POLICY "Allow update for delivery_products" 
ON delivery_products 
FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow delete for delivery_products" 
ON delivery_products 
FOR DELETE 
TO public 
USING (true);