import React, { useState } from 'react';
import { RestaurantTable } from '../../types/table-sales';
import { X, Users, User } from 'lucide-react';

interface TableSaleModalProps {
  table: RestaurantTable;
  storeId: 1 | 2;
  onClose: () => void;
  onCreateSale: (customerName?: string, customerCount?: number) => void;
}

const TableSaleModal: React.FC<TableSaleModalProps> = ({
  table,
  storeId,
  onClose,
  onCreateSale
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerCount, setCustomerCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateSale(customerName || undefined, customerCount);
    } catch (error) {
      console.error('Erro ao criar venda:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Abrir Venda - {table.name}
              </h2>
              <p className="text-gray-600">Loja {storeId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Informações da Mesa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Mesa {table.number}</h3>
                <p className="text-blue-700 text-sm">
                  Capacidade: {table.capacity} pessoas
                </p>
                {table.location && (
                  <p className="text-blue-600 text-sm">{table.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Nome do Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Cliente (opcional)
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome do cliente"
              />
            </div>
          </div>

          {/* Número de Pessoas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Pessoas
            </label>
            <div className="relative">
              <Users size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                min="1"
                max={table.capacity}
                value={customerCount}
                onChange={(e) => setCustomerCount(parseInt(e.target.value) || 1)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Máximo: {table.capacity} pessoas
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Abrindo...
                </>
              ) : (
                'Abrir Venda'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableSaleModal;