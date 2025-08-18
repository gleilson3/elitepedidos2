import React, { useState } from 'react';
import { Package, MapPin, Clock, Users, LogOut, ShoppingBag, Settings, Calculator, DollarSign, Truck, BarChart3, FileText } from 'lucide-react';
import ProductsPanel from './ProductsPanel';
import NeighborhoodsPanel from './NeighborhoodsPanel';
import StoreHoursPanel from './StoreHoursPanel';
import UnifiedAttendancePage from '../UnifiedAttendancePage';
import AttendanceUsersPanel from './AttendanceUsersPanel';
import AttendantPanel from '../Orders/AttendantPanel';
import CashRegisterMenu from '../PDV/CashRegisterMenu';
import PDVSalesScreen from '../PDV/PDVSalesScreen';
import TableSalesPanel from '../TableSales/TableSalesPanel';
import SalesHistoryPanel from '../Orders/SalesHistoryPanel';
import PDVReports from '../PDV/PDVReports';
import PDVSalesReport from '../PDV/PDVSalesReport';
import PDVDailyCashReport from '../PDV/PDVDailyCashReport';
import { useScale } from '../../hooks/useScale';
import { useStoreHours } from '../../hooks/useStoreHours';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'neighborhoods' | 'hours' | 'pdv' | 'users' | 'sales' | 'orders' | 'cash' | 'tables' | 'history' | 'reports' | 'sales_report' | 'daily_report'>('products');
  const scale = useScale();
  const { storeSettings } = useStoreHours();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsPanel />;
      case 'neighborhoods':
        return <NeighborhoodsPanel />;
      case 'hours':
        return <StoreHoursPanel />; 
      case 'pdv':
        return <UnifiedAttendancePage />;
      case 'users':
        return <AttendanceUsersPanel />;
      case 'sales':
        return <PDVSalesScreen scaleHook={scale} storeSettings={storeSettings} />;
      case 'orders':
        return <AttendantPanel storeSettings={storeSettings} />;
      case 'cash':
        return <CashRegisterMenu />;
      case 'tables':
        return <TableSalesPanel storeId={1} operatorName="Administrador" />;
      case 'history':
        return <SalesHistoryPanel storeId={1} />;
      case 'reports':
        return <PDVReports />;
      case 'sales_report':
        return <PDVSalesReport />;
      case 'daily_report':
        return <PDVDailyCashReport />;
      default:
        return <ProductsPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <ShoppingBag size={24} className="text-purple-600" />
              </div>
              <div>
              <h1 className="text-2xl font-bold text-gray-800">Administrativo</h1>
              <p className="text-gray-600">Elite Açaí - Gestão Completa</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Gestão Básica */}
            <button
              onClick={() => setActiveTab('products')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'products'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package size={20} />
              <span className="text-sm">Produtos</span>
            </button>
            <button
              onClick={() => setActiveTab('neighborhoods')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'neighborhoods'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MapPin size={20} />
              <span className="text-sm">Bairros</span>
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'hours'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock size={20} />
              <span className="text-sm">Horários</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={20} />
              <span className="text-sm">Usuários</span>
            </button>
            
            {/* Operações */}
            <button
              onClick={() => setActiveTab('sales')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'sales'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calculator size={20} />
              <span className="text-sm">Vendas PDV</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Truck size={20} />
              <span className="text-sm">Pedidos</span>
            </button>
            <button
              onClick={() => setActiveTab('cash')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'cash'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign size={20} />
              <span className="text-sm">Caixas</span>
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'tables'
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={20} />
              <span className="text-sm">Mesas</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'history'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingBag size={20} />
              <span className="text-sm">Histórico</span>
            </button>
            
            {/* Relatórios */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'reports'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={20} />
              <span className="text-sm">Relatórios</span>
            </button>
            <button
              onClick={() => setActiveTab('sales_report')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'sales_report'
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={20} />
              <span className="text-sm">Vendas</span>
            </button>
            <button
              onClick={() => setActiveTab('daily_report')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'daily_report'
                  ? 'bg-slate-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={20} />
              <span className="text-sm">Caixa Diário</span>
            </button>
            
            {/* PDV Unificado */}
            <button
              onClick={() => setActiveTab('pdv')}
              className={`p-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-2 text-center ${
                activeTab === 'pdv'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings size={20} />
              <span className="text-sm">PDV Completo</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;