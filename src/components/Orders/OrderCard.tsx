import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/order';
import OrderStatusBadge from './OrderStatusBadge';
import OrderChat from './OrderChat';
import OrderPrintView from './OrderPrintView';
import { 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Printer
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  storeSettings?: any;
  isAttendant?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  storeSettings,
  onStatusChange, 
  isAttendant = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'money': return 'Dinheiro';
      case 'pix': return 'PIX (85989041010)';
      case 'card': return 'Cartão';
      default: return method;
    }
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'preparing', label: 'Em Preparo' },
    { value: 'out_for_delivery', label: 'Saiu para Entrega' },
    { value: 'ready_for_pickup', label: 'Pronto para Retirada' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const generateWhatsAppLink = () => {
    const customerPhone = order.customer_phone.replace(/\D/g, '');
    const phoneWithCountryCode = customerPhone.startsWith('55') ? customerPhone : `55${customerPhone}`;
    
    const statusMessages = {
      pending: 'Recebemos seu pedido e já estamos processando! ⏰',
      confirmed: 'Seu pedido foi confirmado e entrará em preparo em breve! 👨‍🍳',
      preparing: 'Seu pedido está sendo preparado com muito carinho! ⏰ Tempo estimado: 35 minutos',
      out_for_delivery: 'Seu pedido saiu para entrega! 🚴‍♂️ O entregador está a caminho!',
      ready_for_pickup: 'Seu pedido está pronto para retirada! ✅ Pode vir buscar!',
      delivered: 'Obrigado por escolher a Elite Açaí! 😊 Esperamos que tenha gostado!',
      cancelled: 'Seu pedido foi cancelado. Entre em contato conosco para mais informações.'
    };
    
    let message = `Olá ${order.customer_name}! 👋\n\n`;
    message += `Sobre seu pedido #${order.id.slice(-8)}:\n\n`;
    message += `📋 Status: ${statusMessages[order.status] || 'Atualizando status do seu pedido.'}\n\n`;
    message += `💰 Total: ${formatPrice(order.total_price)}\n`;
    message += `📍 Endereço: ${order.customer_address}, ${order.customer_neighborhood}\n`;
    message += `💳 Pagamento: ${getPaymentMethodLabel(order.payment_method)}\n\n`;
    
    // Adicionar link do Google Maps para localização
    const fullAddress = `${order.customer_address}, ${order.customer_neighborhood}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    message += `📍 *LOCALIZAÇÃO NO MAPA:*\n`;
    message += `https://www.google.com/maps/search/?api=1&query=${encodedAddress}\n\n`;
    
    if (order.status === 'preparing') {
      message += `⏰ Tempo estimado: 35 minutos\n\n`;
    }
    
    message += `Qualquer dúvida, estamos aqui para ajudar! 😊\n\n`;
    message += `Elite Açaí - O melhor açaí da cidade! 🍧`;
    
    return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Package size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Pedido #{order.id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span>{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span>{order.customer_address}, {order.customer_neighborhood}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-gray-400" />
              <span>{getPaymentMethodLabel(order.payment_method)}</span>
              {order.change_for && (
                <span className="text-gray-500">
                  (Troco para {formatPrice(order.change_for)})
                </span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-green-600">
                Total: {formatPrice(order.total_price)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintView(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm print:hidden"
                  title="Imprimir pedido"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
                {isAttendant && (
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm print:hidden"
                    title="Falar com cliente via WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm print:hidden"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {isExpanded ? 'Menos' : 'Detalhes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Change (Attendant Only) */}
        {isAttendant && (
          <div className="p-4 bg-gray-50 border-b border-gray-100 print:hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alterar Status:
            </label>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-medium text-gray-800 mb-3">Itens do Pedido:</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800">{item.product_name}</h5>
                      {item.selected_size && (
                        <p className="text-sm text-gray-600">{item.selected_size}</p>
                      )}
                      
                      {/* Complementos */}
                      {item.complements.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-medium text-gray-700">Complementos:</p>
                          <div className="text-xs text-gray-600">
                            {item.complements.map((comp, idx) => (
                              <span key={idx}>
                                • {comp.name}
                                {comp.price > 0 && ` (+${formatPrice(comp.price)})`}
                                {idx < item.complements.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.observations && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          Obs: {item.observations}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          Qtd: {item.quantity}x
                        </span>
                        <span className="font-medium text-purple-600">
                          {formatPrice(item.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Print View Modal */}
      {showPrintView && (
        <OrderPrintView 
          order={order} 
          storeSettings={storeSettings}
          onClose={() => setShowPrintView(false)} 
        />
      )}
    </>
  );
};

export default OrderCard;