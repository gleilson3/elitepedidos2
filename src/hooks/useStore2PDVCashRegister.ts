import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PDVCashRegister, PDVCashRegisterEntry, PDVCashRegisterSummary } from '../types/pdv';

export const useStore2PDVCashRegister = () => {
  const [currentRegister, setCurrentRegister] = useState<PDVCashRegister | null>(null);
  const [entries, setEntries] = useState<PDVCashRegisterEntry[]>([]);
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
        setCurrentRegister(openRegister);
        
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
        
        console.log(`✅ Carregadas ${entriesData?.length || 0} movimentações de caixa da Loja 2`);
        
        // Calcular resumo manualmente para Loja 2 - INCLUIR TODAS AS FORMAS DE PAGAMENTO
        const salesEntries = entriesData?.filter(e => 
          e.type === 'income' && 
          e.description.includes('Venda')
        ) || [];
        
        const salesTotal = salesEntries.reduce((sum, e) => sum + e.amount, 0);
        
        const otherIncomeTotal = entriesData?.filter(e => 
          e.type === 'income' && 
          !e.description.includes('Venda')
        ).reduce((sum, e) => sum + e.amount, 0) || 0;
        
        const expenseTotal = entriesData?.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0) || 0;
        
        // Para o saldo esperado, considerar apenas dinheiro (como no sistema principal)
        const cashSalesTotal = salesEntries.filter(e => e.payment_method === 'dinheiro').reduce((sum, e) => sum + e.amount, 0);
        const cashOtherIncomeTotal = entriesData?.filter(e => 
          e.type === 'income' && 
          !e.description.includes('Venda') && 
          e.payment_method === 'dinheiro'
        ).reduce((sum, e) => sum + e.amount, 0) || 0;
        
        // CORREÇÃO: Calcular saldo esperado corretamente
        const expectedBalance = (openRegister.opening_amount || 0) + cashSalesTotal + cashOtherIncomeTotal - expenseTotal;
        
        console.log('📊 Resumo calculado da Loja 2:', {
          opening_amount: openRegister.opening_amount,
          salesTotal,
          cashSalesTotal,
          salesCount: salesEntries.length,
          otherIncomeTotal,
          cashOtherIncomeTotal,
          expenseTotal,
          expectedBalance
        });
        
        setSummary({
          opening_amount: openRegister.opening_amount || 0,
          sales_total: salesTotal,
          total_income: salesTotal + otherIncomeTotal,
          other_income_total: otherIncomeTotal,
          total_expense: expenseTotal,
          expected_balance: expectedBalance,
          actual_balance: openRegister.closing_amount || expectedBalance,
          difference: (openRegister.closing_amount || expectedBalance) - expectedBalance,
          sales_count: salesEntries.length,
          delivery_total: 0, // Loja 2 não tem delivery
          delivery_count: 0,
          total_all_sales: salesTotal,
          sales: {}
        });
      }
      else {
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

  const openCashRegister = useCallback(async (openingAmount: number) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase não configurado. Configure as variáveis de ambiente para usar esta funcionalidade.');
      }
      
      if (openingAmount <= 0) {
        throw new Error('O valor de abertura deve ser maior que zero.');
      }
      
      console.log('🚀 Abrindo caixa da Loja 2 com valor:', openingAmount);
      
      const { data, error } = await supabase
        .from('pdv2_cash_registers')
        .insert([{
          opening_amount: openingAmount,
          opened_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao abrir caixa da Loja 2:', error);
        throw error;
      }
      
      setCurrentRegister(data);
      console.log('✅ Caixa da Loja 2 aberto com sucesso:', data.id);
      
      await fetchCashRegisterStatus();
       
      return data;
    } catch (err) {
      console.error('Erro ao abrir caixa da Loja 2:', err);
      throw err;
    }
  }, [fetchCashRegisterStatus]);

  const closeCashRegister = useCallback(async (closingAmount: number) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        return {
          success: false,
          error: 'Supabase não configurado. Configure as variáveis de ambiente para usar esta funcionalidade.'
        };
      }
      
      if (!currentRegister) {
        return { success: false, error: 'Nenhum caixa aberto para fechar' };
      }
      
      if (closingAmount <= 0) {
        return { success: false, error: 'O valor de fechamento deve ser maior que zero.' };
      }
      
      console.log('🔒 Fechando caixa da Loja 2 com valor:', closingAmount);
      
      const { data, error } = await supabase
        .from('pdv2_cash_registers')
        .update({
          closing_amount: closingAmount,
          closed_at: new Date().toISOString(),
          difference: closingAmount - (summary?.expected_balance || 0)
        })
        .eq('id', currentRegister.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao fechar caixa da Loja 2:', error);
        return {
          success: false,
          error: error.message || 'Erro ao fechar caixa'
        };
      }
      
      console.log('✅ Caixa da Loja 2 fechado com sucesso');
      
      // Atualizar o registro atual com os dados de fechamento
      setCurrentRegister(prev => prev ? {
        ...prev,
        closing_amount: closingAmount,
        closed_at: new Date().toISOString(),
        difference: closingAmount - (summary?.expected_balance || 0)
      } : null);
      
      return { 
        success: true, 
        data: data,
        summary: summary
      };
    } catch (err) {
      console.error('❌ Erro ao fechar caixa da Loja 2 (exceção):', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro desconhecido ao fechar caixa' 
      };
    }
  }, [currentRegister, summary]);

  const addCashEntry = useCallback(async (entry: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    payment_method?: string;
  }) => {
    try {
      if (!currentRegister) {
        throw new Error('Nenhum caixa aberto. Abra o caixa antes de adicionar entradas.');
      }
      
      console.log('💰 Adicionando entrada ao caixa da Loja 2:', entry);
      
      const payment_method = entry.payment_method || 'dinheiro';
      
      const { data, error } = await supabase
        .from('pdv2_cash_entries')
        .insert([{
          register_id: currentRegister.id,
          type: entry.type,
          amount: entry.amount,
          description: entry.description,
          payment_method: payment_method
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar entrada da Loja 2:', error);
        throw error;
      }
      
      console.log('✅ Entrada da Loja 2 adicionada com sucesso:', data);
      await fetchCashRegisterStatus();
      
      return data;
    } catch (err) {
      console.error('Erro ao adicionar entrada da Loja 2:', err);
      throw err;
    }
  }, [currentRegister, fetchCashRegisterStatus]);

  useEffect(() => {
    fetchCashRegisterStatus();
  }, [fetchCashRegisterStatus]);

  return {
    currentRegister,
    entries,
    summary, 
    loading,
    error,
    isOpen: !!currentRegister,
    openCashRegister,
    closeCashRegister,
    addCashEntry,
    refreshData: fetchCashRegisterStatus
  };
};