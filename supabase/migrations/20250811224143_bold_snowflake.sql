/*
  # Criar Sistema de Fluxo de Caixa Mensal

  1. Nova Tabela
    - `financeiro_fluxo`
      - `id` (uuid, primary key)
      - `data` (date, not null)
      - `tipo` (text, not null) - 8 tipos de movimentação
      - `descricao` (text, opcional)
      - `valor` (numeric, not null)
      - `loja` (text, padrão 'loja1')
      - `criado_em` (timestamp, default now)
      - `criado_por` (text, opcional)

  2. View Agregada
    - `v_fluxo_caixa_mensal`
      - Agrupa dados por mês e loja
      - Calcula saldos e totais automaticamente
      - Inclui estatísticas e resumos

  3. Segurança
    - Enable RLS na tabela
    - Políticas para usuários autenticados
    - Índices para performance

  4. Triggers e Funções
    - Validação de tipos
    - Cálculos automáticos
*/

-- Criar tabela financeiro_fluxo
CREATE TABLE IF NOT EXISTS financeiro_fluxo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  tipo text NOT NULL,
  descricao text,
  valor numeric(10,2) NOT NULL,
  loja text DEFAULT 'loja1',
  criado_em timestamp with time zone DEFAULT now(),
  criado_por text
);

-- Adicionar constraint para tipos válidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'financeiro_fluxo' AND constraint_name = 'financeiro_fluxo_tipo_check'
  ) THEN
    ALTER TABLE financeiro_fluxo ADD CONSTRAINT financeiro_fluxo_tipo_check 
    CHECK (tipo = ANY (ARRAY[
      'saldo_inicial'::text,
      'transferencia_entrada'::text, 
      'transferencia_saida'::text,
      'receita'::text,
      'sistema_entrada'::text,
      'despesa'::text,
      'gasto_fixo'::text,
      'sistema_fechamento'::text
    ]));
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_data ON financeiro_fluxo(data);
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_tipo ON financeiro_fluxo(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_loja ON financeiro_fluxo(loja);
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_mes_ano ON financeiro_fluxo(EXTRACT(year FROM data), EXTRACT(month FROM data));

-- Habilitar RLS
ALTER TABLE financeiro_fluxo ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY IF NOT EXISTS "Permitir leitura para usuários autenticados"
  ON financeiro_fluxo
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção para usuários autenticados"
  ON financeiro_fluxo
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização para usuários autenticados"
  ON financeiro_fluxo
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão para usuários autenticados"
  ON financeiro_fluxo
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar view agregada v_fluxo_caixa_mensal
CREATE OR REPLACE VIEW v_fluxo_caixa_mensal AS
SELECT 
  EXTRACT(year FROM data) as ano,
  EXTRACT(month FROM data) as mes,
  EXTRACT(year FROM data) || '-' || LPAD(EXTRACT(month FROM data)::text, 2, '0') as mes_ano,
  CASE EXTRACT(month FROM data)
    WHEN 1 THEN 'Janeiro'
    WHEN 2 THEN 'Fevereiro'
    WHEN 3 THEN 'Março'
    WHEN 4 THEN 'Abril'
    WHEN 5 THEN 'Maio'
    WHEN 6 THEN 'Junho'
    WHEN 7 THEN 'Julho'
    WHEN 8 THEN 'Agosto'
    WHEN 9 THEN 'Setembro'
    WHEN 10 THEN 'Outubro'
    WHEN 11 THEN 'Novembro'
    WHEN 12 THEN 'Dezembro'
  END as mes_formatado,
  loja,
  
  -- Saldo inicial
  COALESCE(SUM(CASE WHEN tipo = 'saldo_inicial' THEN valor ELSE 0 END), 0) as saldo_inicial,
  
  -- Transferências
  COALESCE(SUM(CASE WHEN tipo = 'transferencia_entrada' THEN valor ELSE 0 END), 0) as transferencias_entrada,
  COALESCE(SUM(CASE WHEN tipo = 'transferencia_saida' THEN valor ELSE 0 END), 0) as transferencias_saida,
  
  -- Receitas
  COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as receitas,
  COALESCE(SUM(CASE WHEN tipo = 'sistema_entrada' THEN valor ELSE 0 END), 0) as entradas_sistema,
  
  -- Despesas
  COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as despesas,
  COALESCE(SUM(CASE WHEN tipo = 'gasto_fixo' THEN valor ELSE 0 END), 0) as gastos_fixos,
  COALESCE(SUM(CASE WHEN tipo = 'sistema_fechamento' THEN valor ELSE 0 END), 0) as fechamento_sistema,
  
  -- Cálculos
  (
    COALESCE(SUM(CASE WHEN tipo IN ('transferencia_entrada', 'receita', 'sistema_entrada') THEN valor ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN tipo IN ('transferencia_saida', 'despesa', 'gasto_fixo', 'sistema_fechamento') THEN valor ELSE 0 END), 0)
  ) as saldo_do_periodo,
  
  (
    COALESCE(SUM(CASE WHEN tipo = 'saldo_inicial' THEN valor ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN tipo IN ('transferencia_entrada', 'receita', 'sistema_entrada') THEN valor ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN tipo IN ('transferencia_saida', 'despesa', 'gasto_fixo', 'sistema_fechamento') THEN valor ELSE 0 END), 0)
  ) as saldo_total_mensal,
  
  -- Estatísticas
  COUNT(*) as total_movimentacoes,
  MIN(data) as primeira_movimentacao,
  MAX(data) as ultima_movimentacao
  
FROM financeiro_fluxo
GROUP BY 
  EXTRACT(year FROM data),
  EXTRACT(month FROM data),
  loja
ORDER BY 
  ano DESC, 
  mes DESC, 
  loja;