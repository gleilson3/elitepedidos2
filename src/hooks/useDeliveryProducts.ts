import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DeliveryProduct {
  id: string;
  name: string;
  category: 'acai' | 'combo' | 'milkshake' | 'vitamina' | 'sorvetes' | 'bebidas' | 'complementos' | 'sobremesas' | 'outros';
  price: number;
  original_price?: number;
  description: string;
  image_url?: string;
  is_active: boolean;
  is_weighable: boolean;
  price_per_gram?: number;
  complement_groups?: any;
  sizes?: any;
  scheduled_days?: any;
  availability_type?: string;
  created_at: string;
  updated_at: string;
}

export const useDeliveryProducts = () => {
  const [products, setProducts] = useState<DeliveryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
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
        console.warn('⚠️ Supabase não configurado - usando produtos de demonstração');
        
        // Fallback para produtos de demonstração se Supabase não estiver configurado
        const { products: demoProducts } = await import('../data/products');
        const mappedProducts = demoProducts.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category as DeliveryProduct['category'],
          price: product.price,
          original_price: product.originalPrice,
          description: product.description,
          image_url: product.image,
          is_active: product.isActive !== false,
          is_weighable: product.is_weighable || false,
          price_per_gram: product.pricePerGram,
          complement_groups: product.complementGroups,
          sizes: product.sizes,
          scheduled_days: product.scheduledDays,
          availability_type: product.availability?.type || 'always',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setProducts(mappedProducts);
        setLoading(false);
        return;
      }
      
      console.log('🔄 Carregando produtos do banco de dados...');
      
      // Add timeout and retry logic for Supabase requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Conexão com Supabase demorou mais de 10 segundos')), 10000);
      });
      
      const fetchPromise = supabase
        .from('delivery_products')
        .select('*')
        .order('name');
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      console.log(`✅ ${data?.length || 0} produtos carregados do banco`);
      setProducts(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar produtos:', err);
      
      // Handle different types of errors gracefully
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        console.warn('🌐 Erro de conectividade - usando produtos de demonstração');
        setError('Sem conexão com o servidor - usando modo offline');
        
        // Load demo products as fallback
        try {
          const { products: demoProducts } = await import('../data/products');
          const mappedProducts = demoProducts.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category as DeliveryProduct['category'],
            price: product.price,
            original_price: product.originalPrice,
            description: product.description,
            image_url: product.image,
            is_active: product.isActive !== false,
            is_weighable: product.is_weighable || false,
            price_per_gram: product.pricePerGram,
            complement_groups: product.complementGroups,
            sizes: product.sizes,
            scheduled_days: product.scheduledDays,
            availability_type: product.availability?.type || 'always',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
          setProducts(mappedProducts);
        } catch (importError) {
          console.error('❌ Erro ao carregar produtos de demonstração:', importError);
          setProducts([]);
        }
      } else if (err instanceof Error && err.message.includes('Timeout')) {
        console.warn('⏱️ Timeout na conexão - usando produtos de demonstração');
        setError('Conexão lenta - usando modo offline');
        
        // Load demo products as fallback for timeout
        try {
          const { products: demoProducts } = await import('../data/products');
          const mappedProducts = demoProducts.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category as DeliveryProduct['category'],
            price: product.price,
            original_price: product.originalPrice,
            description: product.description,
            image_url: product.image,
            is_active: product.isActive !== false,
            is_weighable: product.is_weighable || false,
            price_per_gram: product.pricePerGram,
            complement_groups: product.complementGroups,
            sizes: product.sizes,
            scheduled_days: product.scheduledDays,
            availability_type: product.availability?.type || 'always',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
          setProducts(mappedProducts);
        } catch (importError) {
          console.error('❌ Erro ao carregar produtos de demonstração:', importError);
          setProducts([]);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos';
        setError(errorMessage);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Omit<DeliveryProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🚀 Criando produto:', product);
      
      const { data, error } = await supabase
        .from('delivery_products')
        .insert([{
          ...product,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [...prev, data]);
      console.log('✅ Produto criado:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar produto:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar produto');
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<DeliveryProduct>) => {
    try {
      console.log('✏️ Atualizando produto:', id, updates);

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase não configurado. Configure as variáveis de ambiente para usar esta funcionalidade.');
      }

      // 1. First check if the product exists in the database
      const { data: existingProduct, error: checkError } = await supabase
        .from('delivery_products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erro ao verificar produto existente:', checkError);
        throw new Error(`Erro ao verificar produto: ${checkError.message}`);
      }

      if (!existingProduct) {
        console.error('❌ Produto não encontrado no banco:', id);
        console.log('🔍 Produtos disponíveis no estado local:', products.map(p => ({ id: p.id, name: p.name })));
        
        // Try to refresh products from database
        console.log('🔄 Tentando recarregar produtos do banco...');
        await fetchProducts();
        
        throw new Error(`Produto com ID ${id} não foi encontrado no banco de dados. O produto pode ter sido excluído ou criado apenas localmente. Tente recarregar a página.`);
      }

      console.log('✅ Produto encontrado no banco:', existingProduct);

      // 2. Prepare clean update data
      const { created_at, updated_at, has_complements, ...cleanUpdates } = updates as any;

      // 3. Remove undefined values and add updated_at
      const safeUpdate = Object.fromEntries(
        Object.entries({
          ...cleanUpdates,
          updated_at: new Date().toISOString()
        }).filter(([, value]) => value !== undefined)
      );

      console.log('📝 Dados para atualização:', {
        id,
        safeUpdate,
        originalUpdates: updates
      });

      // 4. Perform the update
      const { data, error } = await supabase
        .from('delivery_products')
        .update(safeUpdate)
        .eq('id', id)
        .select('*');

      if (error) {
        console.error('❌ Erro ao atualizar produto:', error);
        throw new Error(`Erro ao atualizar produto: ${error.message || 'Erro desconhecido'}`);
      }

      if (!data || data.length === 0) {
        // No rows were updated - values were already the same
        console.log('ℹ️ Nenhuma linha foi atualizada - valores já eram os mesmos');
        
        // Return the existing product with updates applied
        const updatedProduct = {
          ...existingProduct,
          ...cleanUpdates,
          updated_at: new Date().toISOString()
        };
        
        // Update local state
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        
        console.log('✅ Produto atualizado localmente (sem mudanças no banco)');
        return updatedProduct;
      }

      const updatedProduct = data[0];
      console.log('✅ Produto atualizado no banco:', updatedProduct);

      // Update local state
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
      console.log('✅ Estado local atualizado');
      return updatedProduct;

    } catch (err) {
      console.error('❌ Erro ao atualizar produto:', err);
      throw err;
    }
  }, [fetchProducts, products]);

  const syncWithDatabase = useCallback(async () => {
    console.log('🔄 Sincronizando produtos com banco de dados...');
    console.log('📊 Estado atual dos produtos:', products.length);
    await fetchProducts();
    console.log('✅ Sincronização concluída');
  }, [fetchProducts, products]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Excluindo produto:', id);
      
      const { error } = await supabase
        .from('delivery_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      console.log('✅ Produto excluído');
    } catch (err) {
      console.error('❌ Erro ao excluir produto:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir produto');
    }
  }, []);

  // Configurar subscription em tempo real
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    // Verificar se Supabase está configurado
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseKey === 'your_supabase_anon_key_here' ||
        supabaseUrl.includes('placeholder')) {
      console.log('⚠️ Supabase não configurado - subscription em tempo real desabilitada');
    } else {
      console.log('🔄 Configurando subscription em tempo real para produtos...');
      
      channel = supabase
        .channel('delivery_products_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_products'
          },
          (payload) => {
            console.log('📡 Mudança detectada na tabela delivery_products:', payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                if (payload.new) {
                  console.log('➕ Produto adicionado:', payload.new);
                  setProducts(prev => {
                    // Verificar se o produto já existe para evitar duplicatas
                    const exists = prev.some(p => p.id === payload.new.id);
                    if (exists) return prev;
                    return [...prev, payload.new as DeliveryProduct];
                  });
                }
                break;
                
              case 'UPDATE':
                if (payload.new) {
                  console.log('✏️ Produto atualizado:', payload.new);
                  setProducts(prev => 
                    prev.map(p => 
                      p.id === payload.new.id ? payload.new as DeliveryProduct : p
                    )
                  );
                }
                break;
                
              case 'DELETE':
                if (payload.old) {
                  console.log('🗑️ Produto removido:', payload.old);
                  setProducts(prev => 
                    prev.filter(p => p.id !== payload.old.id)
                  );
                }
                break;
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Status da subscription:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscription em tempo real ativa para produtos');
          }
        });
    }

    // Cleanup function
    return () => {
      if (channel) {
        console.log('🔌 Desconectando subscription em tempo real...');
        channel.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
    syncWithDatabase
  };
};