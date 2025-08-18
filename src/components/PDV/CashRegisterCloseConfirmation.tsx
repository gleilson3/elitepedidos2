import React, { useState } from 'react';
import { X, AlertTriangle, DollarSign, CheckCircle, Printer, Plus, Minus } from 'lucide-react';
import { PDVCashRegister, PDVCashRegisterSummary, PDVCashRegisterEntry } from '../../types/pdv';
import { usePermissions } from '../../hooks/usePermissions';

interface CashRegisterCloseConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (closingAmount: number, justification?: string) => void;
  register: PDVCashRegister | null;
  summary: PDVCashRegisterSummary | null;
  isProcessing: boolean;
}

const CashRegisterCloseConfirmation: React.FC<CashRegisterCloseConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  register,
  summary,
  isProcessing
}) => {
  const { hasPermission } = usePermissions();
  const canViewExpectedBalance = hasPermission('can_view_expected_balance');
  const [closingAmount, setClosingAmount] = useState(0);
  const [hasInformedAmount, setHasInformedAmount] = useState(false);
  const [justification, setJustification] = useState('');
  const [printMovements, setPrintMovements] = useState(true);
  const [showBillCounting, setShowBillCounting] = useState(false);
  const [billCounts, setBillCounts] = useState({
    '200': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '2': 0,
    '1': 0,
    '0.50': 0,
    '0.25': 0,
    '0.10': 0,
    '0.05': 0,
    '0.01': 0
  });

  const billValues = [
    { value: '200', label: 'R$ 200,00', color: 'bg-purple-100' },
    { value: '100', label: 'R$ 100,00', color: 'bg-blue-100' },
    { value: '50', label: 'R$ 50,00', color: 'bg-yellow-100' },
    { value: '20', label: 'R$ 20,00', color: 'bg-orange-100' },
    { value: '10', label: 'R$ 10,00', color: 'bg-red-100' },
    { value: '5', label: 'R$ 5,00', color: 'bg-green-100' },
    { value: '2', label: 'R$ 2,00', color: 'bg-gray-100' },
    { value: '1', label: 'R$ 1,00', color: 'bg-yellow-50' },
    { value: '0.50', label: 'R$ 0,50', color: 'bg-gray-50' },
    { value: '0.25', label: 'R$ 0,25', color: 'bg-gray-50' },
    { value: '0.10', label: 'R$ 0,10', color: 'bg-gray-50' },
    { value: '0.05', label: 'R$ 0,05', color: 'bg-gray-50' },
    { value: '0.01', label: 'R$ 0,01', color: 'bg-gray-50' }
  ];

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAmountConfirm = () => {
    if (closingAmount > 0) {
      setHasInformedAmount(true);
    }
  };

  const calculateBillTotal = () => {
    return Object.entries(billCounts).reduce((total, [value, count]) => {
      return total + (parseFloat(value) * count);
    }, 0);
  };

  const updateBillCount = (value: string, increment: boolean) => {
    setBillCounts(prev => ({
      ...prev,
      [value]: Math.max(0, prev[value] + (increment ? 1 : -1))
    }));
  };

  const resetBillCounts = () => {
    setBillCounts({
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0,
      '0.50': 0,
      '0.25': 0,
      '0.10': 0,
      '0.05': 0,
      '0.01': 0
    });
  };

  const applyBillTotal = () => {
    const total = calculateBillTotal();
    setClosingAmount(total);
    setShowBillCounting(false);
    resetBillCounts();
  };

  const expectedBalance = summary?.expected_balance || 0;
  const difference = closingAmount - expectedBalance;
  const hasDifference = Math.abs(difference) > 0.01; // Tolerância de 1 centavo
  const needsJustification = hasDifference && hasInformedAmount;

  const canProceed = hasInformedAmount && (!needsJustification || justification.trim().length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertTriangle size={24} className="text-yellow-600" />
              </div>
              Confirmar Fechamento de Caixa
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600">
            {!hasInformedAmount 
              ? 'Informe o valor contado no caixa para prosseguir com o fechamento.'
              : 'Confirme os dados do fechamento de caixa.'
            }
          </p>
        </div>

        <div className="p-6 overflow-y-auto">
          {!hasInformedAmount ? (
            // ETAPA 1: Informar valor contado
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <DollarSign size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-blue-800 mb-2">Contagem do Caixa</h3>
                    <p className="text-blue-700 text-sm">
                      Conte todo o dinheiro físico presente no caixa e informe o valor total.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor contado no caixa *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Informe o valor total em dinheiro presente no caixa
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBillCounting(true)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <DollarSign size={16} />
                Contar Dinheiro
              </button>
            </div>
          ) : (
            // ETAPA 2: Mostrar comparação e solicitar justificativa se necessário
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <DollarSign size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">Conferência do Fechamento</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Valor informado (contado):</span>
                        <span className="font-bold text-blue-800">{formatPrice(closingAmount)}</span>
                      </div>
                      
                      {canViewExpectedBalance && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Saldo esperado (sistema):</span>
                            <span className="font-medium text-blue-800">{formatPrice(expectedBalance)}</span>
                          </div>
                          
                          <div className="pt-2 border-t border-blue-200">
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-800">Diferença:</span>
                              <span className={`font-bold ${
                                difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-blue-800'
                              }`}>
                                {difference === 0 ? 'Exato' : 
                                 difference > 0 ? `+${formatPrice(difference)} (sobra)` : 
                                 `${formatPrice(difference)} (falta)`}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo das movimentações (sempre visível) */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Resumo das Movimentações</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor de abertura:</span>
                    <span className="font-medium">{formatPrice(summary?.opening_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendas PDV:</span>
                    <span className="font-medium text-green-600">{formatPrice(summary?.sales_total || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendas Delivery:</span>
                    <span className="font-medium text-green-600">{formatPrice(summary?.delivery_total || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outras entradas:</span>
                    <span className="font-medium text-green-600">{formatPrice(summary?.other_income_total || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saídas:</span>
                    <span className="font-medium text-red-600">{formatPrice(summary?.total_expense || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Justificativa obrigatória para diferenças */}
              {needsJustification && (
                <div className={`border rounded-xl p-4 ${
                  difference > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className={
                      difference > 0 ? 'text-yellow-600' : 'text-red-600'
                    } className="mt-1 flex-shrink-0" />
                    <div className="w-full">
                      <h4 className={`font-medium mb-2 ${
                        difference > 0 ? 'text-yellow-800' : 'text-red-800'
                      }`}>
                        Justificativa Obrigatória
                      </h4>
                      <p className={`text-sm mb-3 ${
                        difference > 0 ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        Foi detectada uma diferença de {formatPrice(Math.abs(difference))}. 
                        É obrigatório informar a justificativa para esta diferença.
                      </p>
                      <textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="Descreva o motivo da diferença encontrada..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasInformedAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Printer size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={printMovements}
                      onChange={(e) => setPrintMovements(e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="font-medium text-blue-800">
                        Imprimir movimentações do caixa após fechamento
                      </span>
                      <p className="text-blue-700 text-sm mt-1">
                        Gera um relatório térmico com todas as movimentações do caixa
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {!hasInformedAmount ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAmountConfirm}
                  disabled={closingAmount <= 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Confirmar Valor
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onConfirm(closingAmount, justification || undefined)}
                  disabled={isProcessing || !canProceed}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirmar Fechamento
                    </>
                  )}
                </button>
              </>
            )}
          </div>
          
          {needsJustification && !justification.trim() && (
            <div className="mt-2 text-center">
              <p className="text-sm text-red-600">
                ⚠️ Justificativa obrigatória para diferenças no caixa
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bill Counting Modal */}
      {showBillCounting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contagem de Cédulas e Moedas</h3>
              <button
                onClick={() => setShowBillCounting(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {billValues.map((bill) => (
                  <div key={bill.value} className={`flex items-center justify-between p-3 rounded-lg ${bill.color}`}>
                    <span className="font-medium">{bill.label}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateBillCount(bill.value, false)}
                        className="p-1 rounded-full bg-white hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {billCounts[bill.value]}
                      </span>
                      <button
                        onClick={() => updateBillCount(bill.value, true)}
                        className="p-1 rounded-full bg-white hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {calculateBillTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetBillCounts}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setShowBillCounting(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyBillTotal}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterCloseConfirmation;