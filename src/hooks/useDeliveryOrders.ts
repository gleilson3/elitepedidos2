import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DeliveryOrder } from '../types/delivery-driver';

export const useDeliveryOrders = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para calcular o início da semana (segunda-feira às 10h)
  const getWeekStart = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = domingo, 1 = segunda, etc.
    const currentHour = now.getHours();
    
    // Calcular quantos dias voltar para chegar na segunda-feira
    let daysToSubtract = currentDay === 0 ? 6 : currentDay - 1; // Se domingo, volta 6 dias; senão volta (dia - 1)
    
    // Se é segunda-feira mas ainda não passou das 10h, usar a segunda anterior
    if (currentDay === 1 && currentHour < 10) {
      daysToSubtract = 7;
    }
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(10, 0, 0, 0); // 10:00:00.000
    
    return weekStart;
  };

  // Função para calcular o fim da semana (próxima segunda às 09:59:59)
  const getWeekEnd = () => {
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7); // Próxima segunda
    weekEnd.setHours(9, 59, 59, 999); // 09:59:59.999
    
    return weekEnd;
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Buscando pedidos de delivery...');

      // Get current week range (Monday 10h to next Monday 09:59)
      const weekStart = getWeekStart();
      const weekEnd = getWeekEnd();
      
      console.log('📅 Período da semana:', {
        inicio: weekStart.toLocaleString('pt-BR'),
        fim: weekEnd.toLocaleString('pt-BR')
      });

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'cancelled')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      console.log(`✅ ${data?.length || 0} pedidos da semana carregados`);
    } catch (err) {
      console.error('❌ Erro ao carregar pedidos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for order changes
    const channel = supabase
      .channel('delivery_orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('🔔 Novo pedido confirmado via realtime:', payload);
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('🔄 Pedido atualizado via realtime:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders
  };
};