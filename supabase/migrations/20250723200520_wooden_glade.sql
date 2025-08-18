/*
  # Insert Sample Data for PDV2 Tables

  1. Sample Data
    - Insert sample operator for Loja 2
    - Insert sample store record if needed
    - This allows immediate testing of the PDV2 system

  2. Default Operator
    - Name: "Operador Loja 2"
    - Code: "LOJA2"
    - Password: "123456" (hashed)
    - All permissions enabled for testing

  3. Store Record
    - Ensures store_id reference works
    - Creates "Loja 2" store entry
*/

-- Insert sample store for Loja 2 (if stores table exists and doesn't have Loja 2)
INSERT INTO stores (id, name, code, password_hash, address, phone, is_active, has_delivery, has_pos_sales, is_main_store)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Elite Açaí - Loja 2',
  'LOJA2',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 123456
  'Rua das Palmeiras, 456 - Aldeota, Fortaleza/CE',
  '(85) 99999-2222',
  true,
  false, -- Loja 2 não tem delivery
  true,  -- Loja 2 tem vendas PDV
  false  -- Não é loja principal
)
ON CONFLICT (code) DO NOTHING;

-- Insert sample operator for Loja 2
INSERT INTO pdv2_operators (id, name, code, password_hash, is_active, permissions)
VALUES (
  'a47ac10b-58cc-4372-a567-0e02b2c3d480',
  'Operador Loja 2',
  'LOJA2',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 123456
  true,
  '{
    "can_cancel": true,
    "can_discount": true,
    "can_use_scale": true,
    "can_view_sales": true,
    "can_view_orders": true,
    "can_view_reports": true,
    "can_view_products": true,
    "can_view_operators": true,
    "can_manage_products": true,
    "can_manage_settings": true,
    "can_view_attendance": true,
    "can_view_cash_report": true,
    "can_view_sales_report": true,
    "can_view_cash_register": true
  }'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- Insert additional sample operators
INSERT INTO pdv2_operators (name, code, password_hash, is_active, permissions)
VALUES 
(
  'Maria Silva - Loja 2',
  'MARIA2',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  true,
  '{
    "can_cancel": false,
    "can_discount": false,
    "can_use_scale": true,
    "can_view_sales": true,
    "can_view_orders": false,
    "can_view_reports": false,
    "can_view_products": true,
    "can_view_operators": false,
    "can_manage_products": false,
    "can_manage_settings": false,
    "can_view_attendance": false,
    "can_view_cash_report": false,
    "can_view_sales_report": false,
    "can_view_cash_register": true
  }'::jsonb
),
(
  'João Santos - Loja 2',
  'JOAO2',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  true,
  '{
    "can_cancel": false,
    "can_discount": true,
    "can_use_scale": true,
    "can_view_sales": true,
    "can_view_orders": false,
    "can_view_reports": true,
    "can_view_products": true,
    "can_view_operators": false,
    "can_manage_products": false,
    "can_manage_settings": false,
    "can_view_attendance": false,
    "can_view_cash_report": true,
    "can_view_sales_report": true,
    "can_view_cash_register": true
  }'::jsonb
)
ON CONFLICT (code) DO NOTHING;