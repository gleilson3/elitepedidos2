import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Package, 
  DollarSign, 
  Settings,
  Truck, 
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  User,
  LogOut,
  Users
} from 'lucide-react';
import AttendantPanel from './Orders/AttendantPanel'; 
import PDVSalesScreen from './PDV/PDVSalesScreen';
import CashRegisterMenu from './PDV/CashRegisterMenu';
import TableSalesPanel from './TableSales/TableSalesPanel';
import SalesHistoryPanel from './Orders/SalesHistoryPanel';
import { usePermissions } from '../hooks/usePermissions';
import { useScale } from '../hooks/useScale';
import { useOrders } from '../hooks/useOrders';
import { usePDVCashRegister } from '../hooks/usePDVCashRegister';
import { useStoreHours } from '../hooks/useStoreHours';
import { PDVOperator } from '../types/pdv';

interface UnifiedAttendancePanelProps {
  operator?: PDVOperator;
  storeSettings?: any;
  scaleHook?: ReturnType<typeof useScale>;
  onLogout?: () => void;
}

const UnifiedAttendancePage: React.FC<UnifiedAttendancePanelProps> = ({ operator, storeSettings, scaleHook, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'orders' | 'cash' | 'tables' | 'history'>('sales');
  const { hasPermission } = usePermissions(operator);
  const { storeSettings: localStoreSettings } = useStoreHours();
  const { isOpen: isCashRegisterOpen, currentRegister } = usePDVCashRegister();
  const scale = useScale();
  const { orders } = useOrders();
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  
  // Calculate pending orders count from the orders data
  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;

  // Check if user is admin
  const isAdmin = !operator || 
                  operator.code?.toUpperCase() === 'ADMIN' || 
                  operator.name?.toUpperCase().includes('ADMIN') ||
                  operator.name?.toUpperCase() === 'ADMINISTRADOR' ||
                  operator.username?.toUpperCase() === 'ADMIN' ||
                  operator.username?.toUpperCase().includes('ADMIN') ||
                  operator.role === 'admin' ||
                  operator.username === 'admin' ||
                  operator.name === 'admin';

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 UnifiedAttendancePage - Estado completo:', {
      operator: operator ? {
        id: operator.id,
        username: operator.username,
        name: operator.name,
        code: operator.code,
        role: operator.role,
        permissions: operator.permissions
      } : 'No operator',
      isAdmin,
      activeTab,
      isCashRegisterOpen,
      pendingOrdersCount
    });
  }, [operator, isAdmin]);

  const settings = storeSettings || localStoreSettings;
  
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
                <ShoppingBag size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Atendimento Unificado</h1>
                <p className="text-gray-600">Elite Açaí - Vendas, Pedidos e Caixa</p>
              </div>
            </div>
            
            {/* User info and logout */}
            {operator && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <User size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{operator.name}</span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                    title="Sair do sistema"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                )}
              </div>
            )}
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
                  Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para acesso completo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Register Warning */}
      {supabaseConfigured && !isCashRegisterOpen && (activeTab === 'sales' || activeTab === 'orders') && (
        <div className="max-w-7xl mx-auto px-4 mt-6 print:hidden">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertCircle size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Caixa Fechado</h3>
                <p className="text-yellow-700 text-sm">
                  Não é possível {activeTab === 'sales' ? 'realizar vendas' : 'visualizar pedidos'} sem um caixa aberto.
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
          <div className="flex flex-wrap gap-4">
            {(isAdmin || hasPermission('can_view_sales')) && (
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'sales'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calculator size={20} />
                Vendas
              </button>
            )}
            
            {(isAdmin || hasPermission('can_view_orders')) && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 relative ${
                  activeTab === 'orders'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Truck size={20} />
                Pedidos
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}
            
            {(isAdmin || hasPermission('can_view_cash_register')) && (
              <button
                onClick={() => setActiveTab('cash')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'cash'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DollarSign size={20} />
                Caixas
              </button>
            )}
            
            {(isAdmin || hasPermission('can_view_sales')) && (
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'tables'
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={20} />
                Vendas Mesas
              </button>
            )}
            
            {(isAdmin || hasPermission('can_view_sales')) && (
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ShoppingBag size={20} />
                Histórico
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300 print:hidden">
          {activeTab === 'sales' && (isAdmin || hasPermission('can_view_sales')) && <PDVSalesScreen operator={operator} scaleHook={scaleHook || scale} storeSettings={settings} />}
          {activeTab === 'orders' && (isAdmin || hasPermission('can_view_orders')) && <AttendantPanel storeSettings={settings} />}
          {activeTab === 'cash' && (isAdmin || hasPermission('can_view_cash_register')) && <CashRegisterMenu />}
          {activeTab === 'tables' && (isAdmin || hasPermission('can_view_sales')) && <TableSalesPanel storeId={1} operatorName={operator?.name} />}
          {activeTab === 'history' && (isAdmin || hasPermission('can_view_sales')) && <SalesHistoryPanel storeId={1} />}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAttendancePage;