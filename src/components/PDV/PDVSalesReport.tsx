import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Package, Users, Download, RefreshCw } from 'lucide-react';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { supabase } from '../../lib/supabase';

interface SalesData {
  totalSales: number;
  salesCount: number;
  pdvSales: number;
  pdvCount: number;
  deliverySales: number;
  deliveryCount: number;
  tableSales: number;
  tableCount: number;
  averageTicket: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

const PDVSalesReport: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentRegister } = usePDVCashRegister();

  const loadSalesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Carregando dados de vendas...');
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        // Use mock data if Supabase is not configured
        setSalesData({
          totalSales: 2450.80,
          salesCount: 45,
          pdvSales: 1800.60,
          pdvCount: 30,
          deliverySales: 450.20,
          deliveryCount: 10,
          tableSales: 200.00,
          tableCount: 5,
          averageTicket: 54.46,
          topProducts: [
            { name: 'Açaí 500ml', quantity: 15, revenue: 344.85 },
            { name: 'Açaí 700ml', quantity: 12, revenue: 383.88 },
            { name: 'Combo Casal', quantity: 8, revenue: 399.92 }
          ],
          paymentMethods: [
            { method: 'Dinheiro', amount: 1200.40, count: 20 },
            { method: 'PIX', amount: 800.20, count: 15 },
            { method: 'Cartão', amount: 450.20, count: 10 }
          ]
        });
        setLoading(false);
        return;
      }

      // Get sales data from database
      const { data: salesData, error: salesError } = await supabase
        .from('pdv_sales')
        .select(`
          *,
          pdv_sale_items(*)
        `)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .eq('is_cancelled', false);

      if (salesError) throw salesError;

      // Get delivery orders data
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .eq('channel', 'delivery')
        .neq('status', 'cancelled');

      if (deliveryError) {
        console.warn('Erro ao carregar pedidos de delivery:', deliveryError);
      }

      // Get table sales data
      const { data: tableData, error: tableError } = await supabase
        .from('store1_table_sales')
        .select(`
          *,
          store1_table_sale_items(*),
          store1_tables!table_id(number)
        `)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .eq('status', 'fechada');

      if (tableError) {
        console.warn('Erro ao carregar vendas de mesa:', tableError);
      }

      // Process sales data
      const pdvSales = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const pdvCount = salesData?.length || 0;
      
      const deliverySales = deliveryData?.reduce((sum, order) => sum + order.total_price, 0) || 0;
      const deliveryCount = deliveryData?.length || 0;
      
      const tableSales = tableData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const tableCount = tableData?.length || 0;
      
      const totalSales = pdvSales + deliverySales + tableSales;
      const totalCount = pdvCount + deliveryCount + tableCount;
      const averageTicket = totalCount > 0 ? totalSales / totalCount : 0;

      // Process top products
      const productMap = new Map();
      
      // Add PDV products
      salesData?.forEach(sale => {
        sale.pdv_sale_items?.forEach(item => {
          const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
          productMap.set(item.product_name, {
            name: item.product_name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.subtotal
          });
        });
      });
      
      // Add delivery products
      deliveryData?.forEach(order => {
        order.items?.forEach(item => {
          const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
          productMap.set(item.product_name, {
            name: item.product_name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.total_price
          });
        });
      });
      
      // Add table products
      tableData?.forEach(sale => {
        sale.store1_table_sale_items?.forEach(item => {
          const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
          productMap.set(item.product_name, {
            name: item.product_name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.subtotal
          });
        });
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Process payment methods
      const paymentMap = new Map();
      
      // Add PDV payments
      salesData?.forEach(sale => {
        const method = getPaymentMethodName(sale.payment_type);
        const existing = paymentMap.get(method) || { amount: 0, count: 0 };
        paymentMap.set(method, {
          method,
          amount: existing.amount + sale.total_amount,
          count: existing.count + 1
        });
      });
      
      // Add delivery payments
      deliveryData?.forEach(order => {
        const method = getPaymentMethodName(order.payment_method);
        const existing = paymentMap.get(method) || { amount: 0, count: 0 };
        paymentMap.set(method, {
          method,
          amount: existing.amount + order.total_price,
          count: existing.count + 1
        });
      });
      
      // Add table payments
      tableData?.forEach(sale => {
        const method = getPaymentMethodName(sale.payment_type);
        const existing = paymentMap.get(method) || { amount: 0, count: 0 };
        paymentMap.set(method, {
          method,
          amount: existing.amount + sale.total_amount,
          count: existing.count + 1
        });
      });

      const paymentMethods = Array.from(paymentMap.values());

      setSalesData({
        totalSales,
        salesCount: totalCount,
        pdvSales,
        pdvCount,
        deliverySales,
        deliveryCount,
        tableSales,
        tableCount,
        averageTicket,
        topProducts,
        paymentMethods
      });

      console.log('✅ Dados de vendas carregados:', {
        totalSales,
        salesCount: totalCount,
        averageTicket,
        topProducts: topProducts.length,
        paymentMethods: paymentMethods.length
      });

    } catch (err) {
      console.error('❌ Erro ao carregar dados de vendas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const exportData = () => {
    if (!salesData) return;

    const csvContent = [
      ['Relatório de Vendas - Elite Açaí'],
      ['Período', `${new Date(dateRange.start).toLocaleDateString('pt-BR')} a ${new Date(dateRange.end).toLocaleDateString('pt-BR')}`],
      [''],
      ['Resumo'],
      ['Total de Vendas', formatPrice(salesData.totalSales)],
      ['Número de Vendas', salesData.salesCount.toString()],
      ['Ticket Médio', formatPrice(salesData.averageTicket)],
      [''],
      ['Produtos Mais Vendidos'],
      ['Produto', 'Quantidade', 'Receita'],
      ...salesData.topProducts.map(product => [
        product.name,
        product.quantity.toString(),
        formatPrice(product.revenue)
      ]),
      [''],
      ['Formas de Pagamento'],
      ['Método', 'Valor', 'Quantidade'],
      ...salesData.paymentMethods.map(method => [
        method.method,
        formatPrice(method.amount),
        method.count.toString()
      ]),
      [''],
      ['Gerado em', new Date().toLocaleString('pt-BR')]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-vendas-${dateRange.start}-${dateRange.end}.csv`;
    link.click();
  };

  useEffect(() => {
    loadSalesData();
  }, [dateRange.start, dateRange.end]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} className="text-green-600" />
            Relatório de Vendas - Loja 1
          </h2>
          <p className="text-gray-600">Análise detalhada das vendas e performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSalesData}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button
            onClick={exportData}
            disabled={!salesData}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de vendas...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {salesData && !loading && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(salesData.totalSales)}
                  </p>
                  <p className="text-xs text-gray-500">{salesData.salesCount} vendas</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendas PDV</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(salesData.pdvSales)}
                  </p>
                  <p className="text-xs text-gray-500">{salesData.pdvCount} vendas</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendas Delivery</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(salesData.deliverySales)}
                  </p>
                  <p className="text-xs text-gray-500">{salesData.deliveryCount} pedidos</p>
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
                    {formatPrice(salesData.tableSales)}
                  </p>
                  <p className="text-xs text-gray-500">{salesData.tableCount} mesas</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Resumo Geral */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Geral</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{formatPrice(salesData.totalSales)}</p>
                <p className="text-gray-600">Receita Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{salesData.salesCount}</p>
                <p className="text-gray-600">Total de Vendas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{formatPrice(salesData.averageTicket)}</p>
                <p className="text-gray-600">Ticket Médio</p>
              </div>
            </div>
          </div>

          {/* Produtos Mais Vendidos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h3>
            {salesData.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Quantidade</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Receita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salesData.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-800">{product.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">{product.quantity}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-green-600">
                            {formatPrice(product.revenue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p>Nenhuma venda encontrada para o período selecionado</p>
              </div>
            )}
          </div>

          {/* Formas de Pagamento */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Formas de Pagamento</h3>
            {salesData.paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {salesData.paymentMethods.map((method, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{method.method}</span>
                      <span className="text-sm text-gray-600">{method.count} vendas</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {formatPrice(method.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                <p>Nenhum pagamento encontrado para o período selecionado</p>
              </div>
            )}
          </div>
        </>
      )}

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
    </div>
  );
};

export default PDVSalesReport;