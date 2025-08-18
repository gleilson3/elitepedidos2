import React, { useState, useEffect } from 'react';
import { Calendar, Download, Printer, DollarSign, TrendingUp, TrendingDown, Clock, RefreshCw, Truck, Package, Users } from 'lucide-react';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { supabase } from '../../lib/supabase';

interface DailyDeliveryData {
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  pending_orders: number;
  confirmed_orders: number;
  preparing_orders: number;
  out_for_delivery_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_delivery_fees: number;
  paymentMethodsData: {
    money: number;
    pix: number;
    card: number;
  };
  neighborhoods: Array<{
    name: string;
    orders_count: number;
    total_revenue: number;
  }>;
}

const PDVDailyDeliveryReport: React.FC = () => {
  const { currentRegister } = usePDVCashRegister();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryData, setDeliveryData] = useState<DailyDeliveryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const loadDailyDeliveryReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Carregando relatório diário de delivery para:', date);
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'your_supabase_url_here' || 
          supabaseKey === 'your_supabase_anon_key_here' ||
          supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase não configurado - usando dados de demonstração');
        
        // Mock data for demonstration
        setDeliveryData({
          date,
          total_orders: 15,
          total_revenue: 485.50,
          average_order_value: 32.37,
          pending_orders: 2,
          confirmed_orders: 1,
          preparing_orders: 3,
          out_for_delivery_orders: 4,
          delivered_orders: 4,
          cancelled_orders: 1,
          total_delivery_fees: 75.00,
          paymentMethodsData: {
            money: 200.50,
            pix: 185.00,
            card: 100.00
          },
          neighborhoods: [
            { name: 'Centro', orders_count: 5, total_revenue: 162.50 },
            { name: 'Aldeota', orders_count: 4, total_revenue: 130.00 },
            { name: 'Meireles', orders_count: 3, total_revenue: 98.00 },
            { name: 'Cocó', orders_count: 3, total_revenue: 95.00 }
          ]
        });
        setLoading(false);
        return;
      }

      // Buscar pedidos de delivery do dia
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .eq('channel', 'delivery')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ Erro ao buscar pedidos de delivery:', ordersError);
        throw ordersError;
      }

      console.log(`✅ ${orders?.length || 0} pedidos de delivery encontrados para ${date}`);

      if (!orders || orders.length === 0) {
        setDeliveryData({
          date,
          total_orders: 0,
          total_revenue: 0,
          average_order_value: 0,
          pending_orders: 0,
          confirmed_orders: 0,
          preparing_orders: 0,
          out_for_delivery_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          total_delivery_fees: 0,
          paymentMethodsData: { money: 0, pix: 0, card: 0 },
          neighborhoods: []
        });
        setLoading(false);
        return;
      }

      // Processar dados dos pedidos
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      const totalDeliveryFees = orders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0);
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Contar por status
      const statusCounts = {
        pending_orders: orders.filter(o => o.status === 'pending').length,
        confirmed_orders: orders.filter(o => o.status === 'confirmed').length,
        preparing_orders: orders.filter(o => o.status === 'preparing').length,
        out_for_delivery_orders: orders.filter(o => o.status === 'out_for_delivery').length,
        delivered_orders: orders.filter(o => o.status === 'delivered').length,
        cancelled_orders: orders.filter(o => o.status === 'cancelled').length
      };

      // Processar formas de pagamento
      const paymentMethodsData = {
        money: orders.filter(o => o.payment_method === 'money').reduce((sum, o) => sum + o.total_price, 0),
        pix: orders.filter(o => o.payment_method === 'pix').reduce((sum, o) => sum + o.total_price, 0),
        card: orders.filter(o => o.payment_method === 'card').reduce((sum, o) => sum + o.total_price, 0)
      };

      // Processar por bairros
      const neighborhoodMap = new Map();
      orders.forEach(order => {
        const neighborhood = order.customer_neighborhood || 'Não informado';
        const existing = neighborhoodMap.get(neighborhood) || { orders_count: 0, total_revenue: 0 };
        neighborhoodMap.set(neighborhood, {
          name: neighborhood,
          orders_count: existing.orders_count + 1,
          total_revenue: existing.total_revenue + order.total_price
        });
      });

      const neighborhoods = Array.from(neighborhoodMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10);

      setDeliveryData({
        date,
        total_orders: orders.length,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        total_delivery_fees: totalDeliveryFees,
        ...statusCounts,
        paymentMethodsData,
        neighborhoods
      });

      console.log('✅ Relatório de delivery processado:', {
        total_orders: orders.length,
        total_revenue: totalRevenue,
        neighborhoods: neighborhoods.length
      });

    } catch (err) {
      console.error('❌ Erro ao carregar relatório de delivery:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório');
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

  const handleExport = () => {
    if (!deliveryData) return;

    const csvContent = [
      ['Relatório Diário de Delivery - Elite Açaí'],
      ['Data', new Date(date).toLocaleDateString('pt-BR')],
      [''],
      ['Resumo Geral'],
      ['Total de Pedidos', deliveryData.total_orders.toString()],
      ['Receita Total', formatPrice(deliveryData.total_revenue)],
      ['Ticket Médio', formatPrice(deliveryData.average_order_value)],
      ['Taxa de Entrega Total', formatPrice(deliveryData.total_delivery_fees)],
      [''],
      ['Status dos Pedidos'],
      ['Pendentes', deliveryData.pending_orders.toString()],
      ['Confirmados', deliveryData.confirmed_orders.toString()],
      ['Em Preparo', deliveryData.preparing_orders.toString()],
      ['Saiu para Entrega', deliveryData.out_for_delivery_orders.toString()],
      ['Entregues', deliveryData.delivered_orders.toString()],
      ['Cancelados', deliveryData.cancelled_orders.toString()],
      [''],
      ['Formas de Pagamento'],
      ['Dinheiro', formatPrice(deliveryData.paymentMethodsData.money)],
      ['PIX', formatPrice(deliveryData.paymentMethodsData.pix)],
      ['Cartão', formatPrice(deliveryData.paymentMethodsData.card)],
      [''],
      ['Top Bairros'],
      ['Bairro', 'Pedidos', 'Receita'],
      ...deliveryData.neighborhoods.map(n => [
        n.name,
        n.orders_count.toString(),
        formatPrice(n.total_revenue)
      ]),
      [''],
      ['Gerado em', new Date().toLocaleString('pt-BR')]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-delivery-diario-${date}.csv`;
    link.click();
  };

  useEffect(() => {
    loadDailyDeliveryReport();
  }, [date]);

  return (
    <div className={`space-y-6 ${printMode ? 'print:bg-white print:p-0' : ''}`}>
      {/* Header - Hide in print mode */}
      {!printMode && (
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Truck size={24} className="text-blue-600" />
              Relatório Diário de Delivery
            </h2>
            <p className="text-gray-600">Análise completa dos pedidos de delivery do dia</p>
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
              disabled={!deliveryData}
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
          <h1 className="text-2xl font-bold text-center">Relatório Diário de Delivery - Elite Açaí</h1>
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
                onClick={loadDailyDeliveryReport}
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
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      ) : !deliveryData ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum dado encontrado
          </h3>
          <p className="text-gray-500">
            Não há dados de delivery para a data selecionada.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {deliveryData.total_orders}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(deliveryData.total_revenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(deliveryData.average_order_value)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Entrega</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPrice(deliveryData.total_delivery_fees)}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Status dos Pedidos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status dos Pedidos</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{deliveryData.pending_orders}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{deliveryData.confirmed_orders}</p>
                <p className="text-sm text-gray-600">Confirmados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{deliveryData.preparing_orders}</p>
                <p className="text-sm text-gray-600">Em Preparo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{deliveryData.out_for_delivery_orders}</p>
                <p className="text-sm text-gray-600">Saiu p/ Entrega</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{deliveryData.delivered_orders}</p>
                <p className="text-sm text-gray-600">Entregues</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{deliveryData.cancelled_orders}</p>
                <p className="text-sm text-gray-600">Cancelados</p>
              </div>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Formas de Pagamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600 font-medium">Dinheiro</p>
                <p className="text-xl font-bold text-green-700">
                  {formatPrice(deliveryData.paymentMethodsData.money)}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600 font-medium">PIX</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatPrice(deliveryData.paymentMethodsData.pix)}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-600 font-medium">Cartão</p>
                <p className="text-xl font-bold text-purple-700">
                  {formatPrice(deliveryData.paymentMethodsData.card)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Bairros */}
          {deliveryData.neighborhoods.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bairros com Mais Pedidos</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Bairro</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Pedidos</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Receita</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deliveryData.neighborhoods.map((neighborhood, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-800">
                          {neighborhood.name}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {neighborhood.orders_count}
                        </td>
                        <td className="py-4 px-4 font-semibold text-green-600">
                          {formatPrice(neighborhood.total_revenue)}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {formatPrice(neighborhood.total_revenue / neighborhood.orders_count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estatísticas Adicionais */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas do Delivery</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {deliveryData.total_orders > 0 ? 
                    Math.round((deliveryData.delivered_orders / deliveryData.total_orders) * 100) : 0}%
                </p>
                <p className="text-gray-600">Taxa de Entrega</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {deliveryData.total_orders > 0 ? 
                    Math.round((deliveryData.cancelled_orders / deliveryData.total_orders) * 100) : 0}%
                </p>
                <p className="text-gray-600">Taxa de Cancelamento</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {deliveryData.neighborhoods.length}
                </p>
                <p className="text-gray-600">Bairros Atendidos</p>
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

export default PDVDailyDeliveryReport;