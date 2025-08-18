import React, { useState } from 'react';
import '../../index.css';
import { 
  Calculator, 
  DollarSign, 
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  User,
  LogOut,
  Store,
  Users
} from 'lucide-react';
import Store2PDVSalesScreen from './Store2PDVSalesScreen';
import Store2CashRegisterMenu from './Store2CashRegisterMenu';
import TableSalesPanel from '../TableSales/TableSalesPanel';
import SalesHistoryPanel from '../Orders/SalesHistoryPanel';
import { useScale } from '../../hooks/useScale';
import { useStore2PDVCashRegister } from '../../hooks/useStore2PDVCashRegister';
import { PDVOperator } from '../../types/pdv';

interface Store2UnifiedAttendancePageProps {
  operator?: PDVOperator;
  onLogout?: () => void;
}

const Store2UnifiedAttendancePage: React.FC<Store2UnifiedAttendancePageProps> = ({ operator, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'cash' | 'tables' | 'history'>('sales');
  const { isOpen: isCashRegisterOpen } = useStore2PDVCashRegister();
  const scale = useScale();
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

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
                className="w-12 h-12 object-contain bg-white rounded-full p-1 border-2 border-blue-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="bg-blue-100 rounded-full p-2">
                <Store size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Loja 2 - Atendimento</h1>
                <p className="text-gray-600">Elite Açaí - Unidade 2 (Rua Dois, 2130‑A)</p>
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
                <h3 className="font-medium text-yellow-800">Sistema em Modo Demonstração - Loja 2</h3>
                <p className="text-yellow-700 text-sm">
                  O Supabase não está configurado. Algumas funcionalidades estarão limitadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Register Warning */}
      {supabaseConfigured && !isCashRegisterOpen && (activeTab === 'sales') && (
        <div className="max-w-7xl mx-auto px-4 mt-6 print:hidden">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertCircle size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Caixa Fechado - Loja 2</h3>
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
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'sales'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calculator size={20} />
              Vendas
            </button>
            
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
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300 print:hidden">
          {activeTab === 'sales' && <Store2PDVSalesScreen operator={operator} scaleHook={scale} />}
          {activeTab === 'cash' && <Store2CashRegisterMenu />}
          {activeTab === 'tables' && <TableSalesPanel storeId={2} operatorName={operator?.name} />}
          {activeTab === 'history' && <SalesHistoryPanel storeId={2} />}
        </div>
      </div>
    </div>
  );
};

export default Store2UnifiedAttendancePage;