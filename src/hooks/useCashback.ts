import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Customer, CashbackTransaction, CustomerBalance } from '../types/cashback';

export const useCashback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrCreateCustomer = useCallback(async (phone: string, name?: string): Promise<Customer> => {
    try {
      setLoading(true);
      setError(null);

      // Chamar função do banco para buscar ou criar cliente
      const { data, error } = await supabase.rpc('get_or_create_customer', {
        customer_phone: phone,
        customer_name: name
      });

      if (error) throw error;

      // Buscar dados completos do cliente
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data)
        .single();

      if (customerError) throw customerError;

      return customer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar/criar cliente';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerBalance = useCallback(async (customerId: string): Promise<CustomerBalance> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customer_balances')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar saldo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerByPhone = useCallback(async (phone: string): Promise<Customer | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone);

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar cliente';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPurchaseTransaction = useCallback(async (
    customerId: string,
    amount: number,
    orderId?: string,
    storeId?: string
  ): Promise<CashbackTransaction> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          customer_id: customerId,
          amount,
          type: 'purchase',
          status: 'approved',
          comment: orderId ? `Pedido: ${orderId}` : undefined,
          store_id: storeId
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRedemptionTransaction = useCallback(async (
    customerId: string,
    amount: number,
    orderId?: string
  ): Promise<CashbackTransaction> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          customer_id: customerId,
          amount,
          type: 'redemption',
          status: 'approved',
          comment: orderId ? `Resgate no pedido: ${orderId}` : 'Resgate de cashback'
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resgatar cashback';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerTransactions = useCallback(async (
    customerId: string,
    limit: number = 50
  ): Promise<CashbackTransaction[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar transações';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCustomersByName = useCallback(async (name: string): Promise<Customer[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .ilike('name', `%${name}%`)
        .limit(10)
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar clientes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCashbackAmount = useCallback(async (
    customerId: string,
    amount: number
  ): Promise<{ valid: boolean; availableBalance: number; message: string }> => {
    try {
      const balance = await getCustomerBalance(customerId);
      
      // Round both values to 2 decimal places for consistent comparison
      const roundedAmount = Math.round(amount * 100) / 100;
      const roundedBalance = Math.round(balance.available_balance * 100) / 100;
      
      if (roundedBalance >= roundedAmount) {
        return {
          valid: true,
          availableBalance: roundedBalance,
          message: 'Saldo suficiente'
        };
      } else {
        return {
          valid: false,
          availableBalance: roundedBalance,
          message: `Saldo insuficiente. Disponível: R$ ${roundedBalance.toFixed(2)}`
        };
      }
    } catch (err) {
      return {
        valid: false,
        availableBalance: 0,
        message: 'Erro ao validar saldo'
      };
    }
  }, [getCustomerBalance]);

  return {
    loading,
    error,
    getOrCreateCustomer,
    getCustomerBalance,
    getCustomerByPhone,
    createPurchaseTransaction,
    createRedemptionTransaction,
    getCustomerTransactions,
    searchCustomersByName,
    validateCashbackAmount
  };
};