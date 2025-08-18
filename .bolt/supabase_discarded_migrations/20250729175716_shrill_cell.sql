/*
  # Sistema de Fluxo de Caixa Mensal

  1. Nova Tabela
    - `financeiro_fluxo`
      - `id` (uuid, primary key)
      - `data` (date)
      - `tipo` (text, check constraint)
      - `descricao` (text, opcional)
      - `valor` (numeric)
      - `loja` (text, default 'loja1')
      - `criado_em` (timestamp)
      - `criado_por` (text, opcional)

  2. Tipos de Entrada
    - saldo_inicial
    - transferencia_entrada, transferencia_saida
    - receita, sistema_entrada
    - despesa, gasto_fixo, sistema_fechamento

  3. Índices
    - Por data para consultas rápidas
    - Por loja para filtros
    - Por tipo para relatórios
    - Por mês/ano para agregações

  4. View para Relatórios
    - Agregação mensal por loja
    - Cálculos automáticos de saldos
*/

-- Criar tabela de fluxo de caixa
CREATE TABLE IF NOT EXISTS financeiro_fluxo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  tipo text NOT NULL,
  descricao text,
  valor numeric(10,2) NOT NULL,
  loja text DEFAULT 'loja1',
  criado_em timestamptz DEFAULT now(),
  criado_por text
);

-- Adicionar constraint para tipos válidos
ALTER TABLE financeiro_fluxo 
ADD CONSTRAINT financeiro_fluxo_tipo_check 
CHECK (tipo IN (
  'saldo_inicial',
  'transferencia_entrada',
  'transferencia_saida', 
  'receita',
  'sistema_entrada',
  'despesa',
  'gasto_fixo',
  'sistema_fechamento'
));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_data ON financeiro_fluxo(data);
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_loja ON financeiro_fluxo(loja);
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_tipo ON financeiro_fluxo(tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_fluxo_mes_ano ON financeiro_fluxo(EXTRACT(year FROM data), EXTRACT(month FROM data));

-- Criar view para relatórios mensais
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
  
  -- Saldos por tipo
  COALESCE(SUM(CASE WHEN tipo = 'saldo_inicial' THEN valor ELSE 0 END), 0) as saldo_inicial,
  COALESCE(SUM(CASE WHEN tipo = 'transferencia_entrada' THEN valor ELSE 0 END), 0) as transferencias_entrada,
  COALESCE(SUM(CASE WHEN tipo = 'transferencia_saida' THEN valor ELSE 0 END), 0) as transferencias_saida,
  COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as receitas,
  COALESCE(SUM(CASE WHEN tipo = 'sistema_entrada' THEN valor ELSE 0 END), 0) as entradas_sistema,
  COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as despesas,
  COALESCE(SUM(CASE WHEN tipo = 'gasto_fixo' THEN valor ELSE 0 END), 0) as gastos_fixos,
  COALESCE(SUM(CASE WHEN tipo = 'sistema_fechamento' THEN valor ELSE 0 END), 0) as fechamento_sistema,
  
  -- Cálculos
  COALESCE(SUM(CASE WHEN tipo IN ('receita', 'sistema_entrada', 'transferencia_entrada') THEN valor ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN tipo IN ('despesa', 'gasto_fixo', 'transferencia_saida') THEN valor ELSE 0 END), 0) as saldo_do_periodo,
  
  COALESCE(SUM(CASE WHEN tipo = 'saldo_inicial' THEN valor ELSE 0 END), 0) +
  COALESCE(SUM(CASE WHEN tipo IN ('receita', 'sistema_entrada', 'transferencia_entrada') THEN valor ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN tipo IN ('despesa', 'gasto_fixo', 'transferencia_saida') THEN valor ELSE 0 END), 0) as saldo_total_mensal,
  
  -- Estatísticas
  COUNT(*) as total_movimentacoes,
  MIN(data) as primeira_movimentacao,
  MAX(data) as ultima_movimentacao
  
FROM financeiro_fluxo
GROUP BY 
  EXTRACT(year FROM data),
  EXTRACT(month FROM data),
  loja
ORDER BY ano DESC, mes DESC, loja;

-- Habilitar RLS
ALTER TABLE financeiro_fluxo ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir leitura para usuários autenticados"
  ON financeiro_fluxo
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON financeiro_fluxo
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
  ON financeiro_fluxo
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Permitir exclusão para usuários autenticados"
  ON financeiro_fluxo
  FOR DELETE
  TO authenticated
  USING (true);