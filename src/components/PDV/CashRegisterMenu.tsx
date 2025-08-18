import React, { useState, useEffect } from 'react';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../PermissionGuard';
import { 
  DollarSign, FileText,
  ArrowDownCircle, 
  ArrowUpCircle, 
  Plus, 
  ShoppingBag, 
  Clock, 
  Save, 
  Printer, 
  Minus, 
  X, 
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import CashRegisterDetails from './CashRegisterDetails';
import CashRegisterCloseConfirmation from './CashRegisterCloseConfirmation';
import CashRegisterCloseDialog from './CashRegisterCloseDialog';
import CashRegisterPrintView from './CashRegisterPrintView';

const CashRegisterMenu: React.FC = () => {
  const { hasPermission } = usePermissions();
  const {
    isOpen,
    currentRegister,
    summary,
    entries,
    loading,
    error,
    openCashRegister,
    closeCashRegister,
    addCashEntry,
    refreshData
  } = usePDVCashRegister();

  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const [showOpenRegister, setShowOpenRegister] = useState(false);
  const [showCloseRegister, setShowCloseRegister] = useState(false);
  const [showCashEntry, setShowCashEntry] = useState(false);
  const [showBillCounting, setShowBillCounting] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryPaymentMethod, setEntryPaymentMethod] = useState('dinheiro');
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [closedRegister, setClosedRegister] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Check Supabase configuration on mount
  React.useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const isConfigured = supabaseUrl && supabaseKey && 
                        supabaseUrl !== 'your_supabase_url_here' && 
                        supabaseKey !== 'your_supabase_anon_key_here' &&
                        !supabaseUrl.includes('placeholder');
    
    setSupabaseConfigured(isConfigured);
  }, []);

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

  const calculateBillTotal = () => {
    return Object.entries(billCounts).reduce((total, [value, count]) => {
      return total + (parseFloat(value) * count);
    }, 0);
  };

  const handleOpenRegister = async () => {
    if (!openingAmount) return;
    
    console.log('🚀 Abrindo caixa com valor:', parseFloat(openingAmount));
    try {
      await openCashRegister(parseFloat(openingAmount));
      setShowOpenRegister(false);
      setOpeningAmount('');
    } catch (err) {
      console.error('Erro ao abrir caixa:', err);
    }
  };

  const handleCloseRegister = async () => {
    setShowCloseConfirmation(true);
  };

  const handleConfirmClose = async (closingAmount: number, shouldPrint: boolean = false) => {
    setIsClosing(true);
    setShowCloseConfirmation(false);
    
    try {
      console.log('🔒 Fechando caixa com valor:', closingAmount);
      console.log('📊 Summary antes do fechamento:', summary);
      const result = await closeCashRegister(closingAmount);
      
      if (result.success) {
        // Criar objeto do caixa fechado com todos os dados necessários
        setClosedRegister({
          ...currentRegister,
          closing_amount: closingAmount,
          closed_at: new Date().toISOString(),
          difference: closingAmount - (summary?.expected_balance || 0)
        });
        
        if (shouldPrint) {
          setShowPrintView(true);
        } else {
          setShowCloseDialog(true);
        }
      } else {
        alert(`Erro ao fechar caixa: ${result.error}`);
      }
    } catch (err) {
      console.error('Erro ao fechar caixa:', err);
      alert('Erro ao fechar caixa. Tente novamente.');
    } finally {
      setIsClosing(false);
    }
  };

  const handleCashEntry = async () => {
    if (!entryAmount || !entryDescription) return;
    
    console.log('💰 Adicionando entrada ao caixa:', {
      type: entryType,
      amount: parseFloat(entryAmount),
      description: entryDescription,
      payment_method: entryPaymentMethod
    });
    
    try {
      await addCashEntry({
        type: entryType,
        amount: parseFloat(entryAmount),
        description: entryDescription,
        payment_method: entryPaymentMethod
      });
      setShowCashEntry(false);
      setEntryAmount('');
      setEntryDescription('');
      setEntryType('income');
      setEntryPaymentMethod('dinheiro');
    } catch (err) {
      console.error('Erro ao adicionar entrada:', err);
    }
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
    if (showCloseRegister) {
      setClosingAmount(total.toFixed(2));
    } else if (showOpenRegister) {
      setOpeningAmount(total.toFixed(2));
    }
    setShowBillCounting(false);
    resetBillCounts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGuard hasPermission={hasPermission('can_view_cash_register') || hasPermission('can_view_cash_report')} showMessage={true}>
      <div className="space-y-6">
        {/* Supabase Configuration Warning */}
        {!supabaseConfigured && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-800">Funcionalidade de Caixa Indisponível</h3>
                <p className="text-red-700 text-sm">
                  O sistema de caixa requer configuração do Supabase. Configure as variáveis de ambiente 
                  VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar esta funcionalidade.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={24} />
              Controle de Caixa
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isOpen ? 'Caixa aberto' : 'Caixa fechado'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <RefreshCw size={16} />
              Atualizar
            </button>
            
            {isOpen && (
              <button
                onClick={handleCloseRegister}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Clock size={16} />
                Fechar Caixa
              </button>
            )}
          </div>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border-2 ${isOpen ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status do Caixa</p>
              <p className={`text-lg font-semibold ${isOpen ? 'text-green-600' : 'text-gray-600'}`}>
                {isOpen ? 'Aberto' : 'Fechado'}
              </p>
            </div>
            <div className={`p-2 rounded-full ${isOpen ? 'bg-green-100' : 'bg-gray-100'}`}>
              <DollarSign className={`h-6 w-6 ${isOpen ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>

        {currentRegister && (
          <>
            <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor de Abertura</p>
                  <p className="text-lg font-semibold text-blue-600">
                    R$ {currentRegister.opening_amount?.toFixed(2) || '0,00'}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <ArrowUpCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                  <p className="text-lg font-semibold text-purple-600" title="Saldo esperado em dinheiro">
                    {formatPrice(summary.expected_balance)}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!isOpen && (
          <button
            onClick={() => setShowOpenRegister(true)}
            disabled={!supabaseConfigured}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Abrir Caixa
          </button>
        )}

        {isOpen && supabaseConfigured && (
          <>
            <button
              onClick={() => setShowCashEntry(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowDownCircle size={18} />
              Adicionar Entrada
            </button>

            <button
              onClick={() => {
                setEntryType('expense');
                setShowCashEntry(true);
              }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowUpCircle size={18} />
              Adicionar Saída
            </button>
          </>
        )}
      </div>

      {/* Close Confirmation Modal */}
      <CashRegisterCloseConfirmation
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={handleConfirmClose}
        register={currentRegister}
        summary={summary}
        isProcessing={isClosing}
      />

      {/* Close Success Dialog */}
      <CashRegisterCloseDialog
        isOpen={showCloseDialog}
        onClose={() => setShowCloseDialog(false)}
        onCloseAll={() => {
          setShowCloseDialog(false);
          setShowPrintView(false);
          setClosedRegister(null);
        }}
        register={closedRegister}
        summary={summary}
        onPrint={() => setShowPrintView(true)}
        onViewDailyReport={() => {
          localStorage.setItem('pdv_active_screen', 'daily_cash_report');
          window.location.href = '/pdv/app?screen=daily_cash_report';
        }}
      />

      {/* Print View Modal */}
      {showPrintView && closedRegister && (
        <CashRegisterPrintView
          register={closedRegister}
          summary={summary}
          entries={entries}
          onClose={() => setShowPrintView(false)}
        />
      )}

      {/* Cash Register Details */}
      {currentRegister && (
        <>
          <CashRegisterDetails register={currentRegister} summary={summary} onRefresh={refreshData} />
          
          {/* Histórico de Movimentações */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Histórico de Movimentações</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Forma</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{new Date(entry.created_at).toLocaleString('pt-BR')}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {entry.type === 'income' ? (
                            <ArrowDownCircle size={16} className="text-green-600" />
                          ) : (
                            <ArrowUpCircle size={16} className="text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.type === 'income' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-800">
                          <div className="font-medium">{entry.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{getPaymentMethodName(entry.payment_method)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${
                          entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'income' ? '+' : '-'}
                          {formatPrice(entry.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {entries.length === 0 && (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhuma movimentação registrada</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Open Register Modal */}
      {showOpenRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Abrir Caixa</h3>
              <button
                onClick={() => setShowOpenRegister(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Abertura
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <button
                onClick={() => setShowBillCounting(true)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <DollarSign size={16} />
                Contar Dinheiro
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowOpenRegister(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleOpenRegister}
                  disabled={!openingAmount}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Abrir Caixa
                </button>
              </div>
            </div>

            {/* Bill Counting Modal */}
            {showBillCounting && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Contagem de Cédulas</h3>
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
                        <span>R$ {calculateBillTotal().toFixed(2)}</span>
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
        </div>
      )}

      {/* Cash Entry Modal */}
      {showCashEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {entryType === 'income' ? 'Adicionar Entrada' : 'Adicionar Saída'}
              </h3>
              <button
                onClick={() => setShowCashEntry(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as 'income' | 'expense')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="income">Entrada</option>
                  <option value="expense">Saída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição da movimentação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={entryPaymentMethod}
                  onChange={(e) => setEntryPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCashEntry(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCashEntry}
                  disabled={!entryAmount || !entryDescription}
                  className={`flex-1 ${entryType === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors`}
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Bill Counting Modal */}
            {showBillCounting && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Contagem de Cédulas</h3>
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
                        <span>R$ {calculateBillTotal().toFixed(2)}</span>
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
        </div>
      )}

      {/* Bill Counting Modal */}
      {showBillCounting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contar Dinheiro</h3>
              <button
                onClick={() => setShowBillCounting(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
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

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>R$ {calculateBillTotal().toFixed(2)}</span>
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
    </PermissionGuard>
  );
};

export default CashRegisterMenu;

// Helper function to get payment method display name
function getPaymentMethodName(method: string) {
  const methodNames: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao_credito': 'Cartão de Crédito',
    'cartao_debito': 'Cartão de Débito',
    'voucher': 'Voucher',
    'misto': 'Pagamento Misto',
    'outros': 'Outros'
  };
  
  return methodNames[method] || method;
}

// Helper function to format price
function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}