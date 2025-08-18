import React, { useState } from 'react';
import { RestaurantTable, TableSale } from '../../types/table-sales';
import { X, Plus, Trash2, CreditCard, Banknote, QrCode, Users, DollarSign, Clock } from 'lucide-react';
import AddItemModal from './AddItemModal';

interface TableDetailsModalProps {
  table: RestaurantTable;
  sale: TableSale;
  storeId: 1 | 2;
  onClose: () => void;
  onCloseSale: (paymentType: TableSale['payment_type'], changeAmount?: number, discountAmount?: number) => Promise<void>;
  onUpdateStatus: (tableId: string, status: RestaurantTable['status']) => Promise<void>;
  onAddItem?: (saleId: string, item: any) => Promise<void>;
}

const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  table,
  sale,
  storeId,
  onClose,
  onCloseSale,
  onUpdateStatus,
  onAddItem
}) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [paymentType, setPaymentType] = useState<TableSale['payment_type']>('dinheiro');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleCloseSale = async () => {
    setLoading(true);
    try {
      await onCloseSale(paymentType, changeAmount, discountAmount);
    } catch (error) {
      console.error('Erro ao fechar venda:', error);
      alert('Erro ao fechar venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (item: any) => {
    try {
      console.log('🔄 Iniciando adição de item:', item);
      
      if (onAddItem) {
        await onAddItem(sale.id, item);
        
        console.log('✅ Item adicionado com sucesso, fechando modal');
        setShowAddItem(false);
        
        // Mostrar feedback de sucesso
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
        successMessage.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Item adicionado com sucesso!
        `;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert(`Erro ao adicionar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const subtotal = sale.subtotal || 0;
  const finalTotal = subtotal - discountAmount;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {table.name} - Venda #{sale.sale_number}
                </h2>
                <p className="text-gray-600">
                  Loja {storeId} • Aberta em {formatDateTime(sale.opened_at)}
                </p>
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
          <div className="p-6 space-y-6">
            {/* Informações da Venda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-blue-600" />
                  <h3 className="font-medium text-blue-800">Cliente</h3>
                </div>
                <p className="text-blue-700">
                  {sale.customer_name || 'Não informado'}
                </p>
                <p className="text-blue-600 text-sm">
                  {sale.customer_count} pessoa(s)
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-green-600" />
                  <h3 className="font-medium text-green-800">Total</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatPrice(finalTotal)}
                </p>
                {discountAmount > 0 && (
                  <p className="text-green-600 text-sm">
                    Desconto: {formatPrice(discountAmount)}
                  </p>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} className="text-purple-600" />
                  <h3 className="font-medium text-purple-800">Status</h3>
                </div>
                <p className="text-purple-700 capitalize">
                  {sale.status === 'aberta' ? 'Em andamento' : sale.status}
                </p>
                <p className="text-purple-600 text-sm">
                  Operador: {sale.operator_name}
                </p>
              </div>
            </div>

            {/* Itens da Venda */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Itens da Venda ({sale.items?.length || 0})
                </h3>
                {sale.status === 'aberta' && (
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Adicionar Item
                  </button>
                )}
              </div>

              {sale.items && sale.items.length > 0 ? (
                <div className="space-y-3">
                  {sale.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.product_name}</h4>
                          <p className="text-sm text-gray-600">Código: {item.product_code}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic">Obs: {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {item.weight_kg ? (
                              `${item.weight_kg}kg × ${formatPrice((item.price_per_gram || 0) * 1000)}/kg`
                            ) : (
                              `${item.quantity}x × ${formatPrice(item.unit_price || 0)}`
                            )}
                          </p>
                          <p className="font-semibold text-green-600">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum item adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                </div>
              )}
            </div>

            {/* Finalizar Venda */}
            {sale.status === 'aberta' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Finalizar Venda</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Forma de Pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Forma de Pagamento
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="dinheiro"
                          checked={paymentType === 'dinheiro'}
                          onChange={(e) => setPaymentType(e.target.value as any)}
                          className="text-green-600"
                        />
                        <Banknote size={20} className="text-green-600" />
                        <span>Dinheiro</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="pix"
                          checked={paymentType === 'pix'}
                          onChange={(e) => setPaymentType(e.target.value as any)}
                          className="text-blue-600"
                        />
                        <QrCode size={20} className="text-blue-600" />
                        <span>PIX</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="cartao_credito"
                          checked={paymentType === 'cartao_credito'}
                          onChange={(e) => setPaymentType(e.target.value as any)}
                          className="text-purple-600"
                        />
                        <CreditCard size={20} className="text-purple-600" />
                        <span>Cartão de Crédito</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="cartao_debito"
                          checked={paymentType === 'cartao_debito'}
                          onChange={(e) => setPaymentType(e.target.value as any)}
                          className="text-indigo-600"
                        />
                        <CreditCard size={20} className="text-indigo-600" />
                        <span>Cartão de Débito</span>
                      </label>
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desconto (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={subtotal}
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    {paymentType === 'dinheiro' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Troco para (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={finalTotal}
                          value={changeAmount}
                          onChange={(e) => setChangeAmount(parseFloat(e.target.value) || 0)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {changeAmount > finalTotal && (
                          <p className="text-sm text-green-600 mt-1">
                            Troco: {formatPrice(changeAmount - finalTotal)}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Final:</span>
                        <span className="text-green-600">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => onUpdateStatus(table.id, 'aguardando_conta')}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Aguardar Conta
                  </button>
                  <button
                    onClick={handleCloseSale}
                    disabled={loading || finalTotal <= 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Finalizando...' : 'Finalizar Venda'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Item */}
      {showAddItem && (
        <AddItemModal
          isOpen={showAddItem}
          onClose={() => setShowAddItem(false)}
          onAddItem={handleAddItem}
          storeId={storeId}
        />
      )}
    </>
  );
};

export default TableDetailsModal;