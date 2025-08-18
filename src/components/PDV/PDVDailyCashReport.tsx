import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../PermissionGuard';
import { 
  DollarSign, Calendar, Clock, Printer, Download, 
  ArrowDownCircle, ArrowUpCircle, RefreshCw, 
  ShoppingCart, Truck, Filter, Search, PieChart,
  User, CreditCard, FileText, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown
} from 'lucide-react';

interface CashSummary {
  date: string;
  pdv_sales: {
    total: number;
    count: number;
    by_payment: Record<string, { total: number; count: number }>;
  };
  delivery_sales: {
    total: number;
    count: number;
    by_payment: Record<string, { total: number; count: number }>;
  };
  manual_income: {
    total: number;
    count: number;
    by_payment: Record<string, { total: number; count: number }>;
  };
  expenses: {
    total: number;
    count: number;
    by_payment: Record<string, { total: number; count: number }>;
  };
  opening_amount: number;
  closing_amount: number | null;
  expected_balance: number;
  difference: number | null;
}

interface CashEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  payment_method: string;
  created_at: string;
  source?: 'pdv' | 'delivery' | 'manual';
}

interface DailyCashSummary {
  date: string;
  opening_amount: number;
  pdv_sales_total: number;
  delivery_sales_total: number;
  table_sales_total: number;
  sales_total: number;
  other_income_total: number;
  total_expense: number;
  expected_balance: number;
  actual_balance: number;
  difference: number;
  pdv_sales_count: number;
  delivery_sales_count: number;
  table_sales_count: number;
  sales_count: number;
  entries_count: number;
}

const PDVDailyCashReport: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailyCashSummary | null>(null);
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    pdvSales: true,
    deliverySales: true,
    manualEntries: true,
    expenses: true,
    paymentMethods: true
  });
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDailyReport();
  }, [date]);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      // Get active cash register for the selected date
      const { data, error } = await supabase
        .from('pdv_cash_registers')
        .select('*')
        .gte('opened_at', `${date}T00:00:00`)
        .lte('opened_at', `${date}T23:59:59`)
        .order('opened_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setLoading(false);
        setSummary(null);
        setEntries([]);
        return;
      }

      // Buscar vendas do PDV do dia
      const { data: pdvSales, error: pdvError } = await supabase
        .from('pdv_sales')
        .select('total_amount, payment_type')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .eq('is_cancelled', false);

      if (pdvError) {
        console.error('❌ Erro ao buscar vendas PDV:', pdvError);
        throw pdvError;
      }

      // Buscar pedidos de delivery do dia
      const { data: deliveryOrders, error: deliveryError } = await supabase
        .from('orders')
        .select('total_price, payment_method')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .eq('channel', 'delivery')
        .neq('status', 'cancelled');

      if (deliveryError) {
        console.warn('⚠️ Erro ao buscar pedidos de delivery:', deliveryError);
      }

      // Buscar vendas de mesa do dia
      const { data: tableSales, error: tableError } = await supabase
        .from('store1_table_sales')
        .select('total_amount, payment_type')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .eq('status', 'fechada');

      if (tableError) {
        console.warn('⚠️ Erro ao buscar vendas de mesa:', tableError);
      }

      console.log(`✅ ${pdvSales?.length || 0} vendas PDV encontradas para ${date}`);
      console.log(`✅ ${deliveryOrders?.length || 0} pedidos delivery encontrados para ${date}`);
      console.log(`✅ ${tableSales?.length || 0} vendas de mesa encontradas para ${date}`);

      // Calcular resumo do dia
      const dailySummary: DailyCashSummary = {
        date,
        opening_amount: data.reduce((sum, reg) => sum + (reg.opening_amount || 0), 0),
        pdv_sales_total: pdvSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0,
        delivery_sales_total: deliveryOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0,
        table_sales_total: tableSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0,
        sales_total: (pdvSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0) + 
                    (deliveryOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0) + 
                    (tableSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0),
        other_income_total: data.reduce((sum, reg) => sum + (reg.summary?.other_income_total || 0), 0),
        total_expense: data.reduce((sum, reg) => sum + (reg.summary?.total_expense || 0), 0),
        expected_balance: data.reduce((sum, reg) => sum + (reg.summary?.expected_balance || 0), 0),
        actual_balance: data.reduce((sum, reg) => sum + (reg.closing_amount || reg.summary?.expected_balance || 0), 0),
        difference: data.reduce((sum, reg) => sum + ((reg.closing_amount || 0) - (reg.summary?.expected_balance || 0)), 0),
        pdv_sales_count: pdvSales?.length || 0,
        delivery_sales_count: deliveryOrders?.length || 0,
        table_sales_count: tableSales?.length || 0,
        sales_count: (pdvSales?.length || 0) + (deliveryOrders?.length || 0) + (tableSales?.length || 0),
        entries_count: data.length
      };

      setSummary(dailySummary);
    } catch (error) {
      console.error('Error fetching daily report:', error);
      alert('Erro ao carregar relatório diário');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handlePrintThermal = () => {
    // Create a new window for thermal printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get printer settings
    const savedSettings = localStorage.getItem('pdv_settings');
    let printerSettings = {
      paper_width: '80mm',
      font_size: 2,
      scale: 1,
      margin_left: 0,
      margin_top: 1,
      margin_bottom: 1
    };

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.printer_layout) {
          printerSettings = { ...printerSettings, ...settings.printer_layout };
        }
      } catch (e) {
        console.error('Erro ao carregar configurações de impressora:', e);
      }
    }

    // Generate thermal receipt content
    const thermalContent = generateThermalContent(summary, entries, printerSettings);
    
    printWindow.document.write(thermalContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const generateThermalContent = (summary: DailyCashSummary, entries: CashEntry[], settings: any) => {
    if (!summary) return '';

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('pt-BR');
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Caixa Diário - Elite Açaí</title>
        <style>
          @page {
            size: ${settings.paper_width} auto;
            margin: 0;
            padding: 0;
          }
          
          body {
            margin: 0;
            padding: ${settings.margin_top}mm ${settings.margin_left}mm ${settings.margin_bottom}mm;
            background: white;
            font-family: 'Courier New', monospace;
            font-size: ${settings.font_size * 4}px;
            line-height: 1.3;
            color: black;
            transform: scale(${settings.scale});
            transform-origin: top left;
          }
          
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .border-b { border-bottom: 1px solid black; margin: 2mm 0; }
          .border-dashed { border-bottom: 1px dashed black; margin: 2mm 0; }
          .flex { display: flex; justify-content: space-between; }
          .mb-1 { margin-bottom: 1mm; }
          .mb-2 { margin-bottom: 2mm; }
          .small { font-size: ${settings.font_size * 3}px; }
        </style>
      </head>
      <body>
        <div class="center mb-2">
          <div class="bold">ELITE AÇAÍ</div>
          <div class="small">Relatório de Caixa Diário</div>
          <div class="small">Rua Dois, 2130-A - Residencial 1</div>
          <div class="small">Tel: (85) 98904-1010</div>
        </div>
        
        <div class="border-dashed"></div>
        
        <div class="center bold mb-2">
          RELATÓRIO DO DIA ${new Date(date).toLocaleDateString('pt-BR')}
        </div>
        
        <div class="mb-2">
          <div class="bold mb-1">RESUMO FINANCEIRO:</div>
          <div class="flex"><span>Vendas PDV:</span><span>${formatPrice(summary.pdv_sales_total)}</span></div>
          <div class="flex"><span>Vendas Delivery:</span><span>${formatPrice(summary.delivery_sales_total)}</span></div>
          <div class="flex"><span>Vendas Mesas:</span><span>${formatPrice(summary.table_sales_total)}</span></div>
          <div class="flex"><span>Outras Entradas:</span><span>${formatPrice(summary.other_income_total)}</span></div>
          <div class="flex"><span>Saídas:</span><span>${formatPrice(summary.total_expense)}</span></div>
          <div class="border-b"></div>
          <div class="flex bold"><span>SALDO FINAL:</span><span>${formatPrice(summary.expected_balance)}</span></div>
        </div>
        
        <div class="border-dashed"></div>
        
        <div class="mb-2">
          <div class="bold mb-1">CONTADORES:</div>
          <div class="flex"><span>Vendas PDV:</span><span>${summary.pdv_sales_count}</span></div>
          <div class="flex"><span>Vendas Delivery:</span><span>${summary.delivery_sales_count}</span></div>
          <div class="flex"><span>Vendas Mesas:</span><span>${summary.table_sales_count}</span></div>
          <div class="flex"><span>Total Vendas:</span><span>${summary.sales_count}</span></div>
        </div>
        
        <div class="border-dashed"></div>
        
        <div class="center small">
          <div>Relatório gerado em:</div>
          <div>${new Date().toLocaleString('pt-BR')}</div>
          <div class="mt-2">Elite Açaí - Sistema PDV</div>
          <div>CNPJ: 00.000.000/0001-00</div>
          <div>Este é um relatório interno</div>
        </div>
      </body>
      </html>
    `;
  };

  const handleExport = () => {
    if (!summary) return;

    // Create CSV content
    const headers = ['Data', 'Canal', 'Vendas', 'Receita', 'Ticket Médio'];
    const rows = [
      [date, 'PDV', summary.pdv_sales_count.toString(), formatPrice(summary.pdv_sales_total), formatPrice(summary.pdv_sales_count > 0 ? summary.pdv_sales_total / summary.pdv_sales_count : 0)],
      [date, 'Delivery', summary.delivery_sales_count.toString(), formatPrice(summary.delivery_sales_total), formatPrice(summary.delivery_sales_count > 0 ? summary.delivery_sales_total / summary.delivery_sales_count : 0)],
      [date, 'Mesas', summary.table_sales_count.toString(), formatPrice(summary.table_sales_total), formatPrice(summary.table_sales_count > 0 ? summary.table_sales_total / summary.table_sales_count : 0)],
      ['', '', '', '', ''],
      ['RESUMO', '', '', '', ''],
      ['Total Vendas', '', summary.sales_count.toString(), formatPrice(summary.sales_total), formatPrice(summary.sales_count > 0 ? summary.sales_total / summary.sales_count : 0)],
      ['Saldo Esperado', '', '', formatPrice(summary.expected_balance), ''],
      ['Diferença', '', '', formatPrice(summary.difference), '']
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-caixa-${date}.csv`;
    link.click();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <PermissionGuard hasPermission={hasPermission('can_view_cash_report') || hasPermission('can_view_cash_register')} showMessage={true}>
      <div className={`space-y-6 ${printMode ? 'print:bg-white print:p-0' : ''}`}>
        {/* Header - Hide in print mode */}
        {!printMode && (
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                Relatório de Caixa Diário
              </h2>
              <p className="text-gray-600">Resumo completo das movimentações do dia</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Printer size={16} />
                Imprimir
              </button>
              <button
                onClick={handlePrintThermal}
                disabled={!summary}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Printer size={16} />
                Impressão Térmica
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
            <h1 className="text-2xl font-bold text-center">Relatório de Caixa Diário - Elite Açaí</h1>
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
                  onClick={fetchDailyReport}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
                  disabled={loading}
                >
                  {loading ? (
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
        <div ref={printRef}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !summary ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhum registro de caixa encontrado
              </h3>
              <p className="text-gray-500">
                Não há registros de caixa para a data selecionada.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Geral</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(summary.sales_total)}
                      </p>
                      <p className="text-xs text-gray-500">{summary.sales_count} vendas</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Vendas PDV</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(summary.pdv_sales_total)}
                      </p>
                      <p className="text-xs text-gray-500">{summary.pdv_sales_count} vendas</p>
                    </div>
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Vendas Delivery</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatPrice(summary.delivery_sales_total)}
                      </p>
                      <p className="text-xs text-gray-500">{summary.delivery_sales_count} pedidos</p>
                    </div>
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9m-8-9h16" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Vendas Mesas</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatPrice(summary.table_sales_total)}
                      </p>
                      <p className="text-xs text-gray-500">{summary.table_sales_count} mesas</p>
                    </div>
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatPrice(summary.sales_total > 0 ? summary.sales_total / summary.sales_count : 0)}
                      </p>
                      <p className="text-xs text-gray-500">Média geral</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Detalhamento por Canal */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Canal de Venda</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDV (Balcão)
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Vendas:</span>
                        <span className="font-medium">{summary.pdv_sales_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Receita:</span>
                        <span className="font-bold text-green-800">{formatPrice(summary.pdv_sales_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Ticket Médio:</span>
                        <span className="font-medium">{formatPrice(summary.pdv_sales_count > 0 ? summary.pdv_sales_total / summary.pdv_sales_count : 0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9m-8-9h16" />
                      </svg>
                      Delivery
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Pedidos:</span>
                        <span className="font-medium">{summary.delivery_sales_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Receita:</span>
                        <span className="font-bold text-purple-800">{formatPrice(summary.delivery_sales_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Ticket Médio:</span>
                        <span className="font-medium">{formatPrice(summary.delivery_sales_count > 0 ? summary.delivery_sales_total / summary.delivery_sales_count : 0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Mesas
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Vendas:</span>
                        <span className="font-medium">{summary.table_sales_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Receita:</span>
                        <span className="font-bold text-orange-800">{formatPrice(summary.table_sales_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Ticket Médio:</span>
                        <span className="font-medium">{formatPrice(summary.table_sales_count > 0 ? summary.table_sales_total / summary.table_sales_count : 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo Consolidado */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Consolidado</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{formatPrice(summary.sales_total)}</p>
                    <p className="text-gray-600">Receita Total</p>
                    <p className="text-sm text-gray-500">{summary.sales_count} vendas</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{formatPrice(summary.expected_balance)}</p>
                    <p className="text-gray-600">Saldo Esperado</p>
                    <p className="text-sm text-gray-500">Em dinheiro</p>
                  </div>
                  
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${summary.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPrice(summary.difference)}
                    </p>
                    <p className="text-gray-600">Diferença</p>
                    <p className="text-sm text-gray-500">
                      {summary.difference === 0 ? 'Exato' : summary.difference > 0 ? 'Sobra' : 'Falta'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estatísticas por Canal */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas por Canal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {summary.sales_count > 0 ? Math.round((summary.pdv_sales_count / summary.sales_count) * 100) : 0}%
                    </p>
                    <p className="text-gray-600">Vendas PDV</p>
                    <p className="text-sm text-gray-500">{summary.pdv_sales_count} de {summary.sales_count}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {summary.sales_count > 0 ? Math.round((summary.delivery_sales_count / summary.sales_count) * 100) : 0}%
                    </p>
                    <p className="text-gray-600">Delivery</p>
                    <p className="text-sm text-gray-500">{summary.delivery_sales_count} de {summary.sales_count}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {summary.sales_count > 0 ? Math.round((summary.table_sales_count / summary.sales_count) * 100) : 0}%
                    </p>
                    <p className="text-gray-600">Mesas</p>
                    <p className="text-sm text-gray-500">{summary.table_sales_count} de {summary.sales_count}</p>
                  </div>
                </div>
              </div>

              {/* Caixa Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações do Caixa</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600 font-medium">Valor de Abertura</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatPrice(summary.opening_amount)}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600 font-medium">Outras Entradas</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatPrice(summary.other_income_total)}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-600 font-medium">Saídas</p>
                    <p className="text-xl font-bold text-red-700">
                      {formatPrice(summary.total_expense)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 font-medium">Saldo Real</p>
                    <p className="text-xl font-bold text-gray-700">
                      {formatPrice(summary.actual_balance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas Gerais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{summary.sales_count}</p>
                    <p className="text-gray-600">Total de Vendas</p>
                    <p className="text-sm text-gray-500">Todos os canais</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{summary.entries_count}</p>
                    <p className="text-gray-600">Registros de Caixa</p>
                    <p className="text-sm text-gray-500">Caixas abertos</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">
                      {formatPrice(summary.sales_total > 0 && summary.sales_count > 0 ? summary.sales_total / summary.sales_count : 0)}
                    </p>
                    <p className="text-gray-600">Ticket Médio</p>
                    <p className="text-sm text-gray-500">Geral</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

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
    </PermissionGuard>
  );
};

export default PDVDailyCashReport;