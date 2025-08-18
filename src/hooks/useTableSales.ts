import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { RestaurantTable, TableSale, TableSaleItem, TableCartItem } from '../types/table-sales';
import { usePDVCashRegister } from './usePDVCashRegister';
import { useStore2PDVCashRegister } from './useStore2PDVCashRegister';

export const useTableSales = (storeId: 1 | 2) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks de caixa baseado na loja
  const store1CashRegister = usePDVCashRegister();
  const store2CashRegister = useStore2PDVCashRegister();
  
  const cashRegister = storeId === 1 ? store1CashRegister : store2CashRegister;

  // Definir nomes das tabelas baseado na loja
  const tablesTable = storeId === 1 ? 'store1_tables' : 'store2_tables';
  const salesTable = storeId === 1 ? 'store1_table_sales' : 'store2_table_sales';
  const itemsTable = storeId === 1 ? 'store1_table_sale_items' : 'store2_table_sale_items';
  const cashEntriesTable = storeId === 1 ? 'pdv_cash_entries' : 'pdv2_cash_entries';

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Carregando TODAS as mesas da Loja ${storeId}...`);

      const { data, error } = await supabase
        .from(tablesTable)
        .select(`
          *,
          current_sale:${salesTable}!current_sale_id(*)
        `)
        // Remover filtro is_active para mostrar todas as mesas
        .order('number');

      if (error) throw error;

      console.log(`📊 Dados das mesas carregados (${data?.length || 0} mesas):`, data);
      setTables(data || []);
      console.log(`✅ ${data?.length || 0} mesas carregadas da Loja ${storeId} (incluindo inativas)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar mesas';
      console.error(`❌ Erro ao carregar mesas da Loja ${storeId}:`, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [storeId, tablesTable, salesTable]);

  const updateSaleTotal = useCallback(async (saleId: string) => {
    try {
      console.log(`🧮 Calculando total da venda ${saleId}...`);
      
      // Calcular total dos itens
      const { data: items, error: itemsError } = await supabase
        .from(itemsTable)
        .select('subtotal')
        .eq('sale_id', saleId);

      if (itemsError) throw itemsError;

      const subtotal = items?.reduce((sum, item) => sum + Number(item.subtotal), 0) || 0;

      console.log(`💰 Novo subtotal calculado: R$ ${subtotal.toFixed(2)}`);
      // Atualizar venda
      const { error: updateError } = await supabase
        .from(salesTable)
        .update({
          subtotal: subtotal,
          total_amount: subtotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId);

      if (updateError) throw updateError;

      console.log(`✅ Total da venda atualizado na Loja ${storeId}: R$ ${subtotal.toFixed(2)}`);
      
      // Não recarregar todas as mesas, apenas retornar sucesso
      console.log(`✅ Total atualizado sem recarregar mesas`);
    } catch (err) {
      console.error(`❌ Erro ao atualizar total da venda na Loja ${storeId}:`, err);
      throw err;
    }
  }, [storeId, itemsTable, salesTable]);

  const createTableSale = useCallback(async (
    tableId: string,
    operatorName: string,
    customerName?: string,
    customerCount: number = 1
  ): Promise<TableSale> => {
    try {
      console.log(`🚀 Criando venda para mesa da Loja ${storeId}:`, { tableId, operatorName });

      const { data, error } = await supabase
        .from(salesTable)
        .insert([{
          table_id: tableId,
          operator_name: operatorName,
          customer_name: customerName,
          customer_count: customerCount,
          status: 'aberta'
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Venda criada na Loja ${storeId}:`, data);
      await fetchTables(); // Recarregar mesas
      return data;
    } catch (err) {
      console.error(`❌ Erro ao criar venda na Loja ${storeId}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar venda');
    }
  }, [storeId, salesTable, fetchTables]);

  const addItemToSale = useCallback(async (
    saleId: string,
    item: TableCartItem
  ): Promise<TableSaleItem> => {
    try {
      console.log(`➕ Adicionando item à venda da Loja ${storeId}:`, { saleId, item });

      // Validar dados do item
      if (!item.product_code || !item.product_name || !item.subtotal) {
        throw new Error('Dados do item inválidos');
      }

      // Verificar se a venda existe
      const { data: saleExists, error: saleError } = await supabase
        .from(salesTable)
        .select('id')
        .eq('id', saleId)
        .single();

      if (saleError || !saleExists) {
        throw new Error('Venda não encontrada');
      }

      const { data, error } = await supabase
        .from(itemsTable)
        .insert([{
          sale_id: saleId,
          product_code: item.product_code,
          product_name: item.product_name,
          quantity: item.quantity,
          weight_kg: item.weight,
          unit_price: item.unit_price,
          price_per_gram: item.price_per_gram,
          discount_amount: 0,
          subtotal: item.subtotal,
          notes: item.notes
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Item inserido no banco:`, data);

      // Atualizar total da venda
      await updateSaleTotal(saleId);
      

      console.log(`✅ Item adicionado à venda da Loja ${storeId}`);
      return data;
    } catch (err) {
      console.error(`❌ Erro ao adicionar item na Loja ${storeId}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao adicionar item');
    }
  }, [storeId, itemsTable, salesTable, updateSaleTotal, fetchTables]);

  const closeSale = useCallback(async (
    saleId: string,
    paymentType: TableSale['payment_type'],
    changeAmount: number = 0,
    discountAmount: number = 0
  ): Promise<void> => {
    try {
      console.log(`🔒 Fechando venda da Loja ${storeId}:`, { saleId, paymentType });

      // Buscar venda atual
      const { data: sale, error: saleError } = await supabase
        .from(salesTable)
        .select('subtotal')
        .eq('id', saleId)
        .single();

      if (saleError) throw saleError;

      const totalAmount = Number(sale.subtotal) - discountAmount;

      const { error } = await supabase
        .from(salesTable)
        .update({
          status: 'fechada',
          payment_type: paymentType,
          change_amount: changeAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          closed_at: new Date().toISOString()
        })
        .eq('id', saleId);

      if (error) throw error;

      // Adicionar entrada no caixa se houver caixa aberto
      if (cashRegister.currentRegister && cashRegister.isOpen) {
        try {
          console.log(`💰 Adicionando venda de mesa ao caixa da Loja ${storeId}:`, {
            registerId: cashRegister.currentRegister.id,
            amount: totalAmount,
            paymentType
          });
          
          const paymentMethodName = getPaymentMethodName(paymentType);
          
          await supabase
            .from(cashEntriesTable)
            .insert([{
              register_id: cashRegister.currentRegister.id,
              type: 'income',
              amount: totalAmount,
              description: `Venda Mesa - Loja ${storeId} (${paymentMethodName})`,
              payment_method: paymentType
            }]);
            
          console.log(`✅ Entrada de caixa criada para venda de mesa da Loja ${storeId}`);
          
          // Atualizar dados do caixa
          await cashRegister.refreshData();
        } catch (cashError) {
          console.error(`⚠️ Erro ao adicionar entrada no caixa da Loja ${storeId} (venda salva):`, cashError);
          // Não falhar a venda se houver erro no caixa
        }
      } else {
        console.warn(`⚠️ Nenhum caixa aberto na Loja ${storeId} - venda não registrada no caixa`);
      }
      console.log(`✅ Venda fechada na Loja ${storeId}`);
      await fetchTables(); // Recarregar mesas
    } catch (err) {
      console.error(`❌ Erro ao fechar venda na Loja ${storeId}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao fechar venda');
    }
  }, [storeId, salesTable, fetchTables, cashRegister, cashEntriesTable]);

  const getSaleDetails = useCallback(async (saleId: string): Promise<TableSale | null> => {
    try {
      console.log(`🔍 Buscando detalhes da venda ${saleId} na Loja ${storeId}...`);
      
      const { data, error } = await supabase
        .from(salesTable)
        .select(`
          *,
          items:${itemsTable}(*)
        `)
        .eq('id', saleId)
        .single();

      if (error) {
        console.error(`❌ Erro ao buscar venda ${saleId}:`, error);
        throw error;
      }
      
      console.log(`✅ Detalhes da venda carregados:`, data);
      return data;
    } catch (err) {
      console.error(`❌ Erro ao buscar detalhes da venda na Loja ${storeId}:`, err);
      return null;
    }
  }, [storeId, salesTable, itemsTable]);

  const updateTableStatus = useCallback(async (
    tableId: string,
    status: RestaurantTable['status']
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from(tablesTable)
        .update({ status })
        .eq('id', tableId);

      if (error) throw error;

      console.log(`✅ Status da mesa atualizado na Loja ${storeId}: ${status}`);
      await fetchTables();
    } catch (err) {
      console.error(`❌ Erro ao atualizar status da mesa na Loja ${storeId}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar status da mesa');
    }
  }, [storeId, tablesTable, fetchTables]);

  // Configurar realtime para atualizações automáticas
  useEffect(() => {
    fetchTables();

    const channel = supabase
      .channel(`table_sales_store${storeId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: tablesTable },
        () => {
          console.log(`🔄 Mesas da Loja ${storeId} atualizadas via realtime`);
          fetchTables();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: salesTable },
        () => {
          console.log(`🔄 Vendas da Loja ${storeId} atualizadas via realtime`);
          fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, fetchTables, tablesTable, salesTable]);

  return {
    tables,
    loading,
    error,
    createTableSale,
    addItemToSale,
    closeSale,
    getSaleDetails,
    updateTableStatus,
    refetch: fetchTables,
    
  };
};

// Helper function to get payment method display name
const getPaymentMethodName = (method: string): string => {
  const methodNames: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao_credito': 'Cartão de Crédito',
    'cartao_debito': 'Cartão de Débito',
    'voucher': 'Voucher',
    'misto': 'Pagamento Misto'
  };
  return methodNames[method] || method;
};