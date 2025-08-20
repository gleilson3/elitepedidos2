import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PaymentPartial, MixedPaymentData, PaymentFormData, PaymentSummary } from '../types/mixed-payment';

export const useMixedPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'voucher': 'Voucher'
    };
    return labels[method] || method;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getOrderPayments = useCallback(async (orderId: string): Promise<PaymentPartial[]> => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('pdv_order_payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar pagamentos');
      return [];
    }
  }, []);

  const addPaymentPartial = useCallback(async (
    orderId: string, 
    paymentData: PaymentFormData
  ): Promise<PaymentPartial | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('💳 Adicionando pagamento parcial:', {
        orderId,
        paymentData
      });

      const { data, error } = await supabase
        .from('pdv_order_payments')
        .insert([{
          order_id: orderId,
          payment_type: paymentData.payment_type,
          amount: paymentData.amount,
          notes: paymentData.notes,
          status: 'confirmed'
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Pagamento parcial adicionado:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar pagamento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removePaymentPartial = useCallback(async (paymentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('pdv_order_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      console.log('✅ Pagamento parcial removido:', paymentId);
      return true;
    } catch (err) {
      console.error('❌ Erro ao remover pagamento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover pagamento');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMixedPaymentData = useCallback(async (
    orderId: string, 
    orderTotal: number
  ): Promise<MixedPaymentData> => {
    const payments = await getOrderPayments(orderId);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = Math.max(0, orderTotal - totalPaid);
    const isFullyPaid = totalPaid >= orderTotal;

    return {
      order_id: orderId,
      order_total: orderTotal,
      payments,
      total_paid: totalPaid,
      remaining_amount: remainingAmount,
      is_fully_paid: isFullyPaid
    };
  }, [getOrderPayments]);

  const getPaymentSummary = useCallback((payments: PaymentPartial[]): PaymentSummary => {
    const summary: PaymentSummary = {
      dinheiro: 0,
      pix: 0,
      cartao_credito: 0,
      cartao_debito: 0,
      voucher: 0,
      total: 0
    };

    payments.forEach(payment => {
      if (payment.status === 'confirmed') {
        summary[payment.payment_type] += payment.amount;
        summary.total += payment.amount;
      }
    });

    return summary;
  }, []);

  const validatePaymentAmount = useCallback((
    amount: number, 
    currentTotal: number, 
    orderTotal: number
  ): { isValid: boolean; message?: string } => {
    if (amount <= 0) {
      return { isValid: false, message: 'Valor deve ser maior que zero' };
    }

    if (currentTotal + amount > orderTotal) {
      const maxAmount = orderTotal - currentTotal;
      return { 
        isValid: false, 
        message: `Valor máximo permitido: ${formatPrice(maxAmount)}` 
      };
    }

    return { isValid: true };
  }, []);

  const isOrderFullyPaid = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('is_order_fully_paid', { order_uuid: orderId });

      if (error) throw error;

      return data || false;
    } catch (err) {
      console.error('Erro ao verificar se pedido está pago:', err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    getOrderPayments,
    addPaymentPartial,
    removePaymentPartial,
    getMixedPaymentData,
    getPaymentSummary,
    validatePaymentAmount,
    isOrderFullyPaid,
    getPaymentMethodLabel,
    formatPrice
  };
};