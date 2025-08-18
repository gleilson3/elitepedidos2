import React, { useState, useEffect } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../PermissionGuard';
import OrderPrintView from './OrderPrintView';
import OrderCard from './OrderCard';
import ManualOrderForm from './ManualOrderForm';
import { OrderStatus } from '../../types/order';
import { 
  Filter, 
  Search, 
  Bell, 
  Package, 
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ArrowLeft,
  Settings,
  Plus
} from 'lucide-react';

interface AttendantPanelProps {
  onBackToAdmin?: () => void;
  storeSettings?: any;
}

const AttendantPanel: React.FC<AttendantPanelProps> = ({ onBackToAdmin, storeSettings }) => {
  const { hasPermission } = usePermissions();
  const { orders, loading, updateOrderStatus } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [showManualOrderForm, setShowManualOrderForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [newOrder, setNewOrder] = useState<any | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Carregar configuração de som
  useEffect(() => {
    try {
      const soundSettings = localStorage.getItem('orderSoundSettings');
      if (soundSettings) {
        const settings = JSON.parse(soundSettings);
        setSoundEnabled(settings.enabled);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de som:', error);
    }
  }, []);

  // Carregar configurações de impressora
  const [printerSettings, setPrinterSettings] = useState({
    auto_print_delivery: false,
    auto_print_enabled: false
  });
  
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('pdv_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.printer_layout) {
          setPrinterSettings({
            auto_print_delivery: settings.printer_layout.auto_print_delivery || false,
            auto_print_enabled: settings.printer_layout.auto_print_enabled || false
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de impressora:', error);
    }
  }, []);

  // Carregar configurações de impressão automática do banco
  useEffect(() => {
    const loadPrinterSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('pdv_settings')
          .select('auto_print')
          .eq('id', 'loja1')
          .single();

        if (data && !error) {
          setPrinterSettings(prev => ({
            ...prev,
            auto_print_enabled: data.auto_print || false,
            auto_print_delivery: data.auto_print || false
          }));
          console.log('✅ Configurações de impressão carregadas:', data.auto_print);
        }
      } catch (err) {
        console.warn('⚠️ Erro ao carregar configurações de impressão:', err);
      }
    };

    loadPrinterSettings();
  }, []);
  // Alternar som de notificação
  const toggleSound = () => {
    try {
      const newState = !soundEnabled;
      setSoundEnabled(newState);
      
      // Salvar no localStorage
      const soundSettings = localStorage.getItem('orderSoundSettings');
      const settings = soundSettings ? JSON.parse(soundSettings) : { volume: 0.7, soundUrl: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" };
      settings.enabled = newState;
      localStorage.setItem('orderSoundSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de som:', error);
    }
  };

  // Efeito para tocar som quando novos pedidos chegarem
  useEffect(() => {
    // Contar pedidos pendentes
    const currentPendingCount = orders.filter(order => order.status === 'pending').length;
    setPendingOrdersCount(currentPendingCount);
    
    // Verificar se há novos pedidos pendentes
    if (currentPendingCount > lastOrderCount && lastOrderCount >= 0) {
      console.log('🔔 Novos pedidos detectados!');
      
      // Encontrar o novo pedido
      const pendingOrders = orders.filter(order => order.status === 'pending');
      const newOrders = pendingOrders.slice(0, currentPendingCount - lastOrderCount);
      
      if (newOrders.length > 0) {
        // Pegar o pedido mais recente
        const latestOrder = newOrders.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        setNewOrder(latestOrder);
        
        console.log('🖨️ Verificando configuração de impressão automática:', {
          auto_print_enabled: printerSettings.auto_print_enabled,
          auto_print_delivery: printerSettings.auto_print_delivery,
          newOrderId: latestOrder.id
        });
        
        // Imprimir automaticamente se configurado
        if (printerSettings.auto_print_enabled && latestOrder.status === 'pending') {
          console.log('🖨️ Imprimindo pedido automaticamente:', latestOrder.id);
          setShowPrintPreview(true);
          
          // Mostrar notificação de impressão automática
          const printNotification = document.createElement('div');
          printNotification.className = 'fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
          printNotification.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimindo pedido #${latestOrder.id.slice(-8)} automaticamente
          `;
          document.body.appendChild(printNotification);
          
          setTimeout(() => {
            if (document.body.contains(printNotification)) {
              document.body.removeChild(printNotification);
            }
          }, 4000);
        }
        
        // Verificar se o som está habilitado
        if (soundEnabled) {
          playNewOrderSound(latestOrder);
        } else {
          console.log('🔕 Som de notificação desabilitado nas configurações');
        }
      }
    }
    
    // Atualizar contagem para próxima verificação
    setLastOrderCount(currentPendingCount);
  }, [orders, lastOrderCount, soundEnabled, printerSettings.auto_print_enabled]);

  // Função para tocar som de novo pedido
  const playNewOrderSound = (order: any) => {
    console.log('🔊 Tocando som de notificação para novo pedido');
    try {
      // Obter configuração de som do localStorage
      const soundSettings = localStorage.getItem('orderSoundSettings');
      const settings = soundSettings ? JSON.parse(soundSettings) : { enabled: true, volume: 0.7, soundUrl: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" };
      
      // Verificar se o som está habilitado
      if (!settings.enabled) {
        console.log('🔕 Som de notificação desabilitado nas configurações');
        return;
      }
      
      // Criar um elemento de áudio e tocar o som configurado
      const audio = new Audio(settings.soundUrl);
      audio.volume = settings.volume; // Ajustar volume conforme configuração
      audio.play().catch(e => {
        console.error('Erro ao tocar som de notificação:', e);
        // Tentar método alternativo se falhar
        playFallbackSound();
      });
      
      // Criar descrição com produtos
      if (order && order.items) {
        const productNames = order.items.map(item => 
          `${item.product_name} (${item.quantity}x)`
        ).join(', ');
        
        const orderDescription = `Pedido Delivery #${order.id.slice(-8)} - ${productNames}`;
        
        // Mostrar notificação visual também, se suportado pelo navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Novo Pedido!', {
            body: orderDescription.length > 100 ? 
              `Pedido Delivery #${order.id.slice(-8)} - ${order.items.length} item(s)` : 
            orderDescription,
            icon: '/vite.svg'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao tocar som de notificação:', error);
      // Tentar método alternativo se falhar
      playFallbackSound();
    }
  };
  
  // Método alternativo para tocar som
  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Criar sequência de sons para chamar mais atenção
      const playTone = (freq: number, time: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + duration);
        
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + duration);
      };
      
      // Tocar sequência de notas (como uma campainha)
      playTone(1200, 0, 0.2);
      playTone(900, 0.3, 0.2);
      playTone(1200, 0.6, 0.3);
    } catch (error) {
      console.error('Erro ao tocar som de fallback:', error);
    }
  };

  // Função para gerar mensagem de resumo de pedidos pendentes
  const generatePendingOrdersMessage = (pendingOrders: any[]) => {
    let message = `🔔 *RESUMO DE PEDIDOS PENDENTES - ELITE AÇAÍ*\n\n`;
    message += `📊 *${pendingOrders.length} pedido(s) aguardando confirmação*\n\n`;
    
    pendingOrders.forEach((order, index) => {
      message += `*${index + 1}. Pedido #${order.id.slice(-8)}*\n`;
      message += `👤 Cliente: ${order.customer_name}\n`;
      message += `📱 Telefone: ${order.customer_phone}\n`;
      message += `📍 Endereço: ${order.customer_address}, ${order.customer_neighborhood}\n`;
      message += `💰 Total: ${formatPrice(order.total_price)}\n`;
      message += `💳 Pagamento: ${getPaymentMethodLabel(order.payment_method)}\n`;
      message += `🕐 Recebido: ${formatDate(order.created_at)}\n\n`;
    });
    
    const totalValue = pendingOrders.reduce((sum, order) => sum + order.total_price, 0);
    message += `💵 *Valor Total dos Pedidos: ${formatPrice(totalValue)}*\n\n`;
    message += `⚠️ *Ação Necessária:* Confirmar pedidos para iniciar preparo\n\n`;
    message += `📱 Elite Açaí - Sistema de Atendimento\n`;
    message += `🕐 Enviado em: ${new Date().toLocaleString('pt-BR')}`;
    
    return encodeURIComponent(message);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'pix': 'PIX',
      'money': 'Dinheiro',
      'card': 'Cartão',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito'
    };
    return methods[method] || method;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length;
  };

  const statusOptions = [
    { value: 'all' as const, label: 'Todos', count: orders.length, icon: Package },
    { value: 'pending' as const, label: 'Pendentes', count: getStatusCount('pending'), icon: Clock },
    { value: 'confirmed' as const, label: 'Confirmados', count: getStatusCount('confirmed'), icon: CheckCircle },
    { value: 'preparing' as const, label: 'Em Preparo', count: getStatusCount('preparing'), icon: Package },
    { value: 'out_for_delivery' as const, label: 'Saiu p/ Entrega', count: getStatusCount('out_for_delivery'), icon: Truck },
    { value: 'ready_for_pickup' as const, label: 'Pronto p/ Retirada', count: getStatusCount('ready_for_pickup'), icon: Package },
    { value: 'delivered' as const, label: 'Entregues', count: getStatusCount('delivered'), icon: CheckCircle },
    { value: 'cancelled' as const, label: 'Cancelados', count: getStatusCount('cancelled'), icon: XCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard hasPermission={hasPermission('can_view_orders')} showMessage={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b print:hidden">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onBackToAdmin && (
                  <button
                    onClick={onBackToAdmin}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Voltar ao painel administrativo"
                  >
                    <ArrowLeft size={20} className="text-gray-600" />
                  </button>
                )}
                <div className="bg-purple-100 rounded-full p-2">
                  <Package size={24} className="text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Painel de Atendimento</h1>
                  <p className="text-gray-600">Gerencie pedidos e converse com clientes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSound}
                  className={`p-2 rounded-full transition-colors ${soundEnabled ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={soundEnabled ? "Desativar som de notificações" : "Ativar som de notificações"}
                >
                  {soundEnabled ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.343 9.657a2 2 0 000 2.828l1.414 1.414a4 4 0 01-1.414 1.414l-1.414-1.414a2 2 0 00-2.828 0L2.1 14.9a2 2 0 000 2.828l1.414 1.414a2 2 0 002.828 0l1.414-1.414a4 4 0 011.414-1.414l-1.414-1.414a2 2 0 000-2.828L6.343 9.657z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15.414a2 2 0 002.828 0l1.414-1.414a4 4 0 011.414-1.414l-1.414-1.414a2 2 0 000-2.828L6.343 9.657a2 2 0 00-2.828 0L2.1 14.9a2 2 0 000 2.828l1.414 1.414a2 2 0 002.828 0l1.414-1.414a4 4 0 011.414-1.414l-1.414-1.414a2 2 0 000-2.828L6.343 9.657z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setShowManualOrderForm(true)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Plus size={16} />
                  Pedido Manual
                </button>
                <div className="relative">
                  <Bell size={20} className="text-gray-600" />
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                </div>
                {onBackToAdmin && (
                  <button
                    onClick={onBackToAdmin}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Settings size={16} />
                    Admin
                  </button>
                )}
                {printerSettings.auto_print_enabled && (
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Auto Print
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 print:hidden">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome, telefone ou ID do pedido..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-64">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-4 print:hidden">
              {statusOptions.map(option => {
                const Icon = option.icon;
                const isActive = statusFilter === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mx-auto mb-1" />
                    <div className="text-xs font-medium">{option.label}</div>
                    <div className="text-lg font-bold">{option.count}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4 print:hidden">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Aguardando novos pedidos...'
                  }
                </p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  isAttendant={true}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Manual Order Form */}
        {showManualOrderForm && (
          <ManualOrderForm 
            onClose={() => setShowManualOrderForm(false)}
            onOrderCreated={() => {
              // Refresh orders after creating a new one
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
          />
        )}
        
        {/* Print Preview Modal */}
        {showPrintPreview && newOrder && (
          <OrderPrintView 
            order={newOrder} 
            storeSettings={null}
            onClose={() => {
              setShowPrintPreview(false);
              setNewOrder(null);
            }} 
          />
        )}
      </div>
    </PermissionGuard>
  );
};

export default AttendantPanel;