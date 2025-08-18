import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PDVLogin from './PDVLogin';
import PDVSalesScreen from './PDVSalesScreen';
import CashRegisterMenu from './CashRegisterMenu';
import PDVCashReportWithDetails from './PDVCashReportWithDetails';
import PDVDailyDeliveryReport from './PDVDailyDeliveryReport';
import PDVDailyCashReport from './PDVDailyCashReport';
import PDVCashReportWithDateFilter from './PDVCashReportWithDateFilter';
import PDVOperators from './PDVOperators';
import PDVProductsManager from './PDVProductsManager';
import PDVReports from './PDVReports';
import { TrendingUp } from 'lucide-react';
import PDVSettings from './PDVSettings';
import PDVSalesReport from './PDVSalesReport';
import { usePermissions } from '../../hooks/usePermissions';
import { useScale } from '../../hooks/useScale';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { useStoreHours } from '../../hooks/useStoreHours';
import { PDVOperator } from '../../types/pdv';
import { 
  Calculator, 
  DollarSign, 
  ArrowLeft,
  AlertCircle,
  User,
  LogOut,
  BarChart3,
  FileText,
  Settings,
  Package,
  Calendar,
  Truck
} from 'lucide-react';

const PDVPage: React.FC = () => {
  const navigate = useNavigate();
  const [loggedInOperator, setLoggedInOperator] = useState<PDVOperator | null>(() => {
    // Verificar se há operador salvo no localStorage
    try {
      const storedOperator = localStorage.getItem('pdv_operator');
      if (storedOperator) {
        return JSON.parse(storedOperator);
      }
    } catch (error) {
      console.error('Erro ao recuperar operador:', error);
      localStorage.removeItem('pdv_operator');
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'sales' | 'cash' | 'daily_report' | 'detailed_report' | 'period_report' | 'daily_delivery_report' | 'operators' | 'products' | 'reports' | 'settings' | 'sales_report'>('sales');
  const { hasPermission } = usePermissions(loggedInOperator);
  const { storeSettings } = useStoreHours();
  const { isOpen: isCashRegisterOpen } = usePDVCashRegister();
  const scale = useScale();
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  // Check if user is admin
  const isAdmin = !loggedInOperator || 
                  loggedInOperator.code?.toUpperCase() === 'ADMIN' ||
                  loggedInOperator.name?.toUpperCase().includes('ADMIN') ||
                  loggedInOperator.name?.toUpperCase() === 'ADMINISTRADOR';

  // Check Supabase configuration on mount
  React.useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const isConfigured = supabaseUrl && supabaseKey && 
                        supabaseUrl !== 'your_supabase_url_here' && 
                        supabaseKey !== 'your_supabase_anon_key_here' &&
                        !supabaseUrl.includes('placeholder');
    
    setSupabaseConfigured(isConfigured);
  }, []);

  const handleLogin = (operator: PDVOperator) => {
    console.log('✅ Login PDV bem-sucedido:', operator.name);
    setLoggedInOperator(operator);
    localStorage.setItem('pdv_operator', JSON.stringify(operator));
  };

  const handleLogout = () => {
    console.log('🚪 Logout PDV');
    setLoggedInOperator(null);
    localStorage.removeItem('pdv_operator');
  };

  // Se não está logado, mostrar tela de login
  if (!loggedInOperator) {
    return <PDVLogin onLogin={handleLogin} />;
  }

  // Definir abas disponíveis baseado nas permissões
  const availableTabs = [
    {
      id: 'sales' as const,
      label: 'Vendas',
      icon: Calculator,
      color: 'bg-green-600',
      permission: 'can_view_sales',
      description: 'Sistema de vendas'
    },
    {
      id: 'cash' as const,
      label: 'Caixas',
      icon: DollarSign,
      color: 'bg-yellow-500',
      permission: 'can_view_cash_register',
      description: 'Controle de caixa'
    },
    {
      id: 'operators' as const,
      label: 'Operadores',
      icon: User,
      color: 'bg-indigo-600',
      permission: 'can_view_operators',
      description: 'Gerenciar operadores'
    },
    {
      id: 'products' as const,
      label: 'Produtos',
      icon: Package,
      color: 'bg-orange-600',
      permission: 'can_manage_products',
      description: 'Gerenciar produtos'
    },
    {
      id: 'settings' as const,
      label: 'Configurações',
      icon: Settings,
      color: 'bg-gray-600',
      permission: 'can_manage_settings',
      description: 'Configurações do sistema'
    },
    {
      id: 'sales_report' as const,
      label: 'Relatório de Vendas',
      icon: TrendingUp,
      color: 'bg-emerald-600',
      permission: 'can_view_sales_report',
      description: 'Relatório de vendas'
    },
    {
      id: 'reports' as const,
      label: 'Outros Relatórios',
      icon: FileText,
      color: 'bg-pink-600',
      permission: 'can_view_reports',
      description: 'Relatórios gerais'
    },
    {
      id: 'daily_report' as const,
      label: 'Relatório Diário',
      icon: Calendar,
      color: 'bg-blue-600',
      permission: 'can_view_cash_report',
      description: 'Relatório do dia'
    },
    {
      id: 'detailed_report' as const,
      label: 'Relatório Detalhado',
      icon: FileText,
      color: 'bg-indigo-600',
      permission: 'can_view_cash_report',
      description: 'Histórico completo'
    },
    {
      id: 'period_report' as const,
      label: 'Relatório por Período',
      icon: BarChart3,
      color: 'bg-purple-600',
      permission: 'can_view_cash_report',
      description: 'Análise por período'
    },
    {
      id: 'daily_delivery_report' as const,
      label: 'Relatório Delivery Diário',
      icon: Truck,
      color: 'bg-cyan-600',
      permission: 'can_view_reports',
      description: 'Relatório diário de delivery'
    }
  ].filter(tab => isAdmin || hasPermission(tab.permission as any));

  // Add Cash Flow tab
  availableTabs.push({
    id: 'cash_flow' as const,
    label: 'Fluxo de Caixa',
    icon: TrendingUp,
    color: 'bg-emerald-600',
    permission: 'can_view_cash_report',
    description: 'Fluxo de caixa mensal'
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return <PDVSalesScreen operator={loggedInOperator} scaleHook={scale} storeSettings={storeSettings} />;
      case 'cash':
        return <CashRegisterMenu operator={loggedInOperator} />;
      case 'operators':
        return <PDVOperators />;
      case 'products':
        return <PDVProductsManager />;
      case 'settings':
        return <PDVSettings />;
      case 'sales_report':
        return <PDVSalesReport />;
      case 'reports':
        return <PDVReports />;
      case 'daily_report':
        return <PDVDailyCashReport />;
      case 'detailed_report':
        return <PDVCashReportWithDetails />;
      case 'period_report':
        return <PDVCashReportWithDateFilter />;
      case 'daily_delivery_report':
        return <PDVDailyDeliveryReport />;
      case 'cash_flow':
        // Redirect to the dedicated cash flow page
        window.location.href = '/fluxo-caixa';
        return null;
      default:
        return <PDVSalesScreen operator={loggedInOperator} scaleHook={scale} storeSettings={storeSettings} />;
    }
  };

  // Se está logado, mostrar sistema PDV completo
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo elite.jpeg" 
                alt="Elite Açaí Logo" 
                className="w-12 h-12 object-contain bg-white rounded-full p-1 border-2 border-green-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="bg-green-100 rounded-full p-2">
                <Calculator size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">PDV - Elite Açaí</h1>
                <p className="text-gray-600">Loja 1 - Sistema Completo</p>
              </div>
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                <User size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{loggedInOperator.name}</span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                title="Voltar ao site"
              >
                <ArrowLeft size={16} />
                Site
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                title="Sair do sistema"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Configuration Warning */}
      {!supabaseConfigured && (
        <div className="max-w-7xl mx-auto px-4 mt-6 print:hidden">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertCircle size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Sistema em Modo Demonstração</h3>
                <p className="text-yellow-700 text-sm">
                  O Supabase não está configurado. Algumas funcionalidades estarão limitadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Register Warning */}
      {supabaseConfigured && !isCashRegisterOpen && activeTab === 'sales' && (
        <div className="max-w-7xl mx-auto px-4 mt-6 print:hidden">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertCircle size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Caixa Fechado</h3>
                <p className="text-yellow-700 text-sm">
                  Não é possível realizar vendas sem um caixa aberto.
                  Por favor, abra um caixa primeiro na aba "Caixas".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-gray-600" />
              Sistema PDV Completo - Loja 1
            </h2>
            <div className="text-sm text-gray-500">
              {availableTabs.length} módulo(s) disponível(is)
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isActive
                      ? `${tab.color} text-white border-transparent shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-full p-2 ${
                      isActive ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <h3 className="font-semibold">{tab.label}</h3>
                  </div>
                  <p className={`text-sm ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PDVPage;