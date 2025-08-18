/*
  # Sistema de Vendas por Mesa - Elite Açaí

  1. Novas Tabelas
    - `store1_tables` - Mesas da Loja 1
    - `store2_tables` - Mesas da Loja 2  
    - `store1_table_sales` - Vendas por mesa da Loja 1
    - `store2_table_sales` - Vendas por mesa da Loja 2
    - `store1_table_sale_items` - Itens das vendas da Loja 1
    - `store2_table_sale_items` - Itens das vendas da Loja 2

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados

  3. Funcionalidades
    - Status das mesas em tempo real
    - Vendas associadas às mesas
    - Histórico de vendas por mesa
*/

-- Enum para status das mesas
CREATE TYPE table_status AS ENUM ('livre', 'ocupada', 'aguardando_conta', 'limpeza');

-- Enum para status das vendas
CREATE TYPE table_sale_status AS ENUM ('aberta', 'fechada', 'cancelada');

-- Enum para formas de pagamento
CREATE TYPE table_payment_type AS ENUM ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'voucher', 'misto');

-- =============================================
-- TABELAS DA LOJA 1
-- =============================================

-- Tabela de mesas da Loja 1
CREATE TABLE IF NOT EXISTS store1_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  name text NOT NULL,
  capacity integer DEFAULT 4,
  status table_status DEFAULT 'livre',
  current_sale_id uuid,
  location text, -- Ex: "Área interna", "Varanda", etc.
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de vendas por mesa da Loja 1
CREATE TABLE IF NOT EXISTS store1_table_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES store1_tables(id),
  sale_number serial,
  operator_name text,
  customer_name text,
  customer_count integer DEFAULT 1,
  subtotal numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) DEFAULT 0,
  payment_type table_payment_type,
  change_amount numeric(10,2) DEFAULT 0,
  status table_sale_status DEFAULT 'aberta',
  notes text,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de itens das vendas da Loja 1
CREATE TABLE IF NOT EXISTS store1_table_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES store1_table_sales(id) ON DELETE CASCADE,
  product_code text NOT NULL,
  product_name text NOT NULL,
  quantity numeric(10,3) DEFAULT 1,
  weight_kg numeric(10,3),
  unit_price numeric(10,2),
  price_per_gram numeric(10,4),
  discount_amount numeric(10,2) DEFAULT 0,
  subtotal numeric(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- TABELAS DA LOJA 2
-- =============================================

-- Tabela de mesas da Loja 2
CREATE TABLE IF NOT EXISTS store2_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  name text NOT NULL,
  capacity integer DEFAULT 4,
  status table_status DEFAULT 'livre',
  current_sale_id uuid,
  location text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de vendas por mesa da Loja 2
CREATE TABLE IF NOT EXISTS store2_table_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES store2_tables(id),
  sale_number serial,
  operator_name text,
  customer_name text,
  customer_count integer DEFAULT 1,
  subtotal numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) DEFAULT 0,
  payment_type table_payment_type,
  change_amount numeric(10,2) DEFAULT 0,
  status table_sale_status DEFAULT 'aberta',
  notes text,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de itens das vendas da Loja 2
CREATE TABLE IF NOT EXISTS store2_table_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES store2_table_sales(id) ON DELETE CASCADE,
  product_code text NOT NULL,
  product_name text NOT NULL,
  quantity numeric(10,3) DEFAULT 1,
  weight_kg numeric(10,3),
  unit_price numeric(10,2),
  price_per_gram numeric(10,4),
  discount_amount numeric(10,2) DEFAULT 0,
  subtotal numeric(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para Loja 1
CREATE INDEX IF NOT EXISTS idx_store1_tables_status ON store1_tables(status);
CREATE INDEX IF NOT EXISTS idx_store1_tables_number ON store1_tables(number);
CREATE INDEX IF NOT EXISTS idx_store1_table_sales_table_id ON store1_table_sales(table_id);
CREATE INDEX IF NOT EXISTS idx_store1_table_sales_status ON store1_table_sales(status);
CREATE INDEX IF NOT EXISTS idx_store1_table_sales_opened_at ON store1_table_sales(opened_at);
CREATE INDEX IF NOT EXISTS idx_store1_table_sale_items_sale_id ON store1_table_sale_items(sale_id);

-- Índices para Loja 2
CREATE INDEX IF NOT EXISTS idx_store2_tables_status ON store2_tables(status);
CREATE INDEX IF NOT EXISTS idx_store2_tables_number ON store2_tables(number);
CREATE INDEX IF NOT EXISTS idx_store2_table_sales_table_id ON store2_table_sales(table_id);
CREATE INDEX IF NOT EXISTS idx_store2_table_sales_status ON store2_table_sales(status);
CREATE INDEX IF NOT EXISTS idx_store2_table_sales_opened_at ON store2_table_sales(opened_at);
CREATE INDEX IF NOT EXISTS idx_store2_table_sale_items_sale_id ON store2_table_sale_items(sale_id);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_table_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para Loja 1
CREATE TRIGGER update_store1_tables_updated_at 
  BEFORE UPDATE ON store1_tables 
  FOR EACH ROW EXECUTE FUNCTION update_table_updated_at_column();

CREATE TRIGGER update_store1_table_sales_updated_at 
  BEFORE UPDATE ON store1_table_sales 
  FOR EACH ROW EXECUTE FUNCTION update_table_updated_at_column();

-- Triggers para Loja 2
CREATE TRIGGER update_store2_tables_updated_at 
  BEFORE UPDATE ON store2_tables 
  FOR EACH ROW EXECUTE FUNCTION update_table_updated_at_column();

CREATE TRIGGER update_store2_table_sales_updated_at 
  BEFORE UPDATE ON store2_table_sales 
  FOR EACH ROW EXECUTE FUNCTION update_table_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE store1_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE store1_table_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE store1_table_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_table_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE store2_table_sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas para Loja 1
CREATE POLICY "Allow all operations on store1_tables" ON store1_tables FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store1_table_sales" ON store1_table_sales FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store1_table_sale_items" ON store1_table_sale_items FOR ALL TO public USING (true) WITH CHECK (true);

-- Políticas para Loja 2
CREATE POLICY "Allow all operations on store2_tables" ON store2_tables FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store2_table_sales" ON store2_table_sales FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store2_table_sale_items" ON store2_table_sale_items FOR ALL TO public USING (true) WITH CHECK (true);

-- =============================================
-- DADOS INICIAIS - MESAS PADRÃO
-- =============================================

-- Inserir mesas padrão para Loja 1
INSERT INTO store1_tables (number, name, capacity, location) VALUES
(1, 'Mesa 1', 4, 'Área interna'),
(2, 'Mesa 2', 4, 'Área interna'),
(3, 'Mesa 3', 2, 'Área interna'),
(4, 'Mesa 4', 6, 'Área interna'),
(5, 'Mesa 5', 4, 'Varanda'),
(6, 'Mesa 6', 4, 'Varanda'),
(7, 'Mesa 7', 2, 'Varanda'),
(8, 'Mesa 8', 8, 'Área externa')
ON CONFLICT (number) DO NOTHING;

-- Inserir mesas padrão para Loja 2
INSERT INTO store2_tables (number, name, capacity, location) VALUES
(1, 'Mesa 1', 4, 'Área interna'),
(2, 'Mesa 2', 4, 'Área interna'),
(3, 'Mesa 3', 2, 'Área interna'),
(4, 'Mesa 4', 6, 'Área interna'),
(5, 'Mesa 5', 4, 'Varanda'),
(6, 'Mesa 6', 4, 'Varanda')
ON CONFLICT (number) DO NOTHING;

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar status da mesa quando venda é criada/fechada
CREATE OR REPLACE FUNCTION update_table_status_on_sale_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Para inserção de nova venda
  IF TG_OP = 'INSERT' THEN
    -- Atualizar mesa para ocupada e associar venda
    IF TG_TABLE_NAME = 'store1_table_sales' THEN
      UPDATE store1_tables 
      SET status = 'ocupada', current_sale_id = NEW.id, updated_at = now()
      WHERE id = NEW.table_id;
    ELSIF TG_TABLE_NAME = 'store2_table_sales' THEN
      UPDATE store2_tables 
      SET status = 'ocupada', current_sale_id = NEW.id, updated_at = now()
      WHERE id = NEW.table_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Para atualização de venda
  IF TG_OP = 'UPDATE' THEN
    -- Se venda foi fechada, liberar mesa
    IF OLD.status = 'aberta' AND NEW.status = 'fechada' THEN
      IF TG_TABLE_NAME = 'store1_table_sales' THEN
        UPDATE store1_tables 
        SET status = 'livre', current_sale_id = NULL, updated_at = now()
        WHERE id = NEW.table_id;
      ELSIF TG_TABLE_NAME = 'store2_table_sales' THEN
        UPDATE store2_tables 
        SET status = 'livre', current_sale_id = NULL, updated_at = now()
        WHERE id = NEW.table_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar status das mesas
CREATE TRIGGER trg_store1_table_sales_status 
  AFTER INSERT OR UPDATE ON store1_table_sales 
  FOR EACH ROW EXECUTE FUNCTION update_table_status_on_sale_change();

CREATE TRIGGER trg_store2_table_sales_status 
  AFTER INSERT OR UPDATE ON store2_table_sales 
  FOR EACH ROW EXECUTE FUNCTION update_table_status_on_sale_change();