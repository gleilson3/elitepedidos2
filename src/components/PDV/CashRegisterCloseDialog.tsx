import React from 'react';
import { X, Printer, CheckCircle, MessageSquare, FileText, AlertTriangle } from 'lucide-react';
import { PDVCashRegister, PDVCashRegisterSummary } from '../../types/pdv';
import { useNavigate } from 'react-router-dom';

interface CashRegisterCloseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseAll?: () => void;
  register: PDVCashRegister | null;
  summary: PDVCashRegisterSummary | null;
  onPrint: () => void;
  onViewDailyReport?: () => void;
}

const CashRegisterCloseDialog: React.FC<CashRegisterCloseDialogProps> = ({
  isOpen,
  onClose,
  onCloseAll,
  register,
  summary,
  onPrint,
  onViewDailyReport
}) => {
  // Function to handle closing all dialogs
  const handleCloseAll = () => {
    // Call the regular onClose function
    onClose();
    
    // If onCloseAll is provided, call it to close all other dialogs
    if (onCloseAll) {
      onCloseAll();
    }
  };
  
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const generateWhatsAppMessage = () => {
    // Check if register and summary are available
    if (!register || !summary) {
      console.error('Dados do caixa não disponíveis para gerar mensagem', { register, summary });
      return encodeURIComponent('Erro ao gerar relatório: Dados do caixa não disponíveis. Por favor, tente novamente.');
    }

    try {
      console.log('📊 Dados para WhatsApp:', { 
        register, 
        summary,
        opening_amount: register.opening_amount,
        sales_total: summary?.sales_total,
        delivery_total: summary?.delivery_total,
        other_income_total: summary?.other_income_total,
        total_expense: summary?.total_expense,
        expected_balance: summary?.expected_balance
      });
      
      let message = `*RELATÓRIO DE CAIXA - ELITE AÇAÍ*\n\n`;
    
      // Dados do caixa
      message += `*DADOS DO CAIXA:*\n`;
      message += `Abertura: ${formatDate(register.opened_at)}\n`;
      message += `Fechamento: ${formatDate(register.closed_at)}\n`;
      message += `Valor de abertura: ${formatPrice(register.opening_amount || 0)}\n`;
      message += `Valor de fechamento: ${formatPrice(register.closing_amount || 0)}\n\n`;
    
      // Resumo financeiro
      message += `*RESUMO FINANCEIRO:*\n`;
      message += `Vendas PDV: ${formatPrice(summary?.sales_total || 0)}\n`;
      message += `Vendas Delivery: ${formatPrice(summary?.delivery_total || 0)}\n`;
      message += `Outras entradas: ${formatPrice(summary?.other_income_total || 0)}\n`;
      message += `Saídas: ${formatPrice(summary?.total_expense || 0)}\n`;
      message += `Saldo esperado: ${formatPrice(summary?.expected_balance || 0)}\n`;
      
      const difference = (register.closing_amount || 0) - (summary?.expected_balance || 0);
      message += `Diferença: ${formatPrice(difference)}`;
      if (difference > 0) {
        message += ` (sobra)`;
      } else if (difference < 0) {
        message += ` (falta)`;
      }
      message += `\n\n`;
    
      // Formas de pagamento
      message += `*FORMAS DE PAGAMENTO:*\n`;
      if (summary?.sales && typeof summary.sales === 'object') {
        const paymentMethods: Record<string, number> = {};
      
        // Extract payment methods from sales data
        Object.entries(summary.sales).forEach(([key, value]) => {
          const parts = key.split('_');
          if (parts.length >= 2) {
            const method = parts[0];
            const total = value?.total || 0;
          
            paymentMethods[method] = (paymentMethods[method] || 0) + total;
          }
        });
      
        // Add payment methods to message
        Object.entries(paymentMethods).forEach(([method, total]) => {
          const methodName = getPaymentMethodName(method);
          message += `${methodName}: ${formatPrice(total)}\n`;
        });
      } else {
        message += `Dinheiro: ${formatPrice(summary?.sales_total || 0)}\n`;
      }
    
      message += `\n*Relatório gerado em:* ${new Date().toLocaleString('pt-BR')}`;
    
      return encodeURIComponent(message);
    } catch (error) {
      console.error('Erro ao gerar mensagem de WhatsApp:', error);
      return encodeURIComponent('Erro ao gerar relatório. Por favor, tente novamente.');
    }
  };

  const getPaymentMethodName = (method: string): string => {
    const methodNames: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'voucher': 'Voucher',
      'misto': 'Pagamento Misto'
    };
    
    return methodNames[method] || method;
  };

  const handleSendWhatsApp = () => {
    if (!register || !summary) {
      alert('Erro: Dados do caixa não disponíveis. Por favor, tente novamente.');
      console.error('Erro ao enviar WhatsApp: Dados do caixa não disponíveis', { register, summary });
      return;
    }

    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/5585989041010?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              Caixa Fechado com Sucesso!
            </h2>
            <button 
              onClick={handleCloseAll}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600">
            O caixa foi fechado com um valor de {register?.closing_amount ? formatPrice(register.closing_amount) : "N/A"}
          </p>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-blue-800 mb-2">Opções de Relatório</h3>
                <p className="text-blue-700 mb-3">
                  O que você gostaria de fazer com o relatório deste caixa?
                </p>
                <p className="text-sm text-blue-600 bg-white/70 p-3 rounded-lg border border-blue-100">
                  O relatório mostra todas as movimentações, vendas e resumo financeiro do caixa.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 mb-2">Escolha uma opção:</h4>
            
            <button
              onClick={onPrint}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="bg-white/20 rounded-full p-2">
                <Printer size={20} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Imprimir Movimentações</div>
                <div className="text-blue-100 text-sm">Relatório térmico completo</div>
              </div>
            </button>
            
            {onViewDailyReport && (
              <button
                onClick={onViewDailyReport}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="bg-white/20 rounded-full p-2">
                  <FileText size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">Ver Relatório Diário</div>
                  <div className="text-purple-100 text-sm">Análise completa do dia</div>
                </div>
              </button>
            )}

            
            <button 
              onClick={handleSendWhatsApp}
              disabled={!register || !summary}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-md"
            >
              <div className="bg-white/20 rounded-full p-2">
                <MessageSquare size={20} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Enviar por WhatsApp</div>
                <div className="text-green-100 text-sm">Compartilhar relatório</div>
              </div>
            </button>
            
            {(!register || !summary) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Alguns dados do caixa não estão disponíveis para envio por WhatsApp.
                </p>
              </div>
            )}
            
            <button
              onClick={handleCloseAll}
              className="w-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg mt-4"
            >
              🚪 Fechar e Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

export default CashRegisterCloseDialog;