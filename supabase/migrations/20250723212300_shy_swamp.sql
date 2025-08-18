/*
  # Sistema Completo da Loja 2 - Banco de Dados

  1. Tabelas Criadas
    - `store2_products` - Produtos exclusivos da Loja 2
    - `store2_users` - Usuários da Loja 2
    - `store2_sales` - Vendas da Loja 2
    - `store2_sale_items` - Itens das vendas da Loja 2
    - `store2_printer_settings` - Configurações de impressora

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso público (sistema interno)
    - Triggers para timestamps automáticos

  3. Funcionalidades
    - Sistema independente da Loja 1
    - Sincronização entre dispositivos
    - Backup automático no servidor
*/

-- Tabela de produtos da Loja 2
CREATE TABLE IF NOT EXISTS store2_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'outros',
  is_weighable boolean DEFAULT false,
  unit_price numeric(10,2),
  price_per_gram numeric(10,4),
  image_url text,
  stock_quantity numeric(10,3) DEFAULT 0,
  min_stock numeric(10,3) DEFAULT 0,
  is_active boolean DEFAULT true,
  barcode text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT store2_products_price_check CHECK (
    (is_weighable = false AND unit_price IS NOT NULL AND price_per_gram IS NULL) OR
    (is_weighable = true AND price_per_gram IS NOT NULL AND unit_price IS NULL)
  )
);

-- Tabela de usuários da Loja 2
CREATE TABLE IF NOT EXISTS store2_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'operator',
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{
    "can_view_sales": true,
    "can_view_cash": false,
    "can_view_products": false,
    "can_view_reports": false,
    "can_manage_settings": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  
  CONSTRAINT store2_users_role_check CHECK (role IN ('operator', 'manager', 'admin'))
);

-- Tabela de vendas da Loja 2
CREATE TABLE IF NOT EXISTS store2_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number serial UNIQUE,
  operator_id uuid REFERENCES store2_users(id),
  customer_name text,
  customer_phone text,
  subtotal numeric(10,2) NOT NULL,
  discount_amount numeric(10,2) DEFAULT 0,
  discount_percentage numeric(5,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  payment_type text NOT NULL DEFAULT 'dinheiro',
  payment_details jsonb,
  change_amount numeric(10,2) DEFAULT 0,
  notes text,
  is_cancelled boolean DEFAULT false,
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES store2_users(id),
  cancel_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  channel text DEFAULT 'loja2',
  cash_register_id uuid REFERENCES pdv2_cash_registers(id),
  
  CONSTRAINT store2_sales_payment_type_check CHECK (
    payment_type IN ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'voucher', 'misto')
  )
);

-- Tabela de itens das vendas da Loja 2
CREATE TABLE IF NOT EXISTS store2_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES store2_sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES store2_products(id),
  product_code text NOT NULL,
  product_name text NOT NULL,
  quantity numeric(10,3) DEFAULT 1,
  weight_kg numeric(10,3),
  unit_price numeric(10,2),
  price_per_gram numeric(10,4),
  discount_amount numeric(10,2) DEFAULT 0,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de configurações de impressora da Loja 2
CREATE TABLE IF NOT EXISTS store2_printer_settings (
  id text PRIMARY KEY DEFAULT 'loja2',
  paper_width text DEFAULT '80mm',
  page_size integer DEFAULT 300,
  font_size integer DEFAULT 14,
  scale numeric(3,1) DEFAULT 1.0,
  margin_left integer DEFAULT 0,
  margin_top integer DEFAULT 1,
  margin_bottom integer DEFAULT 1,
  auto_print_orders boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE store2_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_printer_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (sistema interno)
CREATE POLICY "Allow all operations on store2_products" ON store2_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store2_users" ON store2_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store2_sales" ON store2_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store2_sale_items" ON store2_sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store2_printer_settings" ON store2_printer_settings FOR ALL USING (true) WITH CHECK (true);

-- Triggers para atualização automática de timestamps
CREATE OR REPLACE FUNCTION update_store2_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store2_products_updated_at BEFORE UPDATE ON store2_products FOR EACH ROW EXECUTE FUNCTION update_store2_updated_at_column();
CREATE TRIGGER update_store2_users_updated_at BEFORE UPDATE ON store2_users FOR EACH ROW EXECUTE FUNCTION update_store2_updated_at_column();
CREATE TRIGGER update_store2_sales_updated_at BEFORE UPDATE ON store2_sales FOR EACH ROW EXECUTE FUNCTION update_store2_updated_at_column();
CREATE TRIGGER update_store2_printer_settings_updated_at BEFORE UPDATE ON store2_printer_settings FOR EACH ROW EXECUTE FUNCTION update_store2_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_store2_products_active ON store2_products(is_active);
CREATE INDEX IF NOT EXISTS idx_store2_products_category ON store2_products(category);
CREATE INDEX IF NOT EXISTS idx_store2_products_code ON store2_products(code);
CREATE INDEX IF NOT EXISTS idx_store2_users_username ON store2_users(username);
CREATE INDEX IF NOT EXISTS idx_store2_users_active ON store2_users(is_active);
CREATE INDEX IF NOT EXISTS idx_store2_sales_date ON store2_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_store2_sales_operator ON store2_sales(operator_id);
CREATE INDEX IF NOT EXISTS idx_store2_sales_cancelled ON store2_sales(is_cancelled);
CREATE INDEX IF NOT EXISTS idx_store2_sale_items_sale ON store2_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_store2_sale_items_product ON store2_sale_items(product_id);

-- Inserir dados padrão
INSERT INTO store2_products (code, name, category, is_weighable, unit_price, image_url, stock_quantity, min_stock, description) VALUES
('AC300L2', 'Açaí 300ml - Loja 2', 'acai', false, 15.90, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400', 50, 10, 'Açaí tradicional 300ml exclusivo da Loja 2'),
('AC500L2', 'Açaí 500ml - Loja 2', 'acai', false, 22.90, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400', 50, 10, 'Açaí tradicional 500ml exclusivo da Loja 2'),
('AC1KGL2', 'Açaí 1kg - Loja 2', 'acai', true, null, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400', 20, 5, 'Açaí tradicional vendido por peso - Loja 2')
ON CONFLICT (code) DO NOTHING;

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
  "can_view_cash": false,
  "can_view_products": false,
  "can_view_reports": false,
  "can_manage_settings": false
}'::jsonb),
('relatorios2', 'elite2024', 'Usuário Relatórios', 'manager', '{
  "can_view_sales": true,
  "can_view_cash": false,
  "can_view_products": false,
  "can_view_reports": true,
  "can_manage_settings": false
}'::jsonb)
ON CONFLICT (username) DO NOTHING;

INSERT INTO store2_printer_settings (id) VALUES ('loja2') ON CONFLICT (id) DO NOTHING;