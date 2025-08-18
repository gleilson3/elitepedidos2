import React from 'react';
import { useState, useEffect } from 'react';
import { DeliveryOrder } from '../../types/delivery-driver';
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Clock, 
  Package,
  ExternalLink,
  Printer,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  onPrint: (order: DeliveryOrder) => void;
  onWhatsApp: (order: DeliveryOrder) => void;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ 
  order, 
  onPrint, 
  onWhatsApp 
}) => {
  const [timeElapsed, setTimeElapsed] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [minutesElapsed, setMinutesElapsed] = useState(0);

  // Update timer every minute
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const orderTime = new Date(order.created_at);
      const diffMs = now.getTime() - orderTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      
      setMinutesElapsed(diffMinutes);
      
      // Format time elapsed
      if (diffMinutes < 60) {
        setTimeElapsed(`${diffMinutes}min`);
      } else {
        setTimeElapsed(`${diffHours}h ${remainingMinutes}min`);
      }
      
      // Check if overdue (more than 20 minutes)
      setIsOverdue(diffMinutes > 20);
    };

    // Update immediately
    updateTimer();
    
    // Update every minute
    const interval = setInterval(updateTimer, 60000);
    
    return () => clearInterval(interval);
  }, [order.created_at]);

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
      case 'pix': return 'PIX';
      case 'card': return 'Cartão';
      default: return method;
    }
  };

  const generateMapsLink = () => {
    const fullAddress = `${order.customer_address}, ${order.customer_neighborhood}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden mx-2 sm:mx-0 ${
      isOverdue 
        ? 'border-red-300 shadow-red-100 ring-2 ring-red-100' 
        : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-3 sm:p-4 border-b border-gray-100 ${
        isOverdue 
          ? 'bg-gradient-to-r from-red-50 to-orange-50' 
          : 'bg-gradient-to-r from-blue-50 to-green-50'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${
              isOverdue ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Package size={20} className={isOverdue ? 'text-red-600' : 'text-blue-600'} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                Pedido #{order.id.slice(-8)}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Clock size={14} />
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Timer Badge */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOverdue 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : minutesElapsed > 15
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {isOverdue && <AlertTriangle size={12} />}
              <Clock size={12} />
              <span className="font-bold">{timeElapsed}</span>
              {isOverdue && <span className="text-xs">URGENTE</span>}
            </div>
            
            {/* Delivery Fee Badge */}
            {order.delivery_fee && order.delivery_fee > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Taxa: {formatPrice(order.delivery_fee)}</span>
              </div>
            )}
            
            {/* Price */}
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {formatPrice(order.total_price)}
            </p>
          </div>
        </div>
        
        {/* Overdue Warning */}
        {isOverdue && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-2 mt-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              <p className="text-sm font-medium text-red-800">
                ⚠️ Pedido há mais de 20 minutos! Priorizar entrega.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-3 flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          Dados do Cliente
        </h4>
        
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span className="font-medium break-words">{order.customer_name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-400" />
            <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:underline">
              {order.customer_phone}
            </a>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium break-words">{order.customer_address}</p>
              <p className="text-gray-600">{order.customer_neighborhood}</p>
              {order.customer_complement && (
                <p className="text-gray-500 text-xs">Complemento: {order.customer_complement}</p>
              )}
            </div>
          </div>
          
          {/* Customer Observations - Check if any item has observations */}
          {order.items.some(item => item.observations) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    📝 Observações Importantes do Cliente:
                  </p>
                  <div className="space-y-1">
                    {order.items
                      .filter(item => item.observations)
                      .map((item, idx) => (
                        <div key={idx} className="bg-white/70 rounded p-2 border border-yellow-200">
                          <p className="text-sm font-medium text-yellow-900">
                            {item.product_name}:
                          </p>
                          <p className="text-sm text-yellow-800 font-medium break-words">
                            "{item.observations}"
                          </p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" />
            <span className="break-words">
              {getPaymentMethodLabel(order.payment_method)}
              {order.change_for && (
                <span className="text-gray-500 ml-1">
                  (Troco para {formatPrice(order.change_for)})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Package size={18} className="text-green-600" />
          Itens do Pedido ({order.items.length})
        </h4>
        
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="flex items-start gap-3">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h5 className="text-sm sm:text-base font-medium text-gray-800 break-words">{item.product_name}</h5>
                  
                  {item.selected_size && (
                    <p className="text-sm text-gray-600">Tamanho: {item.selected_size}</p>
                  )}
                  
                  {/* Complementos */}
                  {item.complements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-2">Complementos:</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {item.complements.map((comp, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full break-words"
                          >
                            {comp.name}
                            {comp.price > 0 && ` (+${formatPrice(comp.price)})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {item.observations && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-yellow-800 mb-1">
                            📝 Observação Importante:
                          </p>
                          <p className="text-xs sm:text-sm text-yellow-800 font-medium break-words">
                            "{item.observations}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-1 sm:gap-0">
                    <span className="text-sm text-gray-600">
                      Qtd: {item.quantity}x {formatPrice(item.unit_price)}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-green-600">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 sm:p-4 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <a
            href={generateMapsLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Abrir no </span>Maps
          </a>
          
          <button
            onClick={() => onPrint(order)}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            <Printer size={16} />
            Imprimir
          </button>
          
          <button
            onClick={() => onWhatsApp(order)}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderCard;