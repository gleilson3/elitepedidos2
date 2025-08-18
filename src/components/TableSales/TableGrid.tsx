import React from 'react';
import { RestaurantTable } from '../../types/table-sales';
import { Users, Clock, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

interface TableGridProps {
  tables: RestaurantTable[];
  onTableClick: (table: RestaurantTable) => void;
  storeId: 1 | 2;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, onTableClick, storeId }) => {
  // Filtrar para mostrar apenas 3 mesas livres
  const getFilteredTables = () => {
    const freeTables = tables.filter(table => table.status === 'livre');
    const occupiedTables = tables.filter(table => table.status !== 'livre');
    
    // Mostrar apenas as primeiras 3 mesas livres + todas as ocupadas/outras
    const limitedFreeTables = freeTables.slice(0, 3);
    
    return [...limitedFreeTables, ...occupiedTables].sort((a, b) => a.number - b.number);
  };

  const filteredTables = getFilteredTables();
  const hiddenFreeTablesCount = tables.filter(table => table.status === 'livre').length - 3;

  const getStatusColor = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'livre':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'ocupada':
        return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      case 'aguardando_conta':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200';
      case 'limpeza':
        return 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'livre':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'ocupada':
        return <Users size={20} className="text-blue-600" />;
      case 'aguardando_conta':
        return <DollarSign size={20} className="text-yellow-600" />;
      case 'limpeza':
        return <Clock size={20} className="text-purple-600" />;
      default:
        return <AlertTriangle size={20} className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'livre':
        return 'Livre';
      case 'ocupada':
        return 'Ocupada';
      case 'aguardando_conta':
        return 'Aguardando Conta';
      case 'limpeza':
        return 'Em Limpeza';
      default:
        return 'Desconhecido';
    }
  };

  if (filteredTables.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Nenhuma mesa encontrada
        </h3>
        <p className="text-gray-500">
          Configure as mesas da Loja {storeId} no banco de dados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Layout das Mesas - Loja {storeId}
      </h3>
      
      {hiddenFreeTablesCount > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-700 text-sm">
              <strong>{hiddenFreeTablesCount} mesa(s) livre(s) oculta(s)</strong> - Exibindo apenas 3 mesas livres para organização
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredTables.map((table) => (
          <button
            key={table.id}
            onClick={() => onTableClick(table)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 cursor-pointer
              ${getStatusColor(table.status)}
            `}
          >
            {/* Número da Mesa */}
            <div className="text-center mb-2">
              <div className="text-2xl font-bold">{table.number}</div>
              <div className="text-sm font-medium">{table.name}</div>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-2">
              {getStatusIcon(table.status)}
            </div>

            {/* Status Label */}
            <div className="text-xs font-medium text-center mb-2">
              {getStatusLabel(table.status)}
            </div>

            {/* Informações Adicionais */}
            <div className="text-xs text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Users size={12} />
                <span>{table.capacity} lugares</span>
              </div>
              
              {table.location && (
                <div className="text-xs opacity-75">
                  {table.location}
                </div>
              )}

              {table.status === 'ocupada' && table.current_sale && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                  <div className="text-xs font-medium">
                    Venda #{table.current_sale.sale_number}
                  </div>
                  {table.current_sale.customer_name && (
                    <div className="text-xs">
                      {table.current_sale.customer_name}
                    </div>
                  )}
                  <div className="text-xs font-medium text-green-600">
                    R$ {(table.current_sale.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Indicador de Ação */}
            <div className="absolute top-2 right-2">
              {table.status === 'livre' && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              {table.status === 'aguardando_conta' && (
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legenda:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span>Livre - Clique para abrir venda</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <span>Ocupada - Clique para ver venda</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-yellow-600" />
            <span>Aguardando conta</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-purple-600" />
            <span>Em limpeza</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableGrid;