/*
  # Adicionar mais 2 mesas para vendas

  1. Novas Mesas
    - Mesa 7 e Mesa 8 para Loja 1 (store1_tables)
    - Mesa 7 e Mesa 8 para Loja 2 (store2_tables)
  
  2. Configurações
    - Capacidade padrão de 4 pessoas
    - Status inicial: livre
    - Ativas por padrão
    - Localização definida
*/

-- Adicionar Mesa 7 e Mesa 8 para Loja 1
INSERT INTO store1_tables (number, name, capacity, status, location, is_active) VALUES
(7, 'Mesa 7', 4, 'livre', 'Área Central', true),
(8, 'Mesa 8', 4, 'livre', 'Área Central', true)
ON CONFLICT (number) DO NOTHING;

-- Adicionar Mesa 7 e Mesa 8 para Loja 2  
INSERT INTO store2_tables (number, name, capacity, status, location, is_active) VALUES
(7, 'Mesa 7', 4, 'livre', 'Área Central', true),
(8, 'Mesa 8', 4, 'livre', 'Área Central', true)
ON CONFLICT (number) DO NOTHING;