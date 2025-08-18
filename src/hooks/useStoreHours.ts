import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { StoreHours, StoreSettings, StoreStatus } from '../types/store';

export const useStoreHours = () => {
  const [storeHours, setStoreHours] = useState<StoreHours[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreHours = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('store_hours')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      setStoreHours(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
    }
  }, []);

  const fetchStoreSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStoreSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    }
  }, []);

  const updateStoreHours = useCallback(async (dayOfWeek: number, hours: Partial<StoreHours>) => {
    try {
      const { data, error } = await supabase
        .from('store_hours')
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

      // Atualizar estado local imediatamente
      setStoreHours(prev => {
        const updated = prev.filter(h => h.day_of_week !== dayOfWeek);
        return [...updated, data].sort((a, b) => a.day_of_week - b.day_of_week);
      });

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar horário');
    }
  }, []);

  const updateStoreSettings = useCallback(async (settings: Partial<StoreSettings>) => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert({
          id: storeSettings?.id || 'default',
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar estado local imediatamente
      setStoreSettings(data);
      
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
    }
  }, [storeSettings]);

  // Função CORRIGIDA para verificar se a loja está aberta (com suporte a horários que cruzam meia-noite)
  const isLojaAberta = useCallback((horarioAbertura: string, horarioFechamento: string): boolean => {
    // Usar horário de Brasília
    const agora = new Date();
    const brasiliaOffset = -3; // UTC-3
    const utc = agora.getTime() + (agora.getTimezoneOffset() * 60000);
    const brasilia = new Date(utc + (brasiliaOffset * 3600000));
    
    const horaAtual = brasilia.getHours();
    const minutoAtual = brasilia.getMinutes();

    // Converter horários string para minutos desde meia-noite
    const [horaAbertura, minutoAbertura] = horarioAbertura.split(":").map(Number);
    const [horaFechamento, minutoFechamento] = horarioFechamento.split(":").map(Number);

    const minutosAgora = horaAtual * 60 + minutoAtual;
    const minutosAbertura = horaAbertura * 60 + minutoAbertura;
    const minutosFechamento = horaFechamento * 60 + minutoFechamento;

    console.log(`🕐 Horário atual: ${horaAtual}:${minutoAtual.toString().padStart(2, '0')} (${minutosAgora} min)`);
    console.log(`🟢 Abertura: ${horarioAbertura} (${minutosAbertura} min)`);
    console.log(`🔴 Fechamento: ${horarioFechamento} (${minutosFechamento} min)`);

    // CORREÇÃO: Verificar se o horário cruza a meia-noite
    const cruzaMeiaNoite = minutosFechamento < minutosAbertura;
    
    if (cruzaMeiaNoite) {
      console.log('🌙 Horário cruza meia-noite');
      // Exemplo: Abre 16:00 (960 min) e fecha 00:58 (58 min)
      // Está aberto se:
      // 1. Horário atual >= abertura (ex: 16:00 até 23:59) OU
      // 2. Horário atual < fechamento (ex: 00:00 até 00:58)
      const isOpen = minutosAgora >= minutosAbertura || minutosAgora < minutosFechamento;
      console.log(`✅ Resultado (cruza meia-noite): ${isOpen ? 'ABERTA' : 'FECHADA'}`);
      return isOpen;
    } else {
      console.log('☀️ Horário normal (mesmo dia)');
      // Horário normal no mesmo dia (ex: 08:00 às 22:00)
      const isOpen = minutosAgora >= minutosAbertura && minutosAgora < minutosFechamento;
      console.log(`✅ Resultado (mesmo dia): ${isOpen ? 'ABERTA' : 'FECHADA'}`);
      return isOpen;
    }
  }, []);

  const getStoreStatus = useCallback((): StoreStatus => {
    // Usar horário de Brasília
    const agora = new Date();
    const brasiliaOffset = -3; // UTC-3
    const utc = agora.getTime() + (agora.getTimezoneOffset() * 60000);
    const brasilia = new Date(utc + (brasiliaOffset * 3600000));
    
    const currentDay = brasilia.getDay();
    const currentTime = brasilia.getHours() * 60 + brasilia.getMinutes();

    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    // Debug: Log do horário atual
    console.log('🕒 Horário atual (Brasília):', brasilia.toLocaleTimeString('pt-BR'));
    console.log('📅 Dia da semana:', dayNames[currentDay]);
    
    // Verificar se a loja está manualmente fechada
    if (storeSettings && !storeSettings.is_open_now) {
      console.log('🔴 Loja manualmente fechada');
      return {
        isOpen: false,
        message: 'Loja temporariamente fechada',
        currentDay: dayNames[currentDay]
      };
    }

    // Buscar horário do dia atual
    const todayHours = storeHours.find(h => h.day_of_week === currentDay);
    console.log('📋 Horário de hoje:', todayHours);

    if (!todayHours || !todayHours.is_open) {
      console.log('🔴 Loja fechada hoje ou horário não configurado');
      // Buscar próximo dia que abre
      const nextOpenDay = findNextOpenDay(currentDay);
      return {
        isOpen: false,
        message: nextOpenDay.message,
        nextOpenTime: nextOpenDay.time,
        currentDay: dayNames[currentDay]
      };
    }

    // Verificar se está dentro do horário usando a função CORRIGIDA
    const isOpen = isLojaAberta(todayHours.open_time, todayHours.close_time);
    
    console.log(`⏰ Horário configurado: ${todayHours.open_time} - ${todayHours.close_time}`);
    console.log(`🏪 Status final: ${isOpen ? 'ABERTA' : 'FECHADA'}`);

    if (isOpen) {
      // Verificar se cruza meia-noite para mostrar mensagem correta
      const [closeHour, closeMinute] = todayHours.close_time.split(':').map(Number);
      const closeTime = closeHour * 60 + closeMinute;
      const [openHour, openMinute] = todayHours.open_time.split(':').map(Number);
      const openTime = openHour * 60 + openMinute;
      
      const cruzaMeiaNoite = closeTime < openTime;
      
      if (cruzaMeiaNoite) {
        // Cruza meia-noite
        if (currentTime >= openTime) {
          // Estamos no período da tarde/noite (ex: 16:00-23:59)
          return {
            isOpen: true,
            message: `Aberto até ${todayHours.close_time} (madrugada)`,
            currentDay: dayNames[currentDay]
          };
        } else {
          // Estamos no período da madrugada (ex: 00:00-00:58)
          return {
            isOpen: true,
            message: `Aberto até ${todayHours.close_time}`,
            currentDay: dayNames[currentDay]
          };
        }
      } else {
        // Horário normal
        return {
          isOpen: true,
          message: `Aberto até ${todayHours.close_time}`,
          currentDay: dayNames[currentDay]
        };
      }
    } else {
      // Loja fechada - calcular quando abre novamente
      const [openHour, openMinute] = todayHours.open_time.split(':').map(Number);
      const [closeHour, closeMinute] = todayHours.close_time.split(':').map(Number);
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;

      const cruzaMeiaNoite = closeTime < openTime;

      if (cruzaMeiaNoite) {
        // Horário cruza meia-noite
        if (currentTime < closeTime) {
          // Estamos antes do fechamento (madrugada), mas a loja já fechou
          // Isso não deveria acontecer se a lógica estiver correta
          const nextOpenDay = findNextOpenDay(currentDay);
          return {
            isOpen: false,
            message: nextOpenDay.message,
            nextOpenTime: nextOpenDay.time,
            currentDay: dayNames[currentDay]
          };
        } else if (currentTime < openTime) {
          // Estamos entre o fechamento e a abertura do mesmo dia
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
            message: `Abrimos em ${timeMessage}`,
            nextOpenTime: todayHours.open_time,
            currentDay: dayNames[currentDay]
          };
        } else {
          // Estamos após a abertura, mas antes da meia-noite
          // A loja deveria estar aberta, mas não está
          // Buscar próximo dia
          const nextOpenDay = findNextOpenDay(currentDay);
          return {
            isOpen: false,
            message: nextOpenDay.message,
            nextOpenTime: nextOpenDay.time,
            currentDay: dayNames[currentDay]
          };
        }
      } else {
        // Horário normal (não cruza meia-noite)
        if (currentTime < openTime) {
          // Ainda vai abrir hoje
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
            message: `Abrimos em ${timeMessage}`,
            nextOpenTime: todayHours.open_time,
            currentDay: dayNames[currentDay]
          };
        } else {
          // Já fechou hoje, buscar próximo dia
          const nextOpenDay = findNextOpenDay(currentDay);
          return {
            isOpen: false,
            message: nextOpenDay.message,
            nextOpenTime: nextOpenDay.time,
            currentDay: dayNames[currentDay]
          };
        }
      }
    }
  }, [storeHours, storeSettings, isLojaAberta]);

  const findNextOpenDay = (currentDay: number) => {
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayHours = storeHours.find(h => h.day_of_week === checkDay);
      
      if (dayHours && dayHours.is_open) {
        const dayName = dayNames[checkDay];
        const message = i === 1 ? `Abrimos amanhã às ${dayHours.open_time}` : `Abrimos ${dayName} às ${dayHours.open_time}`;
        
        return {
          message,
          time: dayHours.open_time,
          day: dayName
        };
      }
    }

    return {
      message: 'Horários não configurados',
      time: undefined,
      day: 'Indefinido'
    };
  };

  const initializeDefaultHours = useCallback(async () => {
    try {
      const defaultHours = [
        { day_of_week: 0, is_open: true, open_time: '10:00', close_time: '20:00' }, // Domingo
        { day_of_week: 1, is_open: true, open_time: '08:00', close_time: '22:00' }, // Segunda
        { day_of_week: 2, is_open: true, open_time: '08:00', close_time: '22:00' }, // Terça
        { day_of_week: 3, is_open: true, open_time: '08:00', close_time: '22:00' }, // Quarta
        { day_of_week: 4, is_open: true, open_time: '08:00', close_time: '22:00' }, // Quinta
        { day_of_week: 5, is_open: true, open_time: '08:00', close_time: '22:00' }, // Sexta
        { day_of_week: 6, is_open: true, open_time: '08:00', close_time: '23:00' }, // Sábado
      ];

      for (const hours of defaultHours) {
        await updateStoreHours(hours.day_of_week, hours);
      }

      // Configurações padrão da loja
      if (!storeSettings) {
        await updateStoreSettings({
          store_name: 'Elite Açaí',
          cnpj: '38.130.139/0001-22',
          phone: '(85) 98904-1010',
          address: 'Rua das Frutas, 123 - Centro, Fortaleza/CE',
          delivery_fee: 5.00,
          min_order_value: 15.00,
          estimated_delivery_time: 35,
          is_open_now: true
        });
      }
    } catch (err) {
      console.error('Erro ao inicializar horários padrão:', err);
    }
  }, [updateStoreHours, updateStoreSettings, storeSettings]);

  // Função para forçar atualização dos dados
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStoreHours(), fetchStoreSettings()]);
    } catch (err) {
      console.error('Erro ao recarregar dados:', err);
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
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStoreHours, fetchStoreSettings]);

  // Inicializar horários padrão se não existirem
  useEffect(() => {
    if (!loading && storeHours.length === 0) {
      initializeDefaultHours();
    }
  }, [loading, storeHours.length, initializeDefaultHours]);

  // Configurar realtime para atualizações automáticas
  useEffect(() => {
    const storeHoursChannel = supabase
      .channel('store_hours_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'store_hours' },
        () => {
          console.log('Horários atualizados no banco, recarregando...');
          fetchStoreHours();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        () => {
          console.log('Configurações atualizadas no banco, recarregando...');
          fetchStoreSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storeHoursChannel);
    };
  }, [fetchStoreHours, fetchStoreSettings]);

  // Atualizar status a cada minuto para manter sincronizado
  useEffect(() => {
    const interval = setInterval(() => {
      // Força uma re-renderização para atualizar o status baseado no horário atual
      setStoreHours(prev => [...prev]);
    }, 60000); // A cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  return {
    storeHours,
    storeSettings,
    loading,
    error,
    updateStoreHours,
    updateStoreSettings,
    getStoreStatus,
    refreshData,
    refetch: refreshData
  };
};