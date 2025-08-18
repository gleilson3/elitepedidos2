import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingUp, Package, RefreshCw, AlertCircle, DollarSign } from 'lucide-react';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { supabase } from '../../lib/supabase';

interface ReportData {
  lowStockProducts: Array<{
    id: string;
    name: string;
    code: string;
    stock_quantity: number;
    min_stock: number;
  }>;
  salesSummary: {
    totalSales: number;
    salesCount: number;
    averageTicket: number;
  };
  operatorPerformance: Array<{
    operator_name: string;
    sales_count: number;
    total_amount: number;
  }>;
}

const PDVReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentRegister } = usePDVCashRegister();

  const reportTypes = [
    {
      id: 'inventory',
      name: 'Relatório de Estoque',
      description: 'Produtos em estoque, baixo estoque e movimentações',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      id: 'performance',
      name: 'Relatório de Performance',
      description: 'Análise de vendas por operador e período',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 'financial',
      name: 'Relatório Financeiro',
      description: 'Resumo financeiro completo e análises',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  const loadReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📊 Carregando dados dos relatórios...');

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        // Use mock data if Supabase is not configured
        setReportData({
          lowStockProducts: [
            { id: '1', name: 'Açaí 300ml', code: 'ACAI300', stock_quantity: 5, min_stock: 10 },
            { id: '2', name: 'Granola', code: 'GRAN001', stock_quantity: 2, min_stock: 5 }
          ],
          salesSummary: {
            totalSales: 1250.80,
            salesCount: 25,
            averageTicket: 50.03
          },
          operatorPerformance: [
            { operator_name: 'Administrador', sales_count: 15, total_amount: 750.50 },
            { operator_name: 'Operador 1', sales_count: 10, total_amount: 500.30 }
          ]
        });
        setLoading(false);
        return;
      }

      // Load low stock products
      const { data: lowStockData, error: stockError } = await supabase
        .from('pdv_low_stock_products')
        .select('*')
        .limit(10);

      if (stockError) {
        console.warn('Erro ao carregar produtos com baixo estoque:', stockError);
      }

      // Load sales summary for today
      const today = new Date().toISOString().split('T')[0];
      const { data: salesData, error: salesError } = await supabase
        .from('pdv_sales')
        .select('total_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .eq('is_cancelled', false);

      if (salesError) {
        console.warn('Erro ao carregar resumo de vendas:', salesError);
      }

      // Load delivery orders
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .eq('channel', 'delivery')
        .neq('status', 'cancelled');

      if (deliveryError) {
        console.warn('Erro ao carregar pedidos de delivery:', deliveryError);
      }

      // Load table sales
      const { data: tableData, error: tableError } = await supabase
        .from('store1_table_sales')
        .select('total_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .eq('status', 'fechada');

      if (tableError) {
        console.warn('Erro ao carregar vendas de mesa:', tableError);
      }

      const pdvSales = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const pdvCount = salesData?.length || 0;
      
      const deliverySales = deliveryData?.reduce((sum, order) => sum + order.total_price, 0) || 0;
      const deliveryCount = deliveryData?.length || 0;
      
      const tableSales = tableData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const tableCount = tableData?.length || 0;
      
      const totalSales = pdvSales + deliverySales + tableSales;
      const totalCount = pdvCount + deliveryCount + tableCount;
      const averageTicket = totalCount > 0 ? totalSales / totalCount : 0;

      // Load operator performance
      const { data: operatorData, error: operatorError } = await supabase
        .from('pdv_sales_report')
        .select('operator_name, total_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .limit(10);

      if (operatorError) {
        console.warn('Erro ao carregar performance dos operadores:', operatorError);
      }

      // Process operator performance
      const operatorMap = new Map();
      operatorData?.forEach(sale => {
        const existing = operatorMap.get(sale.operator_name) || { sales_count: 0, total_amount: 0 };
        operatorMap.set(sale.operator_name, {
          operator_name: sale.operator_name,
          sales_count: existing.sales_count + 1,
          total_amount: existing.total_amount + sale.total_amount
        });
      });

      setReportData({
        lowStockProducts: lowStockData || [],
        salesSummary: {
          totalSales,
          salesCount: totalCount,
          pdvSales,
          pdvCount,
          deliverySales,
          deliveryCount,
          tableSales,
          tableCount,
          averageTicket
        },
        operatorPerformance: Array.from(operatorMap.values())
      });

      console.log('✅ Dados dos relatórios carregados');

    } catch (err) {
      console.error('❌ Erro ao carregar dados dos relatórios:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (reportId: string) => {
    setSelectedReport(reportId);
    
    if (!reportData) {
      loadReportData();
      return;
    }
    
    // Generate report based on type
    let csvContent = '';
    
    switch (reportId) {
      case 'inventory':
        csvContent = [
          ['Relatório de Estoque - Elite Açaí'],
          ['Data', new Date().toLocaleDateString('pt-BR')],
          [''],
          ['Produtos com Baixo Estoque'],
          ['Código', 'Nome', 'Estoque Atual', 'Estoque Mínimo', 'Diferença'],
          ...reportData.lowStockProducts.map(product => [
            product.code,
            product.name,
            product.stock_quantity.toString(),
            product.min_stock.toString(),
            (product.stock_quantity - product.min_stock).toString()
          ]),
          [''],
          ['Gerado em', new Date().toLocaleString('pt-BR')]
        ].map(row => row.join(',')).join('\n');
        break;
        
      case 'performance':
        csvContent = [
          ['Relatório de Performance - Elite Açaí'],
          ['Data', new Date().toLocaleDateString('pt-BR')],
          [''],
          ['Performance por Operador'],
          ['Operador', 'Vendas', 'Total'],
          ...reportData.operatorPerformance.map(op => [
            op.operator_name,
            op.sales_count.toString(),
            formatPrice(op.total_amount)
          ]),
          [''],
          ['Gerado em', new Date().toLocaleString('pt-BR')]
        ].map(row => row.join(',')).join('\n');
        break;
        
      case 'financial':
        csvContent = [
          ['Relatório Financeiro - Elite Açaí'],
          ['Data', new Date().toLocaleDateString('pt-BR')],
          [''],
          ['Resumo Financeiro'],
          ['Total de Vendas', formatPrice(reportData.salesSummary.totalSales)],
          ['Número de Vendas', reportData.salesSummary.salesCount.toString()],
          ['Ticket Médio', formatPrice(reportData.salesSummary.averageTicket)],
          [''],
          ['Gerado em', new Date().toLocaleString('pt-BR')]
        ].map(row => row.join(',')).join('\n');
        break;
    }
    
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio-${reportId}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
    successMessage.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Relatório gerado e baixado com sucesso!
    `;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        document.body.removeChild(successMessage);
      }
    }, 3000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  useEffect(() => {
    loadReportData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={24} className="text-blue-600" />
            Outros Relatórios - Loja 1
          </h2>
          <p className="text-gray-600">Relatórios gerais e análises do sistema</p>
        </div>
        <button
          onClick={loadReportData}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar Dados
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados dos relatórios...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {reportData && !loading && (
        <>
          {/* Resumo Rápido */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo do Dia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Total de Vendas</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatPrice(reportData.salesSummary.totalSales)}
                </p>
                <p className="text-xs text-gray-500">{reportData.salesSummary.salesCount} vendas</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Vendas PDV</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatPrice(reportData.salesSummary.pdvSales)}
                </p>
                <p className="text-xs text-gray-500">{reportData.salesSummary.pdvCount} vendas</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Vendas Delivery</p>
                <p className="text-2xl font-bold text-purple-700">
                  {formatPrice(reportData.salesSummary.deliverySales)}
                </p>
                <p className="text-xs text-gray-500">{reportData.salesSummary.deliveryCount} pedidos</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-600 font-medium">Vendas Mesas</p>
                <p className="text-2xl font-bold text-orange-700">
                  {formatPrice(reportData.salesSummary.tableSales)}
                </p>
                <p className="text-xs text-gray-500">{reportData.salesSummary.tableCount} mesas</p>
              </div>
            </div>
            
            {/* Ticket Médio */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Ticket Médio Geral</p>
              <p className="text-3xl font-bold text-indigo-600">
                {formatPrice(reportData.salesSummary.averageTicket)}
              </p>
            </div>
          </div>

          {/* Produtos com Baixo Estoque */}
          {reportData.lowStockProducts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-600" />
                Produtos com Baixo Estoque
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Código</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Estoque</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Mínimo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.lowStockProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-mono text-sm">{product.code}</td>
                        <td className="py-4 px-4 font-medium">{product.name}</td>
                        <td className="py-4 px-4">{product.stock_quantity}</td>
                        <td className="py-4 px-4">{product.min_stock}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Baixo Estoque
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${report.color} rounded-full p-3`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{report.name}</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              
              <button
                onClick={() => generateReport(report.id)}
                disabled={loading}
                className={`w-full ${report.color} hover:opacity-90 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <Download size={16} />
                {loading ? 'Carregando...' : 'Gerar Relatório'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Relatórios Recentes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-gray-600" />
          Relatórios Recentes
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Relatório de Vendas - Hoje</p>
              <p className="text-sm text-gray-600">Gerado em {new Date().toLocaleString('pt-BR')}</p>
            </div>
            <button 
              onClick={() => generateReport('financial')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Baixar Novamente
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Relatório de Estoque - Hoje</p>
              <p className="text-sm text-gray-600">Gerado em {new Date().toLocaleString('pt-BR')}</p>
            </div>
            <button 
              onClick={() => generateReport('inventory')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Baixar Novamente
            </button>
          </div>
        </div>
      </div>

      {/* Status do Caixa */}
      {currentRegister && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            <p className="text-blue-700">
              <strong>Caixa Atual:</strong> #{currentRegister.id.slice(-8)} - 
              Aberto em {new Date(currentRegister.opened_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      )}

      {/* Configurações de Relatórios */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Gerar relatórios automaticamente
              </span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Incluir gráficos nos relatórios
              </span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Enviar relatórios por email
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDVReports;