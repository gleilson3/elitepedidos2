import React, { useState } from 'react';
import { useTableSales } from '../../hooks/useTableSales';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { useStore2PDVCashRegister } from '../../hooks/useStore2PDVCashRegister';
import { RestaurantTable, TableSale } from '../../types/table-sales';
import TableGrid from './TableGrid';
import TableSaleModal from './TableSaleModal';
import TableDetailsModal from './TableDetailsModal';
import { 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface TableSalesPanelProps {
  storeId: 1 | 2;
  operatorName?: string;
}

const TableSalesPanel: React.FC<TableSalesPanelProps> = ({ storeId, operatorName = 'Operador' }) => {
  const { tables, loading, error, createTableSale, addItemToSale, closeSale, getSaleDetails, updateTableStatus, refetch } = useTableSales(storeId);
  
  // Verificar status do caixa
  const store1CashRegister = usePDVCashRegister();
  const store2CashRegister = useStore2PDVCashRegister();
  const cashRegister = storeId === 1 ? store1CashRegister : store2CashRegister;
  
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [saleDetails, setSaleDetails] = useState<TableSale | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusStats = () => {
    const stats = {
      livre: tables.filter(t => t.status === 'livre').length,
      ocupada: tables.filter(t => t.status === 'ocupada').length,
      aguardando_conta: tables.filter(t => t.status === 'aguardando_conta').length,
      limpeza: tables.filter(t => t.status === 'limpeza').length
    };
    return stats;
  };

  const handleTableClick = async (table: RestaurantTable) => {
    setSelectedTable(table);

    if (table.status === 'livre') {
      // Mesa livre - abrir nova venda
      setShowSaleModal(true);
    } else if (table.status === 'ocupada' && table.current_sale_id) {
      // Mesa ocupada - mostrar detalhes da venda
      console.log('🔍 Buscando detalhes da venda:', table.current_sale_id);
      const details = await getSaleDetails(table.current_sale_id);
      if (details) {
        console.log('✅ Detalhes da venda carregados:', details);
        setSaleDetails(details);
        setShowDetailsModal(true);
      } else {
        console.error('❌ Não foi possível carregar detalhes da venda');
        alert('Erro ao carregar detalhes da venda. Tente novamente.');
      }
    } else if (table.status === 'aguardando_conta' && table.current_sale_id) {
      // Mesa aguardando conta - mostrar detalhes para finalizar
      console.log('💰 Mesa aguardando conta, carregando detalhes:', table.current_sale_id);
      const details = await getSaleDetails(table.current_sale_id);
      if (details) {
        setSaleDetails(details);
        setShowDetailsModal(true);
      } else {
        alert('Erro ao carregar detalhes da venda. Tente novamente.');
      }
    } else {
      console.log('ℹ️ Mesa com status:', table.status, 'sem ação específica');
    }
  };

  const handleAddItemToSale = async (saleId: string, item: any) => {
    try {
      console.log('🔄 Adicionando item à venda:', { saleId, item });
      
      // Usar a função do hook
      await addItemToSale(saleId, item);
      
      console.log('✅ Item adicionado com sucesso');
      
      // Recarregar detalhes da venda
      if (saleDetails) {
        const updatedDetails = await getSaleDetails(saleDetails.id);
        if (updatedDetails) {
          setSaleDetails(updatedDetails);
        }
        
        // Recarregar lista de mesas
        await refetch();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Erro ao adicionar item:', error);
      throw error;
    }
  };
  const handleCreateSale = async (customerName?: string, customerCount: number = 1) => {
    if (!selectedTable) return;

    try {
      await createTableSale(selectedTable.id, operatorName, customerName, customerCount);
      setShowSaleModal(false);
      setSelectedTable(null);
      // Recarregar dados após criar venda
      await refetch();
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      alert('Erro ao criar venda. Tente novamente.');
    }
  };

  const handleCloseSale = async (
    paymentType: TableSale['payment_type'],
    changeAmount: number = 0,
    discountAmount: number = 0
  ) => {
    if (!saleDetails) return;

    try {
      await closeSale(saleDetails.id, paymentType, changeAmount, discountAmount);
      setShowDetailsModal(false);
      setSaleDetails(null);
      setSelectedTable(null);
      // Recarregar dados após fechar venda
      await refetch();
    } catch (error) {
      console.error('Erro ao fechar venda:', error);
      alert('Erro ao fechar venda. Tente novamente.');
    }
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando mesas da Loja {storeId}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Erro ao carregar mesas</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Vendas por Mesa - Loja {storeId}
          </h2>
          <p className="text-gray-600">Gerencie vendas e status das mesas</p>
          {!cashRegister.isOpen && (
            <p className="text-yellow-600 text-sm font-medium">
              ⚠️ Caixa fechado - vendas não serão registradas no caixa
            </p>
          )}
        </div>
        
        <button
          onClick={refetch}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* Aviso sobre Caixa */}
      {!cashRegister.isOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Caixa Fechado - Loja {storeId}</h3>
              <p className="text-yellow-700 text-sm">
                As vendas das mesas podem ser realizadas, mas não serão registradas automaticamente no caixa. 
                Para integração completa, abra um caixa na aba "Caixas".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Mesas Livres</p>
              <p className="text-2xl font-bold text-green-700">{stats.livre}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Mesas Ocupadas</p>
              <p className="text-2xl font-bold text-blue-700">{stats.ocupada}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Aguardando Conta</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.aguardando_conta}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Em Limpeza</p>
              <p className="text-2xl font-bold text-purple-700">{stats.limpeza}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Grid de Mesas */}
      <TableGrid 
        tables={tables} 
        onTableClick={handleTableClick}
        storeId={storeId}
      />

      {/* Modal para Nova Venda */}
      {showSaleModal && selectedTable && (
        <TableSaleModal
          table={selectedTable}
          storeId={storeId}
          onClose={() => {
            setShowSaleModal(false);
            setSelectedTable(null);
          }}
          onCreateSale={handleCreateSale}
        />
      )}

      {/* Modal para Detalhes da Venda */}
      {showDetailsModal && saleDetails && selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          sale={saleDetails}
          storeId={storeId}
          onClose={() => {
            setShowDetailsModal(false);
            setSaleDetails(null);
            setSelectedTable(null);
          }}
          onCloseSale={handleCloseSale}
          onUpdateStatus={updateTableStatus}
          onAddItem={handleAddItemToSale}
        />
      )}
    </div>
  );
};

export default TableSalesPanel;