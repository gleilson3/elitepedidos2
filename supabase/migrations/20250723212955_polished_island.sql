/*
  # Create complete Store 2 system tables

  1. New Tables
    - `store2_users` - Users for Store 2 with authentication and permissions
    - `store2_products` - Products catalog for Store 2
    - `store2_sales` - Sales transactions for Store 2
    - `store2_sale_items` - Individual items in each sale
    - `store2_printer_settings` - Printer configuration for Store 2

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (internal system)
    - Add indexes for performance

  3. Default Data
    - Insert default users (admin_loja2, loja2, relatorios2)
    - Insert sample products
    - Insert default printer settings
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create store2_users table
CREATE TABLE IF NOT EXISTS store2_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{
    "can_view_sales": true,
    "can_view_cash": false,
    "can_view_products": true,
    "can_view_reports": false,
    "can_manage_settings": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create store2_products table
CREATE TABLE IF NOT EXISTS store2_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'acai',
  is_weighable BOOLEAN DEFAULT FALSE,
  unit_price NUMERIC(10,2),
  price_per_gram NUMERIC(10,4),
  image_url TEXT,
  stock_quantity NUMERIC(10,3) DEFAULT 0,
  min_stock NUMERIC(10,3) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  barcode TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create store2_sales table
CREATE TABLE IF NOT EXISTS store2_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number SERIAL UNIQUE,
  operator_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  payment_details JSONB,
  change_amount NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID,
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  channel TEXT DEFAULT 'pdv',
  cash_register_id UUID
);

-- Create store2_sale_items table
CREATE TABLE IF NOT EXISTS store2_sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES store2_sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES store2_products(id),
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,3) DEFAULT 1,
  weight_kg NUMERIC(10,3),
  unit_price NUMERIC(10,2),
  price_per_gram NUMERIC(10,4),
  discount_amount NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create store2_printer_settings table
CREATE TABLE IF NOT EXISTS store2_printer_settings (
  id TEXT PRIMARY KEY DEFAULT 'loja2',
  auto_print_enabled BOOLEAN DEFAULT TRUE,
  printer_name TEXT DEFAULT 'Impressora Loja 2',
  paper_width INTEGER DEFAULT 80,
  font_size INTEGER DEFAULT 12,
  print_logo BOOLEAN DEFAULT TRUE,
  print_customer_copy BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE store2_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_printer_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (internal system)
CREATE POLICY "Allow all operations on store2_users"
  ON store2_users FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on store2_products"
  ON store2_products FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on store2_sales"
  ON store2_sales FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on store2_sale_items"
  ON store2_sale_items FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on store2_printer_settings"
  ON store2_printer_settings FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_store2_users_username ON store2_users(username);
CREATE INDEX IF NOT EXISTS idx_store2_users_active ON store2_users(is_active);
CREATE INDEX IF NOT EXISTS idx_store2_products_code ON store2_products(code);
CREATE INDEX IF NOT EXISTS idx_store2_products_active ON store2_products(is_active);
CREATE INDEX IF NOT EXISTS idx_store2_products_category ON store2_products(category);
CREATE INDEX IF NOT EXISTS idx_store2_sales_date ON store2_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_store2_sales_operator ON store2_sales(operator_id);
CREATE INDEX IF NOT EXISTS idx_store2_sale_items_sale ON store2_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_store2_sale_items_product ON store2_sale_items(product_id);

-- Insert default users
INSERT INTO store2_users (username, password_hash, name, role, permissions) VALUES
('admin_loja2', 'elite2024', 'Administrador Loja 2', 'admin', '{
  "can_view_sales": true,
  "can_view_cash": true,
  "can_view_products": true,
  "can_view_reports": true,
  "can_manage_settings": true
}'::jsonb),
('loja2', 'elite2024', 'Operador Loja 2', 'operator', '{
  "can_view_sales": true,
  "can_view_cash": true,
  "can_view_products": true,
  "can_view_reports": false,
  "can_manage_settings": false
}'::jsonb),
('relatorios2', 'elite2024', 'Relatórios Loja 2', 'manager', '{
  "can_view_sales": true,
  "can_view_cash": true,
  "can_view_products": false,
  "can_view_reports": true,
  "can_manage_settings": false
}'::jsonb)
ON CONFLICT (username) DO NOTHING;

-- Insert default products
INSERT INTO store2_products (code, name, category, is_weighable, unit_price, price_per_gram, description, stock_quantity) VALUES
('ACAI300-L2', 'Açaí 300ml - Loja 2', 'acai', false, 8.50, null, 'Açaí tradicional 300ml da Loja 2', 50),
('ACAI500-L2', 'Açaí 500ml - Loja 2', 'acai', false, 12.00, null, 'Açaí tradicional 500ml da Loja 2', 30),
('ACAI1KG-L2', 'Açaí 1kg - Loja 2', 'acai', true, null, 0.0180, 'Açaí pesável por kg da Loja 2', 100)
ON CONFLICT (code) DO NOTHING;

-- Insert default printer settings
INSERT INTO store2_printer_settings (id, auto_print_enabled, printer_name) VALUES
('loja2', true, 'Impressora Loja 2')
ON CONFLICT (id) DO NOTHING;