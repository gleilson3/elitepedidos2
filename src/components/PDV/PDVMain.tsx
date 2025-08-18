import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Package, BarChart3, Settings, Users, ArrowLeft, DollarSign, Bell, FileText, LogOut, User, Layers, ChevronUp, ChevronDown, Truck, ShoppingBag, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePermissions } from '../../hooks/usePermissions';
import { useScale } from '../../hooks/useScale';
import PDVSalesScreen from './PDVSalesScreen';
import UnifiedAttendancePage from '../UnifiedAttendancePage';
import PDVProductsManager from './PDVProductsManager';
import PDVReports from './PDVReports';
import { useStoreHours } from '../../hooks/useStoreHours';
import PDVCashReportWithDateFilter from './PDVCashReportWithDateFilter';
import PDVCashReportWithDetails from './PDVCashReportWithDetails';
import PDVDailyCashReport from './PDVDailyCashReport';
import PDVDailyDeliveryReport from './PDVDailyDeliveryReport';
import PDVSettings from './PDVSettings'; 
import PDVOperators from './PDVOperators';
import PDVSalesReport from './PDVSalesReport';
import CashRegisterMenu from './CashRegisterMenu';
import AttendantPanel from '../Orders/AttendantPanel';
import { TrendingUp } from 'lucide-react';

// Define menu items before component to avoid initialization issues
// Organize menu items by category
const menuCategories = [
  {
    id: 'main',
    label: 'Principal',
    icon: Layers,
    items: [
      { id: 'attendance' as const, label: 'Vendas', icon: Calculator, color: 'bg-green-500' },
      { id: 'cash_menu' as const, label: 'Caixas', icon: DollarSign, color: 'bg-yellow-500' },
      { id: 'products' as const, label: 'Produtos', icon: Package, color: 'bg-blue-500' },
      { id: 'orders' as const, label: 'Pedidos', icon: Truck, color: 'bg-purple-500' },
      { id: 'cash_flow' as const, label: 'Fluxo de Caixa', icon: TrendingUp, color: 'bg-emerald-500' },
    ]
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    items: [
      { id: 'reports' as const, label: 'Gráficos', icon: BarChart3, color: 'bg-purple-500' },
      { id: 'sales_report' as const, label: 'Relatório de Vendas', icon: BarChart3, color: 'bg-indigo-500' },
      { id: 'daily_cash_report' as const, label: 'Relatório de Caixa Diário', icon: FileText, color: 'bg-teal-500' },
      { id: 'delivery_report' as const, label: 'Relatório de Delivery', icon: Truck, color: 'bg-purple-500' },
      { id: 'cash_report' as const, label: 'Relatório de Caixa por Período', icon: DollarSign, color: 'bg-emerald-500' },
      { id: 'cash_report_details' as const, label: 'Histórico de Caixas', icon: FileText, color: 'bg-amber-500' }
    ]
  },
  {
    id: 'management',
    label: 'Gerenciamento',
    icon: Settings,
    items: [
      { id: 'operators' as const, label: 'Operadores', icon: Users, color: 'bg-orange-500' },
      { id: 'settings' as const, label: 'Configurações', icon: Settings, color: 'bg-gray-500' },
    ]
  }
];

// Flatten menu items for permission checking
const flatMenuItems = menuCategories.flatMap(category => category.items);

// Define the operator type with permissions
interface PDVMainOperator {
  id: string;
  name: string;
  permissions: {
    can_discount: boolean;
    can_cancel: boolean;
    can_manage_products: boolean;
    can_view_sales?: boolean;
    can_view_cash_register?: boolean;
    can_view_products?: boolean;
    can_view_orders?: boolean;
    can_view_reports?: boolean;
    can_view_sales_report?: boolean;
    can_view_cash_report?: boolean;
    can_view_operators?: boolean;
  };
}

interface PDVMainProps {
  onBack?: () => void; 
  operator?: PDVMainOperator; 
}

const PDVMain: React.FC<PDVMainProps> = ({ onBack, operator }) => {
  const [activeScreen, setActiveScreen] = useState<'attendance' | 'products' | 'reports' | 'settings' | 'operators' | 'cash_register' | 'sales_report' | 'cash_report' | 'orders' | 'cash_menu' | 'daily_cash_report' | 'cash_report_details' | 'delivery_report'>('attendance');
  const { hasPermission } = usePermissions();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    main: true,
    reports: true,
    management: true
  });
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [filteredMenuCategories, setFilteredMenuCategories] = useState(menuCategories);
  const { storeSettings } = useStoreHours();
  const audioRef = useRef<HTMLAudioElement>(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true); 
  
  // Initialize scale hook at the PDVMain level
  const scaleHook = useScale();
  
  // Check for active screen in localStorage (for navigation between components)
  useEffect(() => {
    const storedScreen = localStorage.getItem('pdv_active_screen');
    if (storedScreen) {
      // Check if it's a valid screen
      const validScreens = [
        'attendance', 'products', 'reports', 'settings', 'operators', 
        'cash_register', 'sales_report', 'cash_report', 'orders', 
        'cash_menu', 'daily_cash_report', 'cash_report_details', 'delivery_report'
      ];
      
      if (validScreens.includes(storedScreen)) {
        setActiveScreen(storedScreen as any);
        // Clear the stored screen to prevent it from being used again
        localStorage.removeItem('pdv_active_screen');
      }
    }
  }, []);

  // Carregar configuração de som
  useEffect(() => {
    try {
      const soundSettings = localStorage.getItem('orderSoundSettings');
      if (soundSettings) {
        const settings = JSON.parse(soundSettings);
        setSoundEnabled(settings.enabled);
        
        // Atualizar volume do áudio
        if (audioRef.current) {
          audioRef.current.volume = settings.volume || 0.7;
        }
      } else {
        // Configuração padrão
        localStorage.setItem('orderSoundSettings', JSON.stringify({
          enabled: true,
          volume: 0.7,
          soundUrl: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de som:', error);
    }
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Verificar novos pedidos periodicamente
  useEffect(() => {
    // Função para verificar novos pedidos
    const checkNewOrders = async () => {
      try {
        console.log('🔍 Verificando novos pedidos...');
        const { data, error } = await supabase
          .from('orders')
          .select('id, status')
          .eq('status', 'pending');
        
        if (error) throw error;
        
        const newCount = data?.length || 0;
        
        // Se temos uma contagem anterior e agora temos mais pedidos, tocar alerta
        if (pendingOrdersCount > 0 && newCount > pendingOrdersCount) {
          playNotificationSound();
          
          // Mostrar notificação do navegador se permitido
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Novo Pedido!', {
              body: 'Um novo pedido de delivery foi recebido.'
            });
          }
          console.log('🔔 Novos pedidos detectados!', newCount - pendingOrdersCount);
          playNotificationSound();
        }
        
        setPendingOrdersCount(newCount);
      } catch (err) {
        console.error('Erro ao verificar novos pedidos:', err);
      }
    };
    
    // Verificar imediatamente e depois a cada 30 segundos
    checkNewOrders();
    const interval = setInterval(checkNewOrders, 30000);
    
    return () => clearInterval(interval);
  }, [pendingOrdersCount]);

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    setNewOrderAlert(true);
    
    // Verificar se o som está habilitado
    if (!soundEnabled) {
      console.log('🔕 Som de notificação desabilitado nas configurações');
      return;
    }
    
    try {
      // Reiniciar o áudio para garantir que ele toque
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.error('Erro ao tocar som:', e);
          // Tentar método alternativo
          playFallbackSound();
        });
      }
    } catch (error) {
      console.error('Erro ao tocar som de notificação:', error);
      // Tentar método alternativo
      playFallbackSound();
    }
  };

  const permissionMap = {
    'pdv': 'can_view_attendance',
    'orders': 'can_view_orders',
  };
  
  // Método alternativo para tocar som
  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Criar um som de campainha/sino
      const playBellSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Frequência mais alta para chamar atenção
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        
        // Volume inicial mais alto
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      };
      
      // Tocar o som duas vezes com intervalo para chamar mais atenção
      playBellSound();
      
      // Tocar novamente após 300ms
      setTimeout(() => {
        playBellSound();
      }, 300);
    } catch (error) {
      console.error('Erro ao tocar som de fallback:', error);
    }
  };

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
      
      // Tocar som de teste se estiver habilitando
      if (newState) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de som:', error);
    }
  };

  // Resetar alerta quando mudar para a tela de pedidos
  useEffect(() => {
    if (activeScreen === 'orders') {
      setNewOrderAlert(false);
    }
  }, [activeScreen]);

  // Filter menu items based on operator permissions
  useEffect(() => {
    if (!operator) {
      // If no operator provided, show all menu items (admin mode)
      setFilteredMenuCategories(menuCategories);
      return;
    }

    // Admin user always sees all menu items
    if (operator.code?.toUpperCase() === 'ADMIN' || 
        operator.name?.toUpperCase().includes('ADMIN') ||
        operator.name?.toUpperCase() === 'ADMINISTRADOR') {
      setFilteredMenuCategories(menuCategories);
      return;
    }

    const permissionMap: Record<string, keyof typeof operator.permissions> = {
      'sales': 'can_view_sales',
      'attendance': 'can_view_sales',
      'cash_register': 'can_view_cash_register',
      'cash_menu': 'can_view_cash_register',
      'products': 'can_view_products',
      'orders': 'can_view_orders',
      'reports': 'can_view_reports',
      'sales_report': 'can_view_sales_report',
      'cash_report': 'can_view_cash_report',
      'delivery_report': 'can_view_orders',
      'cash_report_details': 'can_view_cash_report',
      'daily_cash_report': 'can_view_cash_report',
      'operators': 'can_view_operators',
      'settings': 'can_manage_products' // Settings requires product management permission
    };

    const filteredCategories = menuCategories.map(category => {
      const filteredItems = category.items.filter(item => {
        const permissionKey = permissionMap[item.id];
        return !permissionKey || operator.permissions[permissionKey] !== false;
      });
      
      return {
        ...category,
        items: filteredItems
      };
    }).filter(category => category.items.length > 0);

    setFilteredMenuCategories(filteredCategories);
  }, [operator]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'attendance':
        return <UnifiedAttendancePage operator={operator} scaleHook={scaleHook} storeSettings={storeSettings} />;
      case 'products':
        return <PDVProductsManager />;
      case 'reports':
        return <PDVReports />;
      case 'settings':
        return <PDVSettings />;
      case 'operators':
        return <PDVOperators />;
      case 'orders':
        return <AttendantPanel />;
      case 'cash_menu':
        return <CashRegisterMenu />;
      case 'sales_report':
        return <PDVSalesReport />;
      case 'cash_report':
        return <PDVCashReportWithDateFilter />;
      case 'daily_cash_report':
        return <PDVDailyCashReport />;
      case 'delivery_report':
        return <PDVDailyDeliveryReport />;
      case 'cash_report_details':
        return <PDVCashReportWithDetails />;
      case 'cash_flow':
        // Redirect to the dedicated cash flow page
        window.location.href = '/fluxo-caixa';
        return null;
      default:
        return <UnifiedAttendancePage operator={operator} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Voltar"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
              )}
              <div className="bg-green-100 rounded-full p-2">
                <Calculator size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">PDV - Elite Açaí</h1>
                <p className="text-gray-600">Sistema de Ponto de Venda</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Logged in user info */}
              {operator && (
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <User size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{operator.name}</span>
                  <button
                    onClick={onBack}
                    className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    title="Sair"
                  >
                    <LogOut size={16} className="text-gray-600" />
                  </button>
                </div>
              )}
              
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
                <div className="relative cursor-pointer" onClick={() => setActiveScreen('orders')}>
                <Bell size={20} className={newOrderAlert ? "text-red-600" : "text-gray-600"} />
                {pendingOrdersCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${newOrderAlert ? 'animate-pulse' : ''}`}>
                    {pendingOrdersCount}
                  </span>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation with Categories */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-4">
          <div className="space-y-4">
            {filteredMenuCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-2">
                    <category.icon size={20} className="text-gray-700" />
                    <h3 className="font-medium text-gray-800">{category.label}</h3>
                  </div>
                  {expandedCategories[category.id] ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
                
                {expandedCategories[category.id] && (
                  <div className="p-3 flex flex-wrap gap-3">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeScreen === item.id;
                      
                      // Check if user has permission to see this menu item
                      const menuPermissionMap: Record<string, string> = {
                        'attendance': 'can_view_sales',
                        'cash_menu': 'can_view_cash_register',
                        'products': 'can_view_products',
                        'reports': 'can_view_reports',
                        'sales_report': 'can_view_sales_report',
                        'daily_cash_report': 'can_view_cash_report',
                        'cash_report': 'can_view_cash_report',
                        'cash_report_details': 'can_view_cash_report',
                        'operators': 'can_view_operators',
                        'settings': 'can_manage_products',
                        'pdv': 'can_view_attendance'
                      };
                      
                      const permissionNeeded = menuPermissionMap[item.id];
                      // Always show all menu items when no operator is provided (admin mode)
                      // Or when the operator is ADMIN
                      const hasMenuPermission = !operator || 
                                               operator.code?.toUpperCase() === 'ADMIN' || 
                                               operator.name?.toUpperCase().includes('ADMIN') || 
                                               !permissionNeeded || hasPermission(permissionNeeded as any);

                      // Skip rendering this menu item if user doesn't have permission
                      if (!hasMenuPermission) return null;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveScreen(item.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            isActive
                              ? `${item.color} text-white shadow-lg transform scale-105`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon size={18} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Screen Content */}
        <div className="transition-all duration-300">
          {renderScreen()}
        </div>
      </div>
      
      {/* Audio element for notification sound */}
      {/* Audio is now handled via the useRef with new Audio() */}
    </div>
  );
};

export default PDVMain;