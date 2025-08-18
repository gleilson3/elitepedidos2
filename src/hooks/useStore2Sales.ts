import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PDVProduct } from './usePDV';

export interface Store2Sale {
  id: string;
  sale_number: number;
  operator_id?: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  total_amount: number;
  payment_type: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'voucher' | 'misto';
  payment_details?: any;
  change_amount: number;
  notes?: string;
  is_cancelled: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
  channel: string;
  cash_register_id?: string;
  items?: Store2SaleItem[];
}

export interface Store2SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  weight_kg?: number;
  unit_price?: number;
  price_per_gram?: number;
  discount_amount: number;
  subtotal: number;
  created_at: string;
}

export interface Store2CartItem {
  product: PDVProduct;
  quantity: number;
  weight?: number;
  discount: number;
  subtotal: number;
  notes?: string;
}

export const useStore2Sales = () => {
  const [sales, setSales] = useState<Store2Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Helper function to validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const createSale = useCallback(async (
    saleData: Omit<Store2Sale, 'id' | 'sale_number' | 'created_at' | 'updated_at'>,
    items: Omit<Store2SaleItem, 'id' | 'sale_id' | 'created_at'>[],
    cashRegisterId?: string
  ) => {
    try {
      setLoading(true);
      console.log('🚀 Criando venda na Loja 2:', saleData);

      // Validar e limpar IDs inválidos
      const cleanedSaleData = {
        ...saleData,
        operator_id: saleData.operator_id && isValidUUID(saleData.operator_id) ? saleData.operator_id : undefined,
        cash_register_id: cashRegisterId && isValidUUID(cashRegisterId) ? cashRegisterId : undefined
      };

      // Criar venda
      const { data: sale, error: saleError } = await supabase
        .from('store2_sales')
        .insert([{
          ...cleanedSaleData,
          channel: 'loja2'
        }])
        .select()
        .single();

      if (saleError) throw saleError;
      console.log('✅ Venda da Loja 2 criada:', sale);

      // Criar itens da venda
      const saleItems = items.map(item => ({
        ...item,
        sale_id: sale.id
      }));

      const { error: itemsError } = await supabase
        .from('store2_sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('❌ Erro ao criar itens da venda:', itemsError);
        
        // Tentar deletar a venda para evitar registros órfãos
        try {
          await supabase.from('store2_sales').delete().eq('id', sale.id);
          console.log('🗑️ Venda órfã removida após erro nos itens');
        } catch (cleanupError) {
          console.error('⚠️ Falha ao limpar venda órfã:', cleanupError);
        }
        
        throw new Error(`Erro ao criar itens da venda: ${itemsError.message}`);
      }

      // Adicionar entrada no caixa se houver caixa aberto
      if (cashRegisterId && isValidUUID(cashRegisterId)) {
        try {
          console.log('💰 Adicionando venda ao caixa da Loja 2:', sale.id);
          await supabase
            .from('pdv2_cash_entries')
            .insert([{
              register_id: cashRegisterId,
              type: 'income',
              amount: sale.total_amount,
              description: `Venda #${sale.sale_number} - Loja 2 (${getPaymentMethodName(sale.payment_type)})`,
              payment_method: sale.payment_type
            }]);
          console.log('✅ Entrada de caixa criada para venda da Loja 2');
        } catch (cashError) {
          console.error('⚠️ Erro ao adicionar entrada no caixa (venda salva):', cashError);
        }
      }

      console.log('✅ Itens da venda da Loja 2 criados');
      setSales(prev => [sale, ...prev]);
      return sale;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar venda';
      console.error('❌ Falha na criação da venda da Loja 2:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isValidUUID]);

  const fetchSales = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      console.log('🔄 Carregando vendas da Loja 2...');
      
      const { data, error } = await supabase
        .from('store2_sales')
        .select(`
          *,
          store2_sale_items(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setSales(data || []);
      console.log(`✅ ${data?.length || 0} vendas da Loja 2 carregadas`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar vendas';
      console.error('❌ Erro ao carregar vendas da Loja 2:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSale = useCallback(async (saleId: string, reason: string, operatorId: string) => {
    try {
      console.log('❌ Cancelando venda da Loja 2:', saleId);
      
      const { data, error } = await supabase
        .from('store2_sales')
        .update({
          is_cancelled: true,
          cancelled_at: new Date().toISOString(),
          cancelled_by: operatorId,
          cancel_reason: reason
        })
        .eq('id', saleId)
        .select()
        .single();

      if (error) throw error;
      
      setSales(prev => prev.map(sale => 
        sale.id === saleId ? { ...sale, ...data } : sale
      ));
      
      console.log('✅ Venda da Loja 2 cancelada');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar venda';
      console.error('❌ Erro ao cancelar venda da Loja 2:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    sales,
    loading,
    error,
    createSale,
    fetchSales,
    cancelSale
  };
};

export const useStore2Cart = () => {
  const [items, setItems] = useState<Store2CartItem[]>([]);
  const [discount, setDiscount] = useState<{ type: 'none' | 'percentage' | 'amount'; value: number }>({
    type: 'none',
    value: 0
  });
  const [paymentInfo, setPaymentInfo] = useState<{
    method: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'voucher' | 'misto';
    changeFor?: number;
    customerName?: string;
    customerPhone?: string;
  }>({
    method: 'dinheiro'
  });
  const [splitInfo, setSplitInfo] = useState<{
    enabled: boolean;
    parts: number;
    amounts: number[];
  }>({
    enabled: false,
    parts: 2,
    amounts: []
  });

  const addItem = useCallback((product: PDVProduct, quantity: number, weight?: number) => {
    const existingIndex = items.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      setItems(prev => prev.map((item, index) => {
        if (index === existingIndex) {
          const newQuantity = item.quantity + quantity;
          const newWeight = weight ? (item.weight || 0) + weight : item.weight;
          return {
            ...item,
            quantity: newQuantity,
            weight: newWeight,
            subtotal: calculateItemSubtotal(item.product, newQuantity, newWeight, item.discount)
          };
        }
        return item;
      }));
    } else {
      const newItem: Store2CartItem = {
        product,
        quantity,
        weight,
        discount: 0,
        subtotal: calculateItemSubtotal(product, quantity, weight, 0)
      };
      setItems(prev => [...prev, newItem]);
    }
  }, [items]);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity,
          subtotal: calculateItemSubtotal(item.product, quantity, item.weight, item.discount)
        };
      }
      return item;
    }));
  }, [removeItem]);

  const updateItemWeight = useCallback((productId: string, weight: number) => {
    setItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          weight,
          subtotal: calculateItemSubtotal(item.product, item.quantity, weight, item.discount)
        };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscount({ type: 'none', value: 0 });
    setPaymentInfo({ method: 'dinheiro' });
    setSplitInfo({ enabled: false, parts: 2, amounts: [] });
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  }, [items]);

  const getDiscountAmount = useCallback(() => {
    const subtotal = getSubtotal();
    if (discount.type === 'percentage') {
      return subtotal * (discount.value / 100);
    } else if (discount.type === 'amount') {
      return Math.min(discount.value, subtotal);
    }
    return 0;
  }, [getSubtotal, discount]);

  const getTotal = useCallback(() => {
    return Math.max(0, getSubtotal() - getDiscountAmount());
  }, [getSubtotal, getDiscountAmount]);

  const updatePaymentInfo = useCallback((info: Partial<typeof paymentInfo>) => {
    setPaymentInfo(prev => ({ ...prev, ...info }));
  }, []);

  const updateSplitInfo = useCallback((info: Partial<typeof splitInfo>) => {
    setSplitInfo(prev => ({ ...prev, ...info }));
  }, []);
  return {
    items,
    discount,
    paymentInfo,
    splitInfo,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemWeight,
    setDiscount,
    updatePaymentInfo,
    updateSplitInfo,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    itemCount: items.length,
    totalItems: items.reduce((total, item) => total + item.quantity, 0)
  };
};

// Função auxiliar para calcular subtotal do item
const calculateItemSubtotal = (
  product: PDVProduct, 
  quantity: number, 
  weight?: number, 
  discount: number = 0
): number => {
  let basePrice = 0;
  
  if (product.is_weighable && weight && product.price_per_gram) {
    basePrice = weight * 1000 * product.price_per_gram;
  } else if (!product.is_weighable && product.unit_price) {
    basePrice = quantity * product.unit_price;
  }
  
  return Math.max(0, basePrice - discount);
};