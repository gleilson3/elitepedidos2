import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order } from '../../types/order';
import OrderStatusBadge from '../Orders/OrderStatusBadge';
import OrderChat from '../Orders/OrderChat';
import { supabase } from '../../lib/supabase';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MessageCircle,
  MapPin,
  Phone,
  CreditCard,
  ArrowLeft,
  Share2,
  Copy,
  Check
} from 'lucide-react';

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('🔍 Buscando pedido:', orderId);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
        console.log('✅ Pedido carregado:', data?.id);
        setCustomerName(data.customer_name);
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Função para recarregar dados do pedido
    const refreshOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        // Só atualizar se houver mudanças
        if (data && (!order || data.updated_at !== order.updated_at)) {
          setOrder(data);
          setCustomerName(data.customer_name);
        }
      } catch (error) {
        console.error('Erro ao recarregar pedido:', error);
      }
    };

    // Polling para garantir sincronização
    const pollingInterval = setInterval(refreshOrder, 5000); // A cada 5 segundos

    // Configurar realtime para atualizações do pedido
    const orderChannel = supabase
      .channel(`order:${orderId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('🔔 Atualização do pedido via realtime:', payload);
          console.log('📦 Pedido atualizado via realtime:', payload.new);
          setOrder(payload.new as Order);
        }
      )
      .subscribe((status) => console.log('🔌 Status da inscrição do pedido:', status));

    // Recarregar quando a página ganha foco
    const handleFocus = () => {
      console.log('🔄 Página ganhou foco, recarregando pedido...');
      refreshOrder();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Página ficou visível, recarregando pedido...');
        refreshOrder();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollingInterval);
      supabase.removeChannel(orderChannel);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [orderId, navigate]);

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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Pedido Recebido!',
          message: 'Seu pedido foi recebido e está sendo processado.',
          color: 'text-yellow-600',
          icon: Clock
        };
      case 'confirmed':
        return {
          title: 'Pedido Confirmado!',
          message: 'Seu pedido foi confirmado e entrará em preparo em breve.',
          color: 'text-blue-600',
          icon: CheckCircle
        };
      case 'preparing':
        return {
          title: 'Preparando seu Açaí!',
          message: 'Nosso time está preparando seu pedido com muito carinho.',
          color: 'text-orange-600',
          icon: Package
        };
      case 'out_for_delivery':
        return {
          title: 'Saiu para Entrega!',
          message: 'Seu pedido está a caminho! Em breve estará aí.',
          color: 'text-purple-600',
          icon: Truck
        };
      case 'ready_for_pickup':
        return {
          title: 'Pronto para Retirada!',
          message: 'Seu pedido está pronto! Pode vir buscar.',
          color: 'text-indigo-600',
          icon: Package
        };
      case 'delivered':
        return {
          title: 'Pedido Entregue!',
          message: 'Seu pedido foi entregue com sucesso. Obrigado pela preferência!',
          color: 'text-green-600',
          icon: CheckCircle
        };
      case 'cancelled':
        return {
          title: 'Pedido Cancelado',
          message: 'Seu pedido foi cancelado. Entre em contato conosco para mais informações.',
          color: 'text-red-600',
          icon: Package
        };
      default:
        return {
          title: 'Status Desconhecido',
          message: 'Entre em contato conosco para mais informações.',
          color: 'text-gray-600',
          icon: Package
        };
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'confirmed': return 40;
      case 'preparing': return 60;
      case 'out_for_delivery': return 80;
      case 'ready_for_pickup': return 80;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const copyOrderLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const shareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${order?.id.slice(-8)} - Elite Açaí`,
          text: `Acompanhe meu pedido na Elite Açaí`,
          url: window.location.href,
        });
        
        if (messagesCount === 0) {
          console.log('⚠️ Nenhuma mensagem encontrada para este pedido');
        }
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
        copyOrderLink();
      }
    } else {
      copyOrderLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pedido não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Verifique o link do pedido e tente novamente.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(order.status);
  const progress = getProgressPercentage(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-green-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <button
              onClick={shareOrder}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
            >
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              {copied ? 'Copiado!' : 'Compartilhar'}
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Acompanhe seu Pedido
            </h1>
            <p className="text-white/90">
              Pedido #{order.id.slice(-8)} • {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="mb-4">
              <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <StatusIcon size={32} className={statusInfo.color} />
              </div>
              <OrderStatusBadge status={order.status} className="text-lg px-4 py-2" />
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${statusInfo.color}`}>
              {statusInfo.title}
            </h2>
            <p className="text-gray-600">{statusInfo.message}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Recebido</span>
              <span>Preparando</span>
              <span>Entregando</span>
              <span>Finalizado</span>
            </div>
          </div>

          {/* Estimated Delivery */}
          {order.estimated_delivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Previsão de Entrega</p>
                  <p className="text-blue-700">{formatDate(order.estimated_delivery)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/5585989041010?text=Olá! Gostaria de falar sobre o pedido ${order.id.slice(-8)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Package size={24} className="text-purple-600" />
            Detalhes do Pedido
          </h3>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Endereço de Entrega</p>
                  <p className="text-gray-600">
                    {order.customer_address}
                  </p>
                  <p className="text-gray-600">
                    {order.customer_neighborhood}
                    {order.customer_complement && `, ${order.customer_complement}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">Telefone</p>
                  <p className="text-gray-600">{order.customer_phone}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-800">Forma de Pagamento</p>
                  <p className="text-gray-600">
                    {getPaymentMethodLabel(order.payment_method)}
                    {order.change_for && (
                      <span className="text-gray-500 block">
                        Troco para {formatPrice(order.change_for)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">Data do Pedido</p>
                  <p className="text-gray-600">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-medium text-gray-800 mb-4">Itens do Pedido:</h4>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800 mb-1">{item.product_name}</h5>
                      {item.selected_size && (
                        <p className="text-sm text-gray-600 mb-2">Tamanho: {item.selected_size}</p>
                      )}
                      
                      {/* Complementos */}
                      {item.complements.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Complementos:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.complements.map((comp, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                              >
                                {comp.name}
                                {comp.price > 0 && ` (+${formatPrice(comp.price)})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.observations && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                          <p className="text-sm text-yellow-800">
                            <strong>Observações:</strong> {item.observations}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Qtd: {item.quantity}</p>
                      <p className="font-semibold text-purple-600">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-800">Total do Pedido:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(order.total_price)}
              </span>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Precisa de Ajuda?
            </h3>
            <p className="text-gray-600 mb-4">
              Nossa equipe está pronta para te atender!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+5585989041010"
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Phone size={18} />
                Ligar: (85) 98904-1010
              </a>
              <a
                href="https://wa.me/5585989041010"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;