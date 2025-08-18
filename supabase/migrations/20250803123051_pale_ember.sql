/*
  # Adicionar Mesas 7 e 8 para Vendas

  1. Novas Mesas
    - Mesa 7 e Mesa 8 para Loja 1 (store1_tables)
    - Mesa 7 e Mesa 8 para Loja 2 (store2_tables)
    - Capacidade: 4 pessoas cada
    - Status: livre (disponível)
    - Localização: Área Central

  2. Configurações
    - Todas as mesas ficam ativas por padrão
    - Status inicial: livre
    - Sem vendas associadas inicialmente
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