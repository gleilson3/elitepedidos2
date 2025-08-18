/*
  # Remover restrição de unicidade do número da mesa

  1. Problema
    - Constraint única no campo 'number' impede reutilização de números de mesas excluídas
    - Erro 23505: duplicate key value violates unique constraint

  2. Solução
    - Remover constraint única do campo 'number'
    - Permitir reutilização de números quando mesa está inativa (is_active = false)
    - Manter constraint única apenas para mesas ativas via trigger/check

  3. Tabelas Afetadas
    - store1_tables: Mesas da Loja 1
    - store2_tables: Mesas da Loja 2

  4. Segurança
    - Remove apenas a constraint de unicidade no número
    - Mantém outras constraints de integridade
    - Aplicação controla lógica de reutilização
*/

-- Remover constraint de unicidade do número da mesa para Loja 1
ALTER TABLE store1_tables DROP CONSTRAINT IF EXISTS store1_tables_number_key;

-- Remover constraint de unicidade do número da mesa para Loja 2  
ALTER TABLE store2_tables DROP CONSTRAINT IF EXISTS store2_tables_number_key;

-- Criar constraint única composta (number + is_active) para Loja 1
-- Permite mesmo número se uma mesa estiver inativa
ALTER TABLE store1_tables 
ADD CONSTRAINT store1_tables_number_active_unique 
UNIQUE (number, is_active) 
DEFERRABLE INITIALLY DEFERRED;

-- Criar constraint única composta (number + is_active) para Loja 2
-- Permite mesmo número se uma mesa estiver inativa
ALTER TABLE store2_tables 
ADD CONSTRAINT store2_tables_number_active_unique 
UNIQUE (number, is_active) 
DEFERRABLE INITIALLY DEFERRED;

-- Criar função para validar unicidade apenas para mesas ativas
CREATE OR REPLACE FUNCTION validate_active_table_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe uma mesa ativa com o mesmo número
  IF NEW.is_active = true THEN
    IF EXISTS (
      SELECT 1 FROM store1_tables 
      WHERE number = NEW.number 
      AND is_active = true 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Mesa número % já existe e está ativa na Loja 1', NEW.number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar função similar para Loja 2
CREATE OR REPLACE FUNCTION validate_active_table_number_store2()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe uma mesa ativa com o mesmo número
  IF NEW.is_active = true THEN
    IF EXISTS (
      SELECT 1 FROM store2_tables 
      WHERE number = NEW.number 
      AND is_active = true 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Mesa número % já existe e está ativa na Loja 2', NEW.number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para validação
DROP TRIGGER IF EXISTS trg_validate_table_number_store1 ON store1_tables;
CREATE TRIGGER trg_validate_table_number_store1
  BEFORE INSERT OR UPDATE ON store1_tables
  FOR EACH ROW
  EXECUTE FUNCTION validate_active_table_number();

DROP TRIGGER IF EXISTS trg_validate_table_number_store2 ON store2_tables;  
CREATE TRIGGER trg_validate_table_number_store2
  BEFORE INSERT OR UPDATE ON store2_tables
  FOR EACH ROW
  EXECUTE FUNCTION validate_active_table_number_store2();

-- Atualizar constraint única composta para permitir NULL em is_active
-- Isso permite que mesas inativas não conflitem
ALTER TABLE store1_tables DROP CONSTRAINT IF EXISTS store1_tables_number_active_unique;
ALTER TABLE store2_tables DROP CONSTRAINT IF EXISTS store2_tables_number_active_unique;

-- Criar partial unique index que funciona melhor para este caso
-- Só aplica unicidade para mesas ativas (is_active = true)
DROP INDEX IF EXISTS idx_store1_tables_number_active_unique;
CREATE UNIQUE INDEX idx_store1_tables_number_active_unique 
ON store1_tables (number) 
WHERE is_active = true;

DROP INDEX IF EXISTS idx_store2_tables_number_active_unique;
CREATE UNIQUE INDEX idx_store2_tables_number_active_unique 
ON store2_tables (number) 
WHERE is_active = true;

-- Comentário de verificação
COMMENT ON INDEX idx_store1_tables_number_active_unique IS 
'Garante que números de mesa sejam únicos apenas para mesas ativas na Loja 1';

COMMENT ON INDEX idx_store2_tables_number_active_unique IS 
'Garante que números de mesa sejam únicos apenas para mesas ativas na Loja 2';