import { useState } from "react";
import { useWeightFromScale } from "../../hooks/useWeightFromScale";
import { useEffect, useRef } from "react";
import { Scale, X, Check, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export function PesagemModal({ produto, onConfirmar, onFechar, useDirectScale = false }: { 
  produto: any, 
  onConfirmar: (pesoGramas: number) => void,
  onFechar?: () => void,
  useDirectScale?: boolean 
}) {
  const [pesoManual, setPesoManual] = useState<number>(0);
  const [tentativas, setTentativas] = useState<number>(0);
  const { fetchWeight, loading, isWeightDuplicate, confirmWeight } = useWeightFromScale();
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const confirmedRef = useRef<boolean>(false);
  
  // Tentar ler o peso automaticamente quando o modal abrir
  useEffect(() => {
    const timer = setTimeout(() => {
      usarBalanca();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const usarBalanca = async () => {
    setTentativas(prev => prev + 1);
    console.log(`🔄 Tentativa ${tentativas + 1} de leitura da balança`);
    
    const peso = await fetchWeight();
    if (peso === null || isNaN(peso) || peso <= 0) {
      if (tentativas === 0) {
        console.log("⚠️ Primeira tentativa falhou, tentando novamente...");
        setTimeout(() => usarBalanca(), 800);
      } else {
        console.log("❌ Não foi possível obter o peso após múltiplas tentativas");
      }
      return;
    }
    const pesoGramas = Math.round(peso * 1000);
    setPesoManual(pesoGramas);
    setIsDuplicate(isWeightDuplicate(peso));
    console.log("✅ Peso lido:", pesoGramas, "g");
  };

  const handleConfirmarPeso = () => {
    if (pesoManual <= 0) return;
    
    if (isDuplicate && !confirmedRef.current) {
      if (confirm("Esse peso é igual ao anterior. Tem certeza que deseja confirmar novamente?")) {
        confirmedRef.current = true;
        confirmWeight(pesoManual / 1000);
        onConfirmar(pesoManual);
      }
    } else {
      confirmWeight(pesoManual / 1000);
      onConfirmar(pesoManual);
    }
  };

  const handleFechar = () => {
    if (onFechar) {
      onFechar();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                  <Scale size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-bold">Pesagem de Produto</h2>
              </div>
              {onFechar && (
                <button
                  onClick={handleFechar}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              )}
            </div>
            <p className="text-white/90 truncate">{produto.name || produto.nome}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Botão da balança */}
          <div className="text-center">
            <button
              onClick={usarBalanca}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Pesando...</span>
                  </>
                ) : (
                  <>
                    <Scale size={24} />
                    <span>Usar Balança</span>
                    <Zap size={20} className="animate-pulse" />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Resultado da pesagem */}
          {pesoManual > 0 && (
            <div className={`rounded-xl p-4 border-2 transition-all duration-300 ${
              isDuplicate 
                ? 'bg-yellow-50 border-yellow-300' 
                : 'bg-green-50 border-green-300'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${
                  isDuplicate ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  {isDuplicate ? (
                    <AlertCircle size={20} className="text-yellow-600" />
                  ) : (
                    <Check size={20} className="text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    isDuplicate ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    Peso: {pesoManual}g ({(pesoManual / 1000).toFixed(3)} kg)
                  </p>
                  {isDuplicate && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Peso igual ao anterior
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Input manual */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">ou digite o peso</span>
              </div>
            </div>

            <div>
              <input
                type="number"
                value={pesoManual}
                onChange={(e) => setPesoManual(parseInt(e.target.value) || 0)}
                placeholder="Peso em gramas"
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* Botões de peso rápido */}
            <div className="grid grid-cols-3 gap-2">
              {[100, 200, 300, 500, 750, 1000].map((g) => (
                <button
                  key={g}
                  onClick={() => setPesoManual(g)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>

          {/* Botão confirmar */}
          <button
            onClick={handleConfirmarPeso}
            disabled={pesoManual <= 0}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              pesoManual <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDuplicate 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Check size={24} />
              <span>Confirmar Peso</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}