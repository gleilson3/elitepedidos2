import React, { useState, useEffect } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { useNeighborhoods } from '../../hooks/useNeighborhoods';
import { products } from '../../data/products';
import { 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  MessageCircle, 
  Save,
  ShoppingBag,
  Search,
  X,
  AlertCircle
} from 'lucide-react';

interface ManualOrderFormProps {
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

const ManualOrderForm: React.FC<ManualOrderFormProps> = ({ onClose, onOrderCreated }) => {
  const { createOrder } = useOrders();
  const { isOpen: isCashRegisterOpen, currentRegister } = usePDVCashRegister();
  const { neighborhoods } = useNeighborhoods();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNeighborhood, setCustomerNeighborhood] = useState('');
  const [customerComplement, setCustomerComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'pix' | 'card'>('money');
  const [changeFor, setChangeFor] = useState<number | undefined>(undefined);
  const [items, setItems] = useState<Array<{
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    observations?: string;
    complements: Array<{ name: string; price: number }>;
  }>>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter products based on search term
  const filteredProducts = searchTerm
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Calculate total price
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.total_price, 0);
  };
  
  // Get delivery fee based on neighborhood
  const getDeliveryFee = () => {
    const neighborhood = neighborhoods.find(n => n.name === customerNeighborhood);
    return neighborhood ? neighborhood.delivery_fee : 0;
  };
  
  // Get estimated delivery time based on neighborhood
  const getEstimatedDeliveryTime = () => {
    const neighborhood = neighborhoods.find(n => n.name === customerNeighborhood);
    return neighborhood ? neighborhood.delivery_time : 50;
  };
  
  // Add product to order
  const addProduct = () => {
    if (!selectedProduct) return;
    
    const newItem = {
      id: `item-${Date.now()}`,
      product_name: selectedProduct.name,
      product_image: selectedProduct.image,
      quantity,
      unit_price: selectedProduct.price,
      total_price: selectedProduct.price * quantity,
      observations,
      complements: [] // No complements for manual orders to keep it simple
    };
    
    setItems(prev => [...prev, newItem]);
    setSelectedProduct(null);
    setQuantity(1);
    setObservations('');
    setSearchTerm('');
  };
  
  // Remove item from order
  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          total_price: item.unit_price * newQuantity
        };
      }
      return item;
    }));
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('Adicione pelo menos um item ao pedido');
      return;
    }
    
    if (!customerName || !customerPhone || !customerAddress || !customerNeighborhood) {
      alert('Preencha todos os dados do cliente');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const neighborhood = neighborhoods.find(n => n.name === customerNeighborhood);
      
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_neighborhood: customerNeighborhood,
        customer_complement: customerComplement,
        payment_method: paymentMethod,
        change_for: changeFor,
        neighborhood_id: neighborhood?.id,
        delivery_fee: getDeliveryFee(),
        estimated_delivery_minutes: getEstimatedDeliveryTime(),
        items,
        total_price: getTotalPrice() + getDeliveryFee(),
        status: 'confirmed' as const,
        channel: 'manual' as const
      };
      
      const newOrder = await createOrder(orderData);
      
      if (onOrderCreated) {
        onOrderCreated(newOrder.id);
      }
      
      alert('Pedido criado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="text-purple-600" size={24} />
              Criar Pedido Manual
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Dados do Cliente</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <div className="relative">
                  <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={customerNeighborhood}
                    onChange={(e) => setCustomerNeighborhood(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Selecione o bairro</option>
                    {neighborhoods.map(neighborhood => (
                      <option key={neighborhood.id} value={neighborhood.name}>
                        {neighborhood.name} - {formatPrice(neighborhood.delivery_fee)} ({neighborhood.delivery_time}min)
                      </option>
                    ))}
                  </select>
                </div>
                {customerNeighborhood && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span className="font-medium">{formatPrice(getDeliveryFee())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo estimado:</span>
                      <span className="font-medium">{getEstimatedDeliveryTime()} minutos</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Rua, número"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={customerComplement}
                  onChange={(e) => setCustomerComplement(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Apartamento, bloco, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de pagamento *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      value="money"
                      checked={paymentMethod === 'money'}
                      onChange={() => setPaymentMethod('money')}
                      className="text-purple-600"
                    />
                    <span>Dinheiro</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      className="text-purple-600"
                    />
                    <span>PIX</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-purple-600"
                    />
                    <span>Cartão</span>
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'money' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Troco para quanto?
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={changeFor || ''}
                    onChange={(e) => setChangeFor(parseFloat(e.target.value) || undefined)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Valor para troco"
                  />
                </div>
              )}
            </div>
            
            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Itens do Pedido</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="relative mb-3">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {searchTerm && filteredProducts.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg mb-3">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchTerm('');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{formatPrice(product.price)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedProduct && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={selectedProduct.image} 
                          alt={selectedProduct.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{selectedProduct.name}</div>
                          <div className="text-sm text-green-600 font-semibold">{formatPrice(selectedProduct.price)}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm font-medium text-gray-700">Quantidade:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Observações:</label>
                      <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Ex: Sem açúcar, mais granola..."
                        rows={2}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={addProduct}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Adicionar ao Pedido
                    </button>
                  </div>
                )}
                
                {items.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                    <p>Nenhum item adicionado</p>
                    <p className="text-sm">Busque e adicione produtos ao pedido</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <img 
                              src={item.product_image} 
                              alt={item.product_name} 
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-sm text-gray-500">
                                {item.quantity}x {formatPrice(item.unit_price)}
                              </div>
                              {item.observations && (
                                <div className="text-xs text-gray-500 italic mt-1">
                                  Obs: {item.observations}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-green-600">
                              {formatPrice(item.total_price)}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Resumo do Pedido</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  {customerNeighborhood && (
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span>{formatPrice(getDeliveryFee())}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(getTotalPrice() + getDeliveryFee())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0 || !isCashRegisterOpen}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Criar Pedido
                </>
              )}
            </button>
            {!isCashRegisterOpen && (
              <div className="absolute bottom-20 right-6 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>Não é possível criar pedidos sem um caixa aberto</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualOrderForm;