import React from 'react';
import { Clock, User, DollarSign, ArrowDownCircle, ArrowUpCircle, AlertCircle, RefreshCw, Plus, Minus, Info } from 'lucide-react';
import { PDVCashRegister, PDVCashRegisterSummary } from '../../types/pdv';

interface CashRegisterDetailsProps {
  register: PDVCashRegister | null;
  summary: PDVCashRegisterSummary;
  onRefresh?: () => void;
}

const CashRegisterDetails: React.FC<CashRegisterDetailsProps> = ({ register, summary, onRefresh }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Verificar se há dados válidos
  const hasValidData = summary && (
    summary.sales_count > 0 || 
    summary.delivery_count > 0 || 
    summary.total_income > 0 || 
    summary.total_expense > 0 ||
    summary.total_all_sales > 0 ||
    summary.other_income_total > 0
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Get all payment methods from the summary data
  const getPaymentMethods = () => {
    if (!summary || !summary.sales || typeof summary.sales !== 'object') {
      return ['dinheiro', 'pix', 'cartao_credito', 'cartao_debito'];
    }

    try {
      const methods: string[] = [];
      const sales = summary.sales as Record<string, any>;

      // Process all payment methods from all sources
      for (const key in sales) {
        const parts = key.split('_');
        if (parts.length >= 2) {
          const method = parts[0];
          if (!methods.includes(method)) {
            methods.push(method);
          }
        }
      }

      return methods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  };

  // Get total for a specific payment method
  const getPaymentMethodTotal = (method: string) => {
    if (!summary || !summary.sales || typeof summary.sales !== 'object') {
      // Return default values based on method for empty data
      if (method === 'dinheiro' && summary?.sales_total) {
        return summary.sales_total * 0.4; // Estimate 40% cash sales
      }
      if (method === 'cartao_credito' && summary?.sales_total) {
        return summary.sales_total * 0.3; // Estimate 30% credit card sales
      }
      if (method === 'pix' && summary?.sales_total) {
        return summary.sales_total * 0.2; // Estimate 20% pix sales
      }
      if (method === 'cartao_debito' && summary?.sales_total) {
        return summary.sales_total * 0.1; // Estimate 10% debit card sales
      }
      return 0;
    }

    try {
      const sales = summary.sales as Record<string, any>;
      let total = 0;

      // Sum up all entries for this payment method across all sources
      for (const key in sales) {
        if (key.startsWith(`${method}_`)) {
          total += sales[key].total || 0;
        }
      }

      return total;
    } catch (error) {
      console.error('Error calculating payment method total:', error);
      return 0;
    }
  };

  // Get payment method display name
  const getPaymentMethodName = (method: string) => {
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
  };

  // Se não houver dados válidos, mostrar mensagem informativa
  if (!hasValidData && (!register || !register.closed_at)) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Detalhes do Caixa</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
        
        <div className="text-center py-12">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {register?.closed_at ? 
              'Histórico de movimentações não disponível para este caixa' : 
              'Nenhuma movimentação registrada ainda'
            }
          </p>
          {!register?.closed_at && (
            <p className="text-sm text-gray-400 mt-2">
              As movimentações aparecerão aqui quando forem registradas
            </p>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-blue-800 mb-1">Caixa aberto sem movimentações</p>
              <p className="text-blue-700 text-sm">
                Este caixa foi aberto com valor inicial de <strong>{formatPrice(register?.opening_amount || 0)}</strong> e ainda não possui movimentações registradas.
              </p>
              <div className="mt-3 p-3 bg-white/70 rounded-lg text-sm">
                <p className="text-blue-700 font-medium mb-1">
                  Para registrar movimentações, realize uma das seguintes operações:
                </p>
                <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                  <li>Realize uma venda no PDV (qualquer forma de pagamento)</li>
                  <li>Adicione uma entrada ou saída manual de caixa</li>
                  <li>Processe um pedido de delivery (qualquer forma de pagamento)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <DollarSign size={20} className="text-green-600" />
          Detalhes do Caixa
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
            title="Atualizar dados do caixa"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Abertura */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
            <Clock size={18} className="text-blue-600" />
            Abertura
          </h4>
          
          <div className="space-y-2 pl-6">
            <div>
              <p className="text-sm text-gray-600">Aberto em</p>
              <p className="font-medium text-gray-800" title={register?.opened_at ? new Date(register.opened_at).toLocaleString('pt-BR') : ''}>
                {formatDate(register?.opened_at)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Valor de abertura</p>
              <p className="font-medium text-green-600" title="Valor inicial do caixa">
                {formatPrice(summary.opening_amount)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Movimentações */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 mb-2">Entradas e Saídas</h4>
          
          <div className="space-y-3 pl-6">
            <div className="flex justify-between">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <ArrowDownCircle size={14} className="text-green-500 flex-shrink-0" title="Vendas realizadas pelo PDV" />
                <span>Vendas PDV ({summary.sales_count || 0})</span>
                <span className="text-xs text-gray-500 ml-1 hidden sm:inline">(Todas formas de pagamento)</span>
              </p>
              <p className="font-medium text-green-600">
                {formatPrice(summary.sales_total)}
              </p>
            </div>
            
            <div className="flex justify-between">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <ArrowDownCircle size={14} className="text-green-500 flex-shrink-0" title="Vendas realizadas pelo Delivery" />
                <span>Vendas Delivery ({summary.delivery_count || 0})</span>
                <span className="text-xs text-gray-500 ml-1 hidden sm:inline">(Todas formas de pagamento)</span>
              </p>
              <p className="font-medium text-green-600">
                {formatPrice(summary.delivery_total)}
              </p>
            </div>
            
            <div className="flex justify-between">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <ArrowDownCircle size={14} className="text-green-500 flex-shrink-0" title="Outras entradas de caixa (não vendas)" /> 
                <span>Outras Entradas</span>
                <span className="text-xs text-gray-500 ml-1 hidden sm:inline">(Entradas manuais)</span>
              </p>
              <p className="font-medium text-green-600">
                {formatPrice(summary.other_income_total)}
              </p>
            </div>
            
            <div className="flex justify-between">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <ArrowUpCircle size={14} className="text-red-500 flex-shrink-0" title="Saídas de caixa" />
                <span>Saídas</span>
                <span className="text-xs text-gray-500 ml-1 hidden sm:inline">(Despesas)</span>
              </p>
              <p className="font-medium text-red-600">
                {formatPrice(summary.total_expense)}
              </p>
            </div>
            
            <div className="flex justify-between pt-1 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700">Saldo Esperado</p>
              <p className="font-bold text-green-600" title="Valor de abertura + entradas em dinheiro - saídas">
                {formatPrice(summary.expected_balance)}
              </p>
            </div>
            <div className="flex justify-between pt-1 text-xs text-gray-500">
              <p className="text-xs">Apenas transações em dinheiro</p>
              <p>
                {formatPrice(summary.opening_amount)} + entradas - saídas
              </p>
            </div>
          </div>
        </div>
        
        {/* Formas de Pagamento */}
        <div className="space-y-3 md:col-span-2">
          <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-green-600" />
            Saldo Total
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-6">
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Vendas PDV:</p>
              <p className="font-medium text-green-600" title="Total de vendas no PDV (todas formas de pagamento)">
                {formatPrice(summary.sales_total || 0)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Vendas Delivery:</p>
              <p className="font-medium text-green-600" title="Total de vendas no Delivery (todas formas de pagamento)">
                {formatPrice(summary.delivery_total || 0)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Outras Entradas:</p>
              <p className="font-medium text-green-600" title="Entradas manuais (não relacionadas a vendas)">
                {formatPrice(summary.other_income_total || 0)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Saídas:</p>
              <p className="font-medium text-red-600" title="Despesas e retiradas">
                {formatPrice(summary.total_expense || 0)}
              </p>
            </div>
          </div>
          
          <h4 className="font-medium text-gray-700 flex items-center gap-2 mt-4 mb-2">
            <DollarSign size={18} className="text-green-600" />
            Formas de Pagamento
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-6">
            {getPaymentMethods().map(method => (
              <div key={method} className="flex justify-between">
                <p className="text-sm text-gray-600">{getPaymentMethodName(method)}</p>
                <p className="font-medium text-green-600">
                  {formatPrice(getPaymentMethodTotal(method))}
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-2 border-t border-gray-200 pl-6">
            <p className="text-sm font-medium text-gray-700">Total</p>
            <p className="font-bold text-green-600">
              {formatPrice(summary.total_all_sales || 0)}
            </p>
          </div>
        </div>
        
        {/* Fechamento */}
        {register?.closed_at && (
          <div className="space-y-3 md:col-span-2">
            <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Clock size={18} className="text-purple-600" />
              Fechamento do Caixa
            </h4>
            
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Fechado em</p>
                <p className="font-medium text-gray-800" title="Data e hora do fechamento">
                  {formatDate(register.closed_at)} 
                </p>
              </div>
              
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Valor de fechamento</p>
                <p className="font-medium text-green-600" title="Valor informado no fechamento">
                  {formatPrice(register.closing_amount || 0)}
                  <span className="text-xs text-gray-500 ml-1">(informado pelo operador)</span>
                </p>
              </div>
              
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Diferença</p>
                <p className={`font-medium ${
                  register.difference && register.difference > 0 
                  ? 'text-green-600' // Sobra (positivo)
                    : register.difference && register.difference < 0 
                    ? 'text-red-600' // Falta (negativo)
                    : 'text-gray-600'
                }`} title="Diferença entre valor informado e saldo esperado">
                  {register.difference 
                    ? formatPrice(register.difference) 
                    : '-'}
                  {register.difference !== null && (
                    <span className="ml-1 text-xs">
                      {register.difference < 0 ? '(falta)' : register.difference > 0 ? '(sobra)' : '(exato)'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashRegisterDetails;