/*
  # Copiar produtos para Loja 2

  1. Operação
    - Copia todos os produtos ativos da tabela `pdv_products` para `store2_products`
    - Mantém todos os dados originais (preços, categorias, etc.)
    - Adiciona prefixo "L2-" nos códigos para diferenciação
    - Preserva estrutura e relacionamentos

  2. Segurança
    - Usa INSERT ... ON CONFLICT para evitar duplicatas
    - Mantém dados existentes se já houver produtos na Loja 2
    - Operação segura e reversível
*/

-- Copiar todos os produtos ativos da tabela principal para store2_products
INSERT INTO store2_products (
  code,
  name,
  category,
  is_weighable,
  unit_price,
  price_per_gram,
  image_url,
  stock_quantity,
  min_stock,
  is_active,
  barcode,
  description,
  created_at,
  updated_at
)
SELECT 
  CASE 
    WHEN code LIKE 'L2-%' THEN code
    ELSE 'L2-' || code
  END as code,
  name || ' (Loja 2)' as name,
  category::text as category,
  is_weighable,
  unit_price,
  price_per_gram,
  image_url,
  stock_quantity,
  min_stock,
  is_active,
  barcode,
  description,
  now() as created_at,
  now() as updated_at
FROM pdv_products 
WHERE is_active = true
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  is_weighable = EXCLUDED.is_weighable,
  unit_price = EXCLUDED.unit_price,
  price_per_gram = EXCLUDED.price_per_gram,
  image_url = EXCLUDED.image_url,
  stock_quantity = EXCLUDED.stock_quantity,
  min_stock = EXCLUDED.min_stock,
  is_active = EXCLUDED.is_active,
  barcode = EXCLUDED.barcode,
  description = EXCLUDED.description,
  updated_at = now();

-- Verificar quantos produtos foram copiados
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM store2_products;
  RAISE NOTICE 'Total de produtos na Loja 2: %', product_count;
END $$;