import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Store2Hours {
  id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
  created_at: string;
  updated_at: string;
}

export interface Store2Settings {
  id: string;
  store_name: string;
  phone: string;
  cnpj?: string;
  address: string;
  is_open_now: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store2Status {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  currentDay: string;
}

export const useStore2Hours = () => {
  const [storeHours, setStoreHours] = useState<Store2Hours[]>([]);
  const [storeSettings, setStoreSettings] = useState<Store2Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreHours = useCallback(async () => {
    try {
      console.log('🔄 Carregando horários da Loja 2...');
      const { data, error } = await supabase
        .from('store2_hours')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      setStoreHours(data || []);
      console.log('✅ Horários da Loja 2 carregados:', data?.length || 0);
    } catch (err) {
      console.error('❌ Erro ao carregar horários da Loja 2:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
    }
  }, []);

  const fetchStoreSettings = useCallback(async () => {
    try {
      console.log('🔄 Carregando configurações da Loja 2...');
      const { data, error } = await supabase
        .from('store2_settings')
        .select('*')
        .eq('id', 'loja2')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStoreSettings(data);
      console.log('✅ Configurações da Loja 2 carregadas:', data);
    } catch (err) {
      console.error('❌ Erro ao carregar configurações da Loja 2:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    }
  }, []);

  const updateStoreHours = useCallback(async (dayOfWeek: number, hours: Partial<Store2Hours>) => {
    try {
      console.log('💾 Salvando horário da Loja 2:', { dayOfWeek, hours });
      const { data, error } = await supabase
        .from('store2_hours')
        .upsert({
          day_of_week: dayOfWeek,
          ...hours,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'day_of_week'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setStoreHours(prev => {
        const updated = prev.filter(h => h.day_of_week !== dayOfWeek);
        return [...updated, data].sort((a, b) => a.day_of_week - b.day_of_week);
      });

      console.log('✅ Horário da Loja 2 salvo:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro ao salvar horário da Loja 2:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar horário');
    }
  }, []);

  const updateStoreSettings = useCallback(async (settings: Partial<Store2Settings>) => {
    try {
      console.log('💾 Salvando configurações da Loja 2:', settings);
      const { data, error } = await supabase
        .from('store2_settings')
        .upsert({
          id: 'loja2',
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) throw error;
      
      setStoreSettings(data);
      console.log('✅ Configurações da Loja 2 salvas:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro ao salvar configurações da Loja 2:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
    }
  }, []);

  const getStore2Status = useCallback((): Store2Status => {
    const agora = new Date();
    const brasiliaOffset = -3;
    const utc = agora.getTime() + (agora.getTimezoneOffset() * 60000);
    const brasilia = new Date(utc + (brasiliaOffset * 3600000));
    
    const currentDay = brasilia.getDay();
    const currentTime = brasilia.getHours() * 60 + brasilia.getMinutes();

    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    console.log('🕒 Verificando status da Loja 2:', {
      currentDay: dayNames[currentDay],
      currentTime: `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`,
      manualControl: storeSettings?.is_open_now
    });
    
    // Verificar se a loja está manualmente fechada
    if (storeSettings && !storeSettings.is_open_now) {
      console.log('🔴 Loja 2 manualmente fechada');
      return {
        isOpen: false,
        message: 'Loja 2 temporariamente fechada',
        currentDay: dayNames[currentDay]
      };
    }

    // Buscar horário do dia atual
    const todayHours = storeHours.find(h => h.day_of_week === currentDay);
    console.log('📋 Horário de hoje da Loja 2:', todayHours);

    if (!todayHours || !todayHours.is_open) {
      console.log('🔴 Loja 2 fechada hoje');
      return {
        isOpen: false,
        message: 'Loja 2 fechada hoje',
        currentDay: dayNames[currentDay]
      };
    }

    // Verificar se está dentro do horário
    const [openHour, openMinute] = todayHours.open_time.split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.close_time.split(':').map(Number);
    
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    const cruzaMeiaNoite = closeTime < openTime;
    
    let isOpen = false;
    if (cruzaMeiaNoite) {
      isOpen = currentTime >= openTime || currentTime < closeTime;
    } else {
      isOpen = currentTime >= openTime && currentTime < closeTime;
    }
    
    console.log(`🏪 Status final da Loja 2: ${isOpen ? 'ABERTA' : 'FECHADA'}`);

    if (isOpen) {
      return {
        isOpen: true,
        message: `Loja 2 aberta até ${todayHours.close_time}`,
        currentDay: dayNames[currentDay]
      };
    } else {
      if (currentTime < openTime) {
        const minutesUntilOpen = openTime - currentTime;
        const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
        const remainingMinutes = minutesUntilOpen % 60;

        let timeMessage = '';
        if (hoursUntilOpen > 0) {
          timeMessage = `${hoursUntilOpen}h`;
          if (remainingMinutes > 0) {
            timeMessage += ` e ${remainingMinutes}min`;
          }
        } else {
          timeMessage = `${remainingMinutes}min`;
        }

        return {
          isOpen: false,
          message: `Loja 2 abre em ${timeMessage}`,
          nextOpenTime: todayHours.open_time,
          currentDay: dayNames[currentDay]
        };
      } else {
        return {
          isOpen: false,
          message: 'Loja 2 fechada hoje',
          currentDay: dayNames[currentDay]
        };
      }
    }
  }, [storeHours, storeSettings]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStoreHours(), fetchStoreSettings()]);
    } catch (err) {
      console.error('Erro ao recarregar dados da Loja 2:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchStoreHours, fetchStoreSettings]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStoreHours(), fetchStoreSettings()]);
      } catch (err) {
        console.error('Erro ao carregar dados da Loja 2:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStoreHours, fetchStoreSettings]);

  // Configurar realtime para atualizações automáticas
  useEffect(() => {
    const store2Channel = supabase
      .channel('store2_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'store2_hours' },
        () => {
          console.log('🔄 Horários da Loja 2 atualizados, recarregando...');
          fetchStoreHours();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'store2_settings' },
        () => {
          console.log('🔄 Configurações da Loja 2 atualizadas, recarregando...');
          fetchStoreSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(store2Channel);
    };
  }, [fetchStoreHours, fetchStoreSettings]);

  return {
    storeHours,
    storeSettings,
    loading,
    error,
    updateStoreHours,
    updateStoreSettings,
    getStore2Status,
    refreshData,
    refetch: refreshData
  };
};