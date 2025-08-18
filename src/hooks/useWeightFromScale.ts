import { useState } from "react";
import { supabase } from "../lib/supabase";

let lastWeightCache = {
  weight: null as number | null,
  timestamp: 0,
  lastConfirmedWeight: null as number | null,
  lastConfirmedTimestamp: 0
};

export function useWeightFromScale() {
  const [loading, setLoading] = useState(false);

  const fetchWeight = async (): Promise<number | null> => {
    setLoading(true);
    try {
      const now = Date.now();

      // Cache válido?
      if (lastWeightCache.weight !== null && (now - lastWeightCache.timestamp) < 5000) {
        console.log("✅ Usando peso do cache:", lastWeightCache.weight);
        setLoading(false);
        return lastWeightCache.weight;
      }

      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'your_supabase_url_here' || 
          supabaseKey === 'your_supabase_anon_key_here' ||
          supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase não configurado - peso da balança não disponível via banco');
        setLoading(false);
        return null;
      }

      // 📦 Buscar do Supabase
      try {
        const { data, error } = await supabase
          .from("pesagem_temp")
          .select("id, peso, criado_em")
          .order("criado_em", { ascending: false })
          .limit(1);

        if (error) {
          console.error("❌ Erro ao buscar peso do Supabase:", error);
          setLoading(false);
          return null;
        }

        if (data && data.length) {
          const pesagem = data[0];
          const tempo = new Date(pesagem.criado_em).getTime();
          const dif = now - tempo;

          if (dif < 15000) {
            const peso = parseFloat(pesagem.peso);

            // Atualizar cache
            lastWeightCache = {
              weight: peso,
              timestamp: now,
              lastConfirmedWeight: lastWeightCache.lastConfirmedWeight,
              lastConfirmedTimestamp: lastWeightCache.lastConfirmedTimestamp
            };

            // 🧹 Limpar registros antigos (mais de 1 minuto)
            try {
              const umMinutoAtras = new Date(now - 60000).toISOString();
              await supabase
                .from("pesagem_temp")
                .delete()
                .lt("criado_em", umMinutoAtras);
            } catch (cleanupError) {
              console.warn('⚠️ Erro ao limpar registros antigos (não crítico):', cleanupError);
            }

            setLoading(false);
            return peso;
          } else {
            console.log("⚠️ Peso expirado (mais de 15s)");
          }
        } else {
          console.log("⚠️ Nenhum peso encontrado na tabela");
        }
      } catch (fetchError) {
        // Handle specific fetch errors
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          console.warn('🌐 Erro de conectividade com Supabase - peso da balança não disponível');
        } else {
          console.error("❌ Erro ao buscar peso do Supabase:", fetchError);
        }
        setLoading(false);
        return null;
      }

      setLoading(false);
      return null;
    } catch (err) {
      console.error("❌ Erro inesperado:", err);
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmWeight = (weight: number) => {
    if (weight > 0) {
      lastWeightCache.lastConfirmedWeight = weight;
      lastWeightCache.lastConfirmedTimestamp = Date.now();
      console.log("✅ Peso confirmado:", weight);
    }
  };

  const isWeightDuplicate = (weight: number): boolean => {
    if (lastWeightCache.lastConfirmedWeight === null) return false;
    return Math.abs(weight - lastWeightCache.lastConfirmedWeight) < 0.001;
  };

  return { fetchWeight, loading, confirmWeight, isWeightDuplicate };
}
