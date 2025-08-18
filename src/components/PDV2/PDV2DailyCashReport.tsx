import React, { useState, useEffect } from 'react';
import { Calendar, Download, Printer, DollarSign, TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import { usePDV2CashRegister } from '../../hooks/usePDV2CashRegister';

interface DailyCashSummary {
  date: string;
  opening_amount: number;
  sales_total: number;
  other_income_total: number;
  total_expense: number;
  expected_balance: number;
  actual_balance: number;
  difference: number;
  sales_count: number;
  entries_count: number;
}

const PDV2DailyCashReport: React.FC = () => {
  const { getCashRegisterReport, operators, loading } = usePDV2CashRegister();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailyCashSummary | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const loadDailyReport = async () => {
    setReportLoading(true);
    try {
      const data = await getCashRegisterReport({
        startDate: date,
        endDate: date
      });

      // Calcular resumo do dia
      const dailySummary: DailyCashSummary = {
        date,
        opening_amount: data.reduce((sum, reg) => sum + (reg.opening_amount || 0), 0),
        sales_total: data.reduce((sum, reg) => sum + (reg.summary?.sales_total || 0), 0),
        other_income_total: data.reduce((sum, reg) => sum + (reg.summary?.other_income_total || 0), 0),
        total_expense: data.reduce((sum, reg) => sum + (reg.summary?.total_expense || 0), 0),
        expected_balance: data.reduce((sum, reg) => sum + (reg.summary?.expected_balance || 0), 0),
        actual_balance: data.reduce((sum, reg) => sum + (reg.closing_amount || reg.summary?.expected_balance || 0), 0),
        difference: data.reduce((sum, reg) => sum + ((reg.closing_amount || 0) - (reg.summary?.expected_balance || 0)), 0),
        sales_count: data.reduce((sum, reg) => sum + (reg.summary?.sales_total ? 1 : 0), 0),
        entries_count: data.length
      };

      setSummary(dailySummary);
    } catch (error) {
      console.error('Erro ao carregar relatório diário da Loja 2:', error);
      alert('Erro ao carregar relatório diário');
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleExport = () => {
    if (!summary) return;

    const csvContent = [
      ['Relatório Diário de Caixa - Loja 2'],
      ['Data', new Date(date).toLocaleDateString('pt-BR')],
      [''],
      ['Resumo'],
      ['Valor de Abertura', formatPrice(summary.opening_amount)],
      ['Total de Vendas', formatPrice(summary.sales_total)],
      ['Outras Entradas', formatPrice(summary.other_income_total)],
      ['Total de Saídas', formatPrice(summary.total_expense)],
      ['Saldo Esperado', formatPrice(summary.expected_balance)],
      ['Saldo Real', formatPrice(summary.actual_balance)],
      ['Diferença', formatPrice(summary.difference)],
      [''],
      ['Estatísticas'],
      ['Número de Vendas', summary.sales_count.toString()],
      ['Registros de Caixa', summary.entries_count.toString()],
      [''],
      ['Gerado em', new Date().toLocaleString('pt-BR')]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-diario-loja2-${date}.csv`;
    link.click();
  };

  useEffect(() => {
    loadDailyReport();
  }, [date]);

  return (
    <div className={`space-y-6 ${printMode ? 'print:bg-white print:p-0' : ''}`}>
      {/* Header - Hide in print mode */}
      {!printMode && (
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={24} className="text-blue-600" />
              Relatório Diário de Caixa - Loja 2
            </h2>
            <p className="text-gray-600">Resumo completo das movimentações do dia</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              Imprimir
            </button>
            <button
              onClick={handleExport}
              disabled={!summary}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        </div>
      )}

      {/* Print Header - Only show in print mode */}
      {printMode && (
        <div className="print-header">
          <h1 className="text-2xl font-bold text-center">Relatório Diário de Caixa - Elite Açaí Loja 2</h1>
          <p className="text-center text-gray-600">
            Data: {new Date(date).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-center text-gray-500 text-sm">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
          <hr className="my-4" />
        </div>
      )}

      {/* Date Selector - Hide in print mode */}
      {!printMode && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Relatório
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <button
                onClick={loadDailyReport}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Atualizar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading || reportLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !summary ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhuma movimentação encontrada
          </h3>
          <p className="text-gray-500">
            Não há movimentações de caixa para a data selecionada na Loja 2.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor de Abertura</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(summary.opening_amount)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(summary.sales_total)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Esperado</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(summary.expected_balance)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Diferença</p>
                  <p className={`text-2xl font-bold ${summary.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(summary.difference)}
                  </p>
                </div>
                {summary.difference >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Detalhado - Loja 2</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Entradas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor de abertura:</span>
                    <span className="font-medium">{formatPrice(summary.opening_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendas PDV:</span>
                    <span className="font-medium text-green-600">{formatPrice(summary.sales_total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outras entradas:</span>
                    <span className="font-medium text-green-600">{formatPrice(summary.other_income_total)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>Total de entradas:</span>
                      <span className="text-green-600">
                        {formatPrice(summary.opening_amount + summary.sales_total + summary.other_income_total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Saídas e Saldo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de saídas:</span>
                    <span className="font-medium text-red-600">{formatPrice(summary.total_expense)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo esperado:</span>
                    <span className="font-medium text-purple-600">{formatPrice(summary.expected_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo real:</span>
                    <span className="font-medium">{formatPrice(summary.actual_balance)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>Diferença:</span>
                      <span className={summary.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPrice(summary.difference)}
                        {summary.difference !== 0 && (
                          <span className="text-xs ml-1">
                            ({summary.difference > 0 ? 'sobra' : 'falta'})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas do Dia - Loja 2</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{summary.sales_count}</p>
                <p className="text-gray-600">Vendas Realizadas</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{summary.entries_count}</p>
                <p className="text-gray-600">Registros de Caixa</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {summary.sales_count > 0 ? formatPrice(summary.sales_total / summary.sales_count) : formatPrice(0)}
                </p>
                <p className="text-gray-600">Ticket Médio</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: #fff;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .print-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .print-header p {
            font-size: 14px;
            color: #666;
          }
        }
      `}</style>
    </div>
  );
};

export default PDV2DailyCashReport;