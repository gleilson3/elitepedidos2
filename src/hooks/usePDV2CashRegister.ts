import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PDVCashRegister, PDVCashRegisterEntry, PDVCashRegisterSummary } from '../types/pdv';

// Type for PDV Operator
interface PDVOperator {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export const usePDV2CashRegister = () => {
  const [currentRegister, setCurrentRegister] = useState<PDVCashRegister | null>(null);
  const [entries, setEntries] = useState<PDVCashRegisterEntry[]>([]);
  const [operators, setOperators] = useState<PDVOperator[]>([]);
  const [summary, setSummary] = useState<PDVCashRegisterSummary>({
    opening_amount: 0,
    sales_total: 0,
    total_income: 0,
    other_income_total: 0,
    total_expense: 0,
    expected_balance: 0,
    actual_balance: 0,
    difference: 0,
    sales_count: 0,
    delivery_total: 0,
    delivery_count: 0,
    total_all_sales: 0,
    sales: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperators = useCallback(async () => {
    try {
      console.log('👥 Buscando operadores da Loja 2...');
      
      const { data: operatorsData, error: operatorsError } = await supabase
        .from('pdv2_operators')
        .select('*')
        .order('name', { ascending: true });
      
      if (operatorsError) {
        console.error('Erro ao buscar operadores da Loja 2:', operatorsError);
        throw operatorsError;
      }
      
      setOperators(operatorsData || []);
      console.log(`✅ Carregados ${operatorsData?.length || 0} operadores da Loja 2`);
    } catch (err) {
      console.error('Erro ao carregar operadores da Loja 2:', err);
      setOperators([]);
    }
  }, []);

  const fetchCashRegisterStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'your_supabase_url_here' || 
          supabaseKey === 'your_supabase_anon_key_here' ||
          supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase não configurado - usando modo offline para Loja 2');
        setCurrentRegister(null);
        setEntries([]);
        setSummary({
          opening_amount: 0,
          sales_total: 0,
          total_income: 0,
          other_income_total: 0,
          total_expense: 0,
          expected_balance: 0,
          actual_balance: 0,
          difference: 0,
          sales_count: 0,
          delivery_total: 0,
          delivery_count: 0,
          total_all_sales: 0,
          sales: {}
        });
        setLoading(false);
        return;
      }
      
      console.log('🔄 Buscando status do caixa da Loja 2...');
      
      // Verificar se existe um caixa aberto para a Loja 2
      const { data: openRegister, error: openError } = await supabase
        .from('pdv2_cash_registers')
        .select('*')
        .is('closed_at', null)
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (openError) {
        console.error('Erro ao buscar caixa ativo da Loja 2:', openError);
        throw openError;
      }
      
      if (openRegister) {
        console.log('✅ Caixa da Loja 2 aberto encontrado:', openRegister.id);
        
        // Buscar entradas do caixa 
        const { data: entriesData, error: entriesError } = await supabase
          .from('pdv2_cash_entries')
          .select('*')
          .eq('register_id', openRegister.id)
          .order('created_at', { ascending: false });
          
        if (entriesError) {
          console.error('Erro ao buscar entradas da Loja 2:', entriesError);
          throw entriesError;
        }
        
        setEntries(entriesData || []);
        setCurrentRegister(openRegister);
        
        console.log(`✅ Carregadas ${entriesData?.length || 0} movimentações de caixa da Loja 2`);
        
        // Calcular resumo manualmente para Loja 2
        const salesTotal = entriesData?.filter(e => e.type === 'income' && e.description.includes('Venda')).reduce((sum, e) => sum + e.amount, 0) || 0;
        const otherIncomeTotal = entriesData?.filter(e => e.type === 'income' && !e.description.includes('Venda')).reduce((sum, e) => sum + e.amount, 0) || 0;
        const expenseTotal = entriesData?.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0) || 0;
        const expectedBalance = openRegister.opening_amount + salesTotal + otherIncomeTotal - expenseTotal;
        
        setSummary({
          opening_amount: openRegister.opening_amount || 0,
          sales_total: salesTotal,
          total_income: salesTotal + otherIncomeTotal,
          other_income_total: otherIncomeTotal,
          total_expense: expenseTotal,
          expected_balance: expectedBalance,
          actual_balance: openRegister.closing_amount || expectedBalance,
          difference: (openRegister.closing_amount || expectedBalance) - expectedBalance,
          sales_count: entriesData?.filter(e => e.type === 'income' && e.description.includes('Venda')).length || 0,
          delivery_total: 0, // Loja 2 não tem delivery
          delivery_count: 0,
          total_all_sales: salesTotal,
          sales: {}
        });
      } else {
        console.log('ℹ️ Nenhum caixa da Loja 2 aberto no momento');
        setCurrentRegister(null);
        setEntries([]);
        setSummary({
          opening_amount: 0,
          sales_total: 0,
          total_income: 0,
          other_income_total: 0,
          total_expense: 0,
          expected_balance: 0,
          actual_balance: 0,
          difference: 0,
          sales_count: 0,
          delivery_total: 0,
          delivery_count: 0,
          total_all_sales: 0,
          sales: {}
        });
      }
    } catch (err) {
      console.error('Erro ao carregar caixa da Loja 2:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar caixa');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCashRegisterReport = useCallback(async (filters?: {
    startDate?: string;
    endDate?: string;
    operatorId?: string;
  }) => {
    const startDate = filters?.startDate || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    const endDate = filters?.endDate || new Date().toISOString().split('T')[0];
    
    try {
      console.log('📊 Buscando relatório de caixa da Loja 2 com filtros:', { startDate, endDate });
      
      // Buscar registros de caixa da Loja 2
      let query = supabase
        .from('pdv2_cash_registers')
        .select('*')
        .gte('opened_at', `${startDate}T00:00:00`)
        .lte('opened_at', `${endDate}T23:59:59`)
        .order('opened_at', { ascending: false })
        .limit(50);
      
      if (filters?.operatorId) {
        query = query.eq('operator_id', filters.operatorId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar relatório de caixa da Loja 2:', error);
        setError(`Erro ao buscar relatório de caixa: ${error.message}`);
        return [];
      }
      
      console.log(`✅ Relatório da Loja 2 gerado com ${data?.length || 0} registros de caixa`);
      setError(null);
      
      // Processar dados para incluir resumo
      const processedData = await Promise.all((data || []).map(async (register) => {
        try {
          // Buscar entradas para cada registro
          const { data: entriesData, error: entriesError } = await supabase
            .from('pdv2_cash_entries')
            .select('*')
            .eq('register_id', register.id);
          
          if (entriesError) {
            console.error(`Erro ao buscar entradas para caixa ${register.id}:`, entriesError);
            return {
              ...register,
              summary: {
                sales_total: 0,
                delivery_total: 0,
                other_income_total: 0,
                total_expense: 0,
                expected_balance: register.opening_amount || 0
              }
            };
          }
          
          // Calcular resumo
          const salesTotal = entriesData?.filter(e => e.type === 'income' && e.description.includes('Venda')).reduce((sum, e) => sum + e.amount, 0) || 0;
          const otherIncomeTotal = entriesData?.filter(e => e.type === 'income' && !e.description.includes('Venda')).reduce((sum, e) => sum + e.amount, 0) || 0;
          const expenseTotal = entriesData?.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0) || 0;
          
          return {
            ...register,
            summary: {
              sales_total: salesTotal,
              delivery_total: 0, // Loja 2 não tem delivery
              other_income_total: otherIncomeTotal,
              total_expense: expenseTotal,
              expected_balance: register.opening_amount + salesTotal + otherIncomeTotal - expenseTotal
            }
          };
        } catch (err) {
          console.error(`Erro ao processar caixa ${register.id}:`, err);
          return {
            ...register,
            summary: {
              sales_total: 0,
              delivery_total: 0,
              other_income_total: 0,
              total_expense: 0,
              expected_balance: register.opening_amount || 0
            }
          };
        }
      }));
      
      return processedData;
    } catch (err) {
      console.error('Erro ao carregar relatório de caixa da Loja 2:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar relatório');
      return [];
    }
  }, []);

  useEffect(() => {
    fetchCashRegisterStatus();
    fetchOperators();
  }, [fetchCashRegisterStatus, fetchOperators]);

  return {
    currentRegister,
    entries,
    operators,
    summary, 
    loading,
    error,
    isOpen: !!currentRegister,
    refreshData: fetchCashRegisterStatus,
    getCashRegisterReport
  };
};