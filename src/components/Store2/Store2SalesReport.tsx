import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Package, Users, Download, RefreshCw, BarChart3, AlertCircle } from 'lucide-react';
import { useStore2PDVCashRegister } from '../../hooks/useStore2PDVCashRegister';
import { supabase } from '../../lib/supabase';

interface Store2SalesData {
  totalSales: number;
  salesCount: number;
  pdvSales: number;
  pdvCount: number;
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

const Store2SalesReport: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [salesData, setSalesData] = useState<Store2SalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  // Check Supabase configuration
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const isConfigured = supabaseUrl && supabaseKey && 
                        supabaseUrl !== 'your_supabase_url_here' && 
                        supabaseKey !== 'your_supabase_anon_key_here' &&
                        !supabaseUrl.includes('placeholder');
    
    setSupabaseConfigured(isConfigured);
  }, []);

  const loadSalesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Carregando dados de vendas da Loja 2...');
      
      if (!supabaseConfigured) {
        console.warn('⚠️ Supabase não configurado - usando dados de demonstração');
        
        // Mock data for demonstration
        setSalesData({
          totalSales: 1850.60,
          salesCount: 32,
          pdvSales: 1350.40,
          pdvCount: 25,
          tableSales: 500.20,
          tableCount: 7,
          averageTicket: 57.83,
          topProducts: [
            { name: 'Açaí 500ml', quantity: 12, revenue: 275.88 },
            { name: 'Açaí 700ml', quantity: 8, revenue: 251.92 },
            { name: 'Sorvete 400ml', quantity: 6, revenue: 113.94 }
          ],
          paymentMethods: [
            { method: 'Dinheiro', amount: 950.30, count: 18 },
            { method: 'PIX', amount: 600.20, count: 10 },
            { method: 'Cartão de Crédito', amount: 300.10, count: 4 }
          ]
        });
        setLoading(false);
        return;
      }

      // Buscar vendas do PDV da Loja 2
      const { data: pdvSales, error: pdvError } = await supabase
        .from('store2_sales')
        .select(`
          *,
          store2_sale_items(*)
        `)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .eq('is_cancelled', false);

      if (pdvError) throw pdvError;

      // Buscar vendas de mesa da Loja 2
      const { data: tableSales, error: tableError } = await supabase
        .from('store2_table_sales')
        .select(`
          *,
          store2_table_sale_items(*),
          store2_tables!table_id(number)
        `)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .eq('status', 'fechada');

      if (tableError) {
        console.warn('⚠️ Erro ao buscar vendas de mesa da Loja 2:', tableError);
      }

      console.log(`✅ ${pdvSales?.length || 0} vendas PDV da Loja 2 encontradas`);
      console.log(`✅ ${tableSales?.length || 0} vendas de mesa da Loja 2 encontradas`);

      // Calcular totais
      const pdvSalesTotal = pdvSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const pdvSalesCount = pdvSales?.length || 0;
      
      const tableSalesTotal = tableSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const tableSalesCount = tableSales?.length || 0;
      
      const totalSales = pdvSalesTotal + tableSalesTotal;
      const totalCount = pdvSalesCount + tableSalesCount;
      const averageTicket = totalCount > 0 ? totalSales / totalCount : 0;

      // Processar produtos mais vendidos
      const productMap = new Map();
      
      // Adicionar produtos do PDV
      pdvSales?.forEach(sale => {
        sale.store2_sale_items?.forEach(item => {
          const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
          productMap.set(item.product_name, {
            name: item.product_name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.subtotal
          });
        });
      });
      
      // Adicionar produtos das mesas
      tableSales?.forEach(sale => {
        sale.store2_table_sale_items?.forEach(item => {
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

      // Processar formas de pagamento
      const paymentMap = new Map();
      
      // Adicionar pagamentos do PDV
      pdvSales?.forEach(sale => {
        const method = getPaymentMethodName(sale.payment_type);
        const existing = paymentMap.get(method) || { amount: 0, count: 0 };
        paymentMap.set(method, {
          method,
          amount: existing.amount + sale.total_amount,
          count: existing.count + 1
        });
      });
      
      // Adicionar pagamentos das mesas
      tableSales?.forEach(sale => {
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
        pdvSales: pdvSalesTotal,
        pdvCount: pdvSalesCount,
        tableSales: tableSalesTotal,
        tableCount: tableSalesCount,
        averageTicket,
        topProducts,
        paymentMethods
      });

      console.log('✅ Dados de vendas da Loja 2 carregados:', {
        totalSales,
        salesCount: totalCount,
        averageTicket,
        topProducts: topProducts.length,
        paymentMethods: paymentMethods.length
      });

    } catch (err) {
      console.error('❌ Erro ao carregar dados de vendas da Loja 2:', err);
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
      ['Relatório de Vendas - Elite Açaí Loja 2'],
      ['Período', `${new Date(dateRange.start).toLocaleDateString('pt-BR')} a ${new Date(dateRange.end).toLocaleDateString('pt-BR')}`],
      [''],
      ['Resumo'],
      ['Total de Vendas', formatPrice(salesData.totalSales)],
      ['Número de Vendas', salesData.salesCount.toString()],
      ['Ticket Médio', formatPrice(salesData.averageTicket)],
      [''],
      ['Por Canal'],
      ['Vendas PDV', formatPrice(salesData.pdvSales), salesData.pdvCount.toString()],
      ['Vendas Mesas', formatPrice(salesData.tableSales), salesData.tableCount.toString()],
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
    link.download = `relatorio-vendas-loja2-${dateRange.start}-${dateRange.end}.csv`;
    link.click();
  };

  useEffect(() => {
    loadSalesData();
  }, [dateRange.start, dateRange.end]);

  return (
    <div className="space-y-6">
      {/* Supabase Configuration Warning */}
      {!supabaseConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Modo Demonstração - Loja 2</h3>
              <p className="text-yellow-700 text-sm">
                Supabase não configurado. Exibindo dados de demonstração.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-600" />
            Relatório de Vendas - Loja 2
          </h2>
          <p className="text-gray-600">Análise detalhada das vendas e performance da Loja 2</p>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de vendas da Loja 2...</p>
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
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(salesData.totalSales)}
                  </p>
                  <p className="text-xs text-gray-500">{salesData.salesCount} vendas</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
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
                  <p className="text-sm font-medium text-gray-600">Vendas Mesas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPrice(salesData.tableSales)}
                  </p>
                  <p className="text-xs text-gray-500">{salesData.tableCount} mesas</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(salesData.averageTicket)}
                  </p>
                  <p className="text-xs text-gray-500">Média geral</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Detalhamento por Canal */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Canal de Venda - Loja 2</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Package size={20} />
                  PDV (Balcão)
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Vendas:</span>
                    <span className="font-medium">{salesData.pdvCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Receita:</span>
                    <span className="font-bold text-blue-800">{formatPrice(salesData.pdvSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Ticket Médio:</span>
                    <span className="font-medium">{formatPrice(salesData.pdvCount > 0 ? salesData.pdvSales / salesData.pdvCount : 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">% do Total:</span>
                    <span className="font-medium">{salesData.totalSales > 0 ? Math.round((salesData.pdvSales / salesData.totalSales) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <Users size={20} />
                  Mesas (Presencial)
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-700">Vendas:</span>
                    <span className="font-medium">{salesData.tableCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-700">Receita:</span>
                    <span className="font-bold text-orange-800">{formatPrice(salesData.tableSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-700">Ticket Médio:</span>
                    <span className="font-medium">{formatPrice(salesData.tableCount > 0 ? salesData.tableSales / salesData.tableCount : 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-700">% do Total:</span>
                    <span className="font-medium">{salesData.totalSales > 0 ? Math.round((salesData.tableSales / salesData.totalSales) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Geral */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Geral - Loja 2</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{formatPrice(salesData.totalSales)}</p>
                <p className="text-gray-600">Receita Total</p>
                <p className="text-sm text-gray-500">Todos os canais</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{salesData.salesCount}</p>
                <p className="text-gray-600">Total de Vendas</p>
                <p className="text-sm text-gray-500">PDV + Mesas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{formatPrice(salesData.averageTicket)}</p>
                <p className="text-gray-600">Ticket Médio</p>
                <p className="text-sm text-gray-500">Geral</p>
              </div>
            </div>
          </div>

          {/* Produtos Mais Vendidos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos - Loja 2</h3>
            {salesData.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Posição</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Quantidade</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Receita</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">% do Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salesData.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-800">{product.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700 font-medium">{product.quantity}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-green-600">
                            {formatPrice(product.revenue)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {salesData.totalSales > 0 ? Math.round((product.revenue / salesData.totalSales) * 100) : 0}%
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Formas de Pagamento - Loja 2</h3>
            {salesData.paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {salesData.paymentMethods.map((method, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{method.method}</span>
                      <span className="text-sm text-gray-600">{method.count} vendas</span>
                    </div>
                    <p className="text-xl font-bold text-purple-600">
                      {formatPrice(method.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {salesData.totalSales > 0 ? Math.round((method.amount / salesData.totalSales) * 100) : 0}% do total
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

          {/* Estatísticas por Canal */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas por Canal - Loja 2</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {salesData.salesCount > 0 ? Math.round((salesData.pdvCount / salesData.salesCount) * 100) : 0}%
                </p>
                <p className="text-gray-600">Vendas PDV</p>
                <p className="text-sm text-gray-500">{salesData.pdvCount} de {salesData.salesCount}</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {salesData.salesCount > 0 ? Math.round((salesData.tableCount / salesData.salesCount) * 100) : 0}%
                </p>
                <p className="text-gray-600">Vendas Mesas</p>
                <p className="text-sm text-gray-500">{salesData.tableCount} de {salesData.salesCount}</p>
              </div>
            </div>
          </div>

          {/* Informações da Loja 2 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">ℹ️ Informações sobre a Loja 2</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• A Loja 2 não possui sistema de delivery</li>
                  <li>• Vendas são realizadas apenas no PDV e nas mesas</li>
                  <li>• Relatórios são independentes da Loja 1</li>
                  <li>• Dados salvos nas tabelas store2_sales e store2_table_sales</li>
                  <li>• Localização: Rua Dois, 2130‑A – Residencial 1 – Cágado</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Store2SalesReport;