import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../../hooks/useDeliveryAuth';
import { useDeliveryOrders } from '../../hooks/useDeliveryOrders';
import { DeliveryOrder } from '../../types/delivery-driver';
import DeliveryOrderCard from './DeliveryOrderCard';
import { 
  Truck, 
  RefreshCw, 
  LogOut, 
  Package,
  User,
  AlertCircle,
  Clock
} from 'lucide-react';

const DeliveryOrdersPage: React.FC = () => {
  const { user, signOut } = useDeliveryAuth();
  const { orders, loading, error, refetch } = useDeliveryOrders();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [overdueCount, setOverdueCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    totalFees: 0,
    averageFee: 0,
    completedDeliveries: 0
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Auto refresh orders every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-atualizando pedidos...');
      refetch();
      setLastRefresh(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(autoRefreshInterval);
  }, [autoRefresh, refetch]);

  // Update last refresh time when orders change
  useEffect(() => {
    setLastRefresh(new Date());
  }, [orders]);

  // Calculate overdue orders
  useEffect(() => {
    const now = new Date();
    const overdue = orders.filter(order => {
      const orderTime = new Date(order.created_at);
      const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
      return diffMinutes > 20;
    }).length;
    
    setOverdueCount(overdue);
  }, [orders, currentTime]);

  // Calculate delivery statistics
  useEffect(() => {
    // Usar apenas pedidos não cancelados da semana atual
    const weekOrders = orders.filter(order => order.status !== 'cancelled');
    
    const completedOrders = weekOrders.filter(order => 
      order.status === 'delivered'
    );
    
    const totalFees = weekOrders.reduce((sum, order) => 
      sum + (order.delivery_fee || 0), 0
    );
    
    const completedFees = completedOrders.reduce((sum, order) => 
      sum + (order.delivery_fee || 0), 0
    );
    
    setDeliveryStats({
      totalDeliveries: weekOrders.length,
      totalFees: completedFees,
      averageFee: completedOrders.length > 0 ? completedFees / completedOrders.length : 0,
      completedDeliveries: completedOrders.length
    });
  }, [orders]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    if (!autoRefresh) {
      // If enabling auto-refresh, refresh immediately
      refetch();
      setLastRefresh(new Date());
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handlePrint = (order: DeliveryOrder) => {
    // Create print window with order details
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir');
      return;
    }

    const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    const getPaymentMethodLabel = (method: string) => method === 'money' ? 'Dinheiro' : method === 'pix' ? 'PIX' : method === 'card' ? 'Cartão' : method;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${order.id.slice(-8)}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; color: black !important; background: white !important; }
          body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; padding: 2mm; width: 76mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .small { font-size: 10px; }
          .separator { border-bottom: 1px dashed black; margin: 5px 0; padding-bottom: 5px; }
          .flex-between { display: flex; justify-content: space-between; align-items: center; }
          .mb-1 { margin-bottom: 2px; }
          .mb-2 { margin-bottom: 5px; }
          .mb-3 { margin-bottom: 8px; }
          .ml-2 { margin-left: 8px; }
        </style>
      </head>
      <body>
        <div class="center mb-3 separator">
          <div class="bold" style="font-size: 16px;">ELITE AÇAÍ</div>
          <div class="small">Pedido para Entrega</div>
          <div class="small">Tel: (85) 98904-1010</div>
        </div>
        
        <div class="mb-3 separator">
          <div class="bold center mb-2">=== PEDIDO #${order.id.slice(-8)} ===</div>
          <div class="small">Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
          <div class="small">Hora: ${new Date(order.created_at).toLocaleTimeString('pt-BR')}</div>
        </div>
        
        <div class="mb-3 separator">
          <div class="bold mb-1">CLIENTE:</div>
          <div class="small">Nome: ${order.customer_name}</div>
          <div class="small">Telefone: ${order.customer_phone}</div>
          <div class="small">Endereço: ${order.customer_address}</div>
          <div class="small">Bairro: ${order.customer_neighborhood}</div>
          ${order.customer_complement ? `<div class="small">Complemento: ${order.customer_complement}</div>` : ''}
        </div>
        
        <div class="mb-3 separator">
          <div class="bold mb-1">ITENS:</div>
          ${order.items.map((item, index) => `
            <div class="mb-2">
              <div class="bold">${item.product_name}</div>
              ${item.selected_size ? `<div class="small">Tamanho: ${item.selected_size}</div>` : ''}
              <div class="flex-between">
                <span class="small">${item.quantity}x ${formatPrice(item.unit_price)}</span>
                <span class="small">${formatPrice(item.total_price)}</span>
              </div>
              ${item.complements.length > 0 ? `
                <div class="ml-2">
                  <div class="small">Complementos:</div>
                  ${item.complements.map(comp => `
                    <div class="small ml-2">• ${comp.name}${comp.price > 0 ? ` (+${formatPrice(comp.price)})` : ''}</div>
                  `).join('')}
                </div>
              ` : ''}
              ${item.observations ? `<div class="small ml-2">Obs: ${item.observations}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="mb-3 separator">
          <div class="bold mb-1">TOTAL:</div>
          <div class="flex-between bold">
            <span>VALOR:</span>
            <span>${formatPrice(order.total_price)}</span>
          </div>
        </div>
        
        <div class="mb-3 separator">
          <div class="bold mb-1">PAGAMENTO:</div>
          <div class="small">Forma: ${getPaymentMethodLabel(order.payment_method)}</div>
          ${order.change_for ? `<div class="small">Troco para: ${formatPrice(order.change_for)}</div>` : ''}
        </div>
        
        <div class="center small">
          <div class="bold mb-2">Elite Açaí</div>
          <div>Entrega confirmada</div>
          <div>Impresso: ${new Date().toLocaleString('pt-BR')}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handleWhatsApp = (order: DeliveryOrder) => {
    const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    const getPaymentMethodLabel = (method: string) => method === 'money' ? 'Dinheiro' : method === 'pix' ? 'PIX' : method === 'card' ? 'Cartão' : method;

    let message = `🚚 *ENTREGA - ELITE AÇAÍ*\n\n`;
    message += `📋 *Pedido #${order.id.slice(-8)}*\n`;
    message += `👤 Cliente: ${order.customer_name}\n`;
    message += `📱 Telefone: ${order.customer_phone}\n`;
    message += `📍 Endereço: ${order.customer_address}, ${order.customer_neighborhood}\n`;
    if (order.customer_complement) {
      message += `🏠 Complemento: ${order.customer_complement}\n`;
    }
    message += `\n`;

    message += `🛒 *ITENS:*\n`;
    order.items.forEach((item, index) => {
      message += `${index + 1}. ${item.product_name}\n`;
      if (item.selected_size) {
        message += `   Tamanho: ${item.selected_size}\n`;
      }
      message += `   Qtd: ${item.quantity}x - ${formatPrice(item.total_price)}\n`;
      
      if (item.complements.length > 0) {
        message += `   Complementos:\n`;
        item.complements.forEach(comp => {
          message += `   • ${comp.name}`;
          if (comp.price > 0) {
            message += ` (+${formatPrice(comp.price)})`;
          }
          message += `\n`;
        });
      }
      
      if (item.observations) {
        message += `   Obs: ${item.observations}\n`;
      }
      message += `\n`;
    });

    message += `💰 *TOTAL: ${formatPrice(order.total_price)}*\n`;
    message += `💳 Pagamento: ${getPaymentMethodLabel(order.payment_method)}\n`;
    if (order.change_for) {
      message += `💵 Troco para: ${formatPrice(order.change_for)}\n`;
    }
    message += `\n`;

    message += `📍 *LOCALIZAÇÃO:*\n`;
    const fullAddress = `${order.customer_address}, ${order.customer_neighborhood}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    message += `https://www.google.com/maps/search/?api=1&query=${encodedAddress}\n\n`;

    message += `🕐 Pedido feito em: ${new Date(order.created_at).toLocaleString('pt-BR')}\n\n`;
    message += `Amanda Suyelen da Costa Pereira - Elite Açaí - Entrega confirmada! 🍧`;

    const phoneNumber = order.customer_phone.replace(/\D/g, '');
    const phoneWithCountryCode = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    
    window.open(`https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Função para obter informações da semana atual
  const getWeekInfo = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    
    // Calcular início da semana (segunda às 10h)
    let daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
    if (currentDay === 1 && currentHour < 10) {
      daysToSubtract = 7;
    }
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToSubtract);
    weekStart.setHours(10, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return {
      start: weekStart,
      end: weekEnd,
      isNewWeekSoon: currentDay === 1 && currentHour >= 9 && currentHour < 10
    };
  };

  const weekInfo = getWeekInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Truck size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Portal do Entregador</h1>
                <p className="text-sm sm:text-base text-gray-600">Pedidos confirmados para entrega</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {user && (
                <div className="flex items-center gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                  <User size={18} className="text-gray-600" />
                  <span className="font-medium text-gray-700 truncate max-w-32 sm:max-w-none">
                    {user.user_metadata?.name || user.email}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={toggleAutoRefresh}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-1 sm:flex-none ${
                    autoRefresh 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                  title={autoRefresh ? 'Desativar atualização automática' : 'Ativar atualização automática'}
                >
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="hidden sm:inline">{autoRefresh ? 'Auto' : 'Manual'}</span>
                </button>
                
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-1 sm:flex-none"
                  title="Atualizar pedidos manualmente"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1 sm:gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-1 sm:flex-none"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Delivery Earnings Summary */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Ganhos da Semana
              </h2>
              <p className="text-green-100 text-sm">
                {weekInfo.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a {weekInfo.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                {weekInfo.isNewWeekSoon && (
                  <span className="ml-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    ⏰ Nova semana em breve!
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(deliveryStats.totalFees)}
              </p>
              <p className="text-green-100 text-sm">Total em Taxas</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{deliveryStats.totalDeliveries}</p>
              <p className="text-green-100 text-sm">Pedidos Semana</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{deliveryStats.completedDeliveries}</p>
              <p className="text-green-100 text-sm">Entregues</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-lg font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(deliveryStats.averageFee)}
              </p>
              <p className="text-green-100 text-sm">Taxa Média</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-lg font-bold">
                {deliveryStats.totalDeliveries > 0 
                  ? Math.round((deliveryStats.completedDeliveries / deliveryStats.totalDeliveries) * 100)
                  : 0}%
              </p>
              <p className="text-green-100 text-sm">Taxa Entrega</p>
            </div>
          </div>
          
          {deliveryStats.totalDeliveries > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso da Semana:</span>
                <span>{deliveryStats.completedDeliveries} de {deliveryStats.totalDeliveries} pedidos</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ 
                    width: `${deliveryStats.totalDeliveries > 0 
                      ? (deliveryStats.completedDeliveries / deliveryStats.totalDeliveries) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Informação sobre o ciclo semanal */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span>📅 Ciclo Semanal:</span>
              <span>Segunda 10h → Segunda 10h</span>
            </div>
            <div className="text-xs text-green-100 mt-1">
              {weekInfo.isNewWeekSoon 
                ? '⏰ Nova semana começa em breve (Segunda 10h)'
                : 'Semana atual em andamento'
              }
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <Package size={24} className="text-green-600" />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  Pedidos da Semana
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {orders.length} pedido(s) confirmados nesta semana
                </p>
                <p className="text-xs text-gray-500">
                  📅 {weekInfo.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} 10h → {weekInfo.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} 10h
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Última atualização: {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {autoRefresh && (
                    <span className="text-xs text-green-600 font-medium">
                      • Auto (30s)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Total Orders */}
              <div className="text-center sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {orders.length}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              
              {/* Overdue Orders */}
              {overdueCount > 0 && (
                <div className="text-center sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {overdueCount}
                  </p>
                  <p className="text-sm text-red-500">Urgentes</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Overdue Alert */}
          {overdueCount > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  ⚠️ {overdueCount} pedido(s) há mais de 20 minutos aguardando entrega!
                </p>
                </div>
                {autoRefresh && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Monitorando</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <h3 className="text-sm sm:text-base font-medium text-red-800">Erro ao carregar pedidos</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4 sm:space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">
                Pedidos da Semana Atual
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {orders.length} pedido(s) desta semana
              </p>
              <p className="text-xs text-gray-400 mt-2">
                📅 Semana: {weekInfo.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a {weekInfo.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </p>
              {autoRefresh && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Verificando novos pedidos automaticamente a cada 30s</span>
                </div>
              )}
            </div>
          ) : (
            orders
              .sort((a, b) => {
                // Sort by urgency first (overdue orders first), then by creation time
                const now = new Date();
                const aTime = new Date(a.created_at);
                const bTime = new Date(b.created_at);
                const aMinutes = Math.floor((now.getTime() - aTime.getTime()) / (1000 * 60));
                const bMinutes = Math.floor((now.getTime() - bTime.getTime()) / (1000 * 60));
                
                const aOverdue = aMinutes > 20;
                const bOverdue = bMinutes > 20;
                
                // Overdue orders first
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                
                // Then by creation time (oldest first)
                return aTime.getTime() - bTime.getTime();
              })
              .map(order => (
              <DeliveryOrderCard
                key={order.id}
                order={order}
                onPrint={handlePrint}
                onWhatsApp={handleWhatsApp}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrdersPage;