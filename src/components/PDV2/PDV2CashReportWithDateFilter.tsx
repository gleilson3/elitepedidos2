import React, { useState, useEffect } from 'react';
import { Calendar, Download, Printer, DollarSign, TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import { usePDV2CashRegister } from '../../hooks/usePDV2CashRegister';

interface CashReportData {
  registers: any[];
  summary: {
    total_opening: number;
    total_sales: number;
    total_other_income: number;
    total_expenses: number;
    total_expected: number;
    total_actual: number;
    total_difference: number;
    registers_count: number;
    closed_registers: number;
  };
}

const PDV2CashReportWithDateFilter: React.FC = () => {
  const { getCashRegisterReport, operators, loading } = usePDV2CashRegister();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [reportData, setReportData] = useState<CashReportData | null>(null);
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

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const registers = await getCashRegisterReport({
        startDate,
        endDate,
        operatorId: selectedOperator || undefined
      });

      // Calcular resumo
      const summary = {
        total_opening: registers.reduce((sum, reg) => sum + (reg.opening_amount || 0), 0),
        total_sales: registers.reduce((sum, reg) => sum + (reg.summary?.sales_total || 0), 0),
        total_other_income: registers.reduce((sum, reg) => sum + (reg.summary?.other_income_total || 0), 0),
        total_expenses: registers.reduce((sum, reg) => sum + (reg.summary?.total_expense || 0), 0),
        total_expected: registers.reduce((sum, reg) => sum + (reg.summary?.expected_balance || 0), 0),
        total_actual: registers.reduce((sum, reg) => sum + (reg.closing_amount || reg.summary?.expected_balance || 0), 0),
        total_difference: registers.reduce((sum, reg) => sum + ((reg.closing_amount || 0) - (reg.summary?.expected_balance || 0)), 0),
        registers_count: registers.length,
        closed_registers: registers.filter(reg => reg.closed_at).length
      };

      setReportData({ registers, summary });
    } catch (error) {
      console.error('Erro ao carregar relatório da Loja 2:', error);
      alert('Erro ao carregar relatório');
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
    if (!reportData) return;

    const csvContent = [
      ['Relatório de Caixa por Período - Loja 2'],
      ['Período', `${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`],
      [''],
      ['Resumo Geral'],
      ['Total de Registros', reportData.summary.registers_count.toString()],
      ['Registros Fechados', reportData.summary.closed_registers.toString()],
      ['Valor Total de Abertura', formatPrice(reportData.summary.total_opening)],
      ['Total de Vendas', formatPrice(reportData.summary.total_sales)],
      ['Outras Entradas', formatPrice(reportData.summary.total_other_income)],
      ['Total de Saídas', formatPrice(reportData.summary.total_expenses)],
      ['Saldo Esperado', formatPrice(reportData.summary.total_expected)],
      ['Saldo Real', formatPrice(reportData.summary.total_actual)],
      ['Diferença Total', formatPrice(reportData.summary.total_difference)],
      [''],
      ['Detalhes por Caixa'],
      ['ID', 'Abertura', 'Fechamento', 'Valor Abertura', 'Vendas', 'Saldo Esperado', 'Saldo Real', 'Diferença', 'Status'],
      ...reportData.registers.map(reg => [
        reg.id.slice(-8),
        new Date(reg.opened_at).toLocaleDateString('pt-BR'),
        reg.closed_at ? new Date(reg.closed_at).toLocaleDateString('pt-BR') : 'Aberto',
        formatPrice(reg.opening_amount || 0),
        formatPrice(reg.summary?.sales_total || 0),
        formatPrice(reg.summary?.expected_balance || 0),
        formatPrice(reg.closing_amount || reg.summary?.expected_balance || 0),
        formatPrice((reg.closing_amount || 0) - (reg.summary?.expected_balance || 0)),
        reg.closed_at ? 'Fechado' : 'Aberto'
      ]),
      [''],
      ['Gerado em', new Date().toLocaleString('pt-BR')]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-caixa-loja2-${startDate}-${endDate}.csv`;
    link.click();
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className={`space-y-6 ${printMode ? 'print:bg-white print:p-0' : ''}`}>
      {/* Header - Hide in print mode */}
      {!printMode && (
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-600" />
              Relatório de Caixa por Período - Loja 2
            </h2>
            <p className="text-gray-600">Análise detalhada das movimentações de caixa</p>
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
              disabled={!reportData}
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
          <h1 className="text-2xl font-bold text-center">Relatório de Caixa por Período - Elite Açaí Loja 2</h1>
          <p className="text-center text-gray-600">
            Período: {new Date(startDate).toLocaleDateString('pt-BR')} a {new Date(endDate).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-center text-gray-500 text-sm">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
          <hr className="my-4" />
        </div>
      )}

      {/* Filters - Hide in print mode */}
      {!printMode && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operador
              </label>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os operadores</option>
                {operators.map(operator => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <button
                onClick={loadReport}
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
                    Gerar Relatório
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
      ) : !reportData ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum registro encontrado
          </h3>
          <p className="text-gray-500">
            Não há registros de caixa para o período selecionado na Loja 2.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Registros de Caixa</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.summary.registers_count}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reportData.summary.closed_registers} fechados
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
                    {formatPrice(reportData.summary.total_sales)}
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
                    {formatPrice(reportData.summary.total_expected)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Diferença Total</p>
                  <p className={`text-2xl font-bold ${reportData.summary.total_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(reportData.summary.total_difference)}
                  </p>
                </div>
                {reportData.summary.total_difference >= 0 ? (
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
                <h4 className="font-medium text-gray-700">Movimentações Financeiras</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor total de abertura:</span>
                    <span className="font-medium">{formatPrice(reportData.summary.total_opening)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de vendas:</span>
                    <span className="font-medium text-green-600">{formatPrice(reportData.summary.total_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outras entradas:</span>
                    <span className="font-medium text-green-600">{formatPrice(reportData.summary.total_other_income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de saídas:</span>
                    <span className="font-medium text-red-600">{formatPrice(reportData.summary.total_expenses)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Saldos e Diferenças</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo esperado:</span>
                    <span className="font-medium text-purple-600">{formatPrice(reportData.summary.total_expected)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo real:</span>
                    <span className="font-medium">{formatPrice(reportData.summary.total_actual)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>Diferença total:</span>
                      <span className={reportData.summary.total_difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPrice(reportData.summary.total_difference)}
                        {reportData.summary.total_difference !== 0 && (
                          <span className="text-xs ml-1">
                            ({reportData.summary.total_difference > 0 ? 'sobra' : 'falta'})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registers Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Lista de Registros - Loja 2</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Abertura</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fechamento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Abertura</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vendas</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Saldo Esperado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Diferença</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.registers.map((register) => (
                    <tr key={register.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">#{register.id.slice(-8)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{formatDateTime(register.opened_at)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {register.closed_at ? formatDateTime(register.closed_at) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatPrice(register.opening_amount || 0)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-green-600">
                          {formatPrice(register.summary?.sales_total || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-purple-600">
                          {formatPrice(register.summary?.expected_balance || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          (register.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPrice(register.difference || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          register.closed_at 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {register.closed_at ? 'Fechado' : 'Aberto'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f2f2f2;
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

export default PDV2CashReportWithDateFilter;