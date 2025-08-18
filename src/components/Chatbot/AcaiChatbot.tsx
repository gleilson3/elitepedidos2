import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minus, Send, Bot, User } from 'lucide-react';
import { findIntent, getInitialGreeting } from './intents';
import { saveUnknownQuery, shouldSaveAsUnknown, addTagToQuery } from './unknowns';
import { useOrders } from '../../hooks/useOrders';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { products } from '../../data/products';
import PromotionsAIResponse from './PromotionsAIResponse';

// Define message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Define order state interface
interface OrderState {
  stage: 'initial' | 'delivery_info' | 'product_selection' | 'add_more' | 'complements' | 'payment' | 'confirmation' | 'complete';
  deliveryType?: 'delivery' | 'pickup';
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  selectedProducts: Array<{
    name: string;
    price: number;
    size?: string;
    quantity: number;
    complements?: string[];
  }>;
  paymentMethod?: 'money' | 'pix' | 'card';
  total: number;
  selectedComplements?: string[];
}

const AcaiChatbot: React.FC = () => {
  const { createOrder } = useOrders();
  const { isOpen: isCashRegisterOpen } = usePDVCashRegister();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [orderState, setOrderState] = useState<OrderState>({
    stage: 'initial',
    selectedProducts: [],
    total: 0,
    selectedComplements: []
  });
  const [currentProduct, setCurrentProduct] = useState<{
    name: string;
    price: number;
    size?: string;
  } | null>(null);
  const [showPromotions, setShowPromotions] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Function to create an actual order in the system
  const createRealOrder = async () => {
    if (!isCashRegisterOpen) {
      return "Desculpe, não foi possível criar seu pedido porque o caixa está fechado. Por favor, tente novamente mais tarde ou entre em contato pelo WhatsApp.";
    }
    
    try {
      // Get the size from the product name
      const size = orderState.selectedProducts.find(p => p.name.includes('Açaí'))?.size || '';
      
      // Get selected complements from the order state
      const selectedComplements = orderState.selectedComplements || [];
      
      // Determine the number of cremes and mix based on size from delivery system
      let numCremes = 2;
      // Adjust max mix based on size from delivery system
      let numMix = 3;
      
      if (size.includes('700g') || size.includes('800g') || size.includes('900g') || size.includes('1kg') || size.includes('1 kg')) {
        numMix = 5;
      }
      // Add this information to the product name
      const enhancedProducts = orderState.selectedProducts.map(product => {
        if (product.name.includes('Açaí')) {
          return {
            ...product,
            name: `${product.name} (${numCremes} Cremes + ${numMix} Mix)`
          };
        }
        return product;
      });
      
      // Map selected products to order items format
      const items = enhancedProducts.map(product => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        product_name: product.name,
        product_image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400",
        quantity: product.quantity,
        unit_price: product.price,
        total_price: product.price * product.quantity,
        observations: "Pedido feito pelo chatbot",
        complements: product.complements?.map(comp => ({
          name: comp,
          price: 0
        })) || []
      }));
      
      // Create order data
      const orderData = {
        customer_name: orderState.customerName || "Cliente do Chat",
        customer_phone: orderState.customerPhone || customerPhone || "00000000000",
        customer_address: orderState.customerAddress || "Endereço não informado",
        customer_neighborhood: "Centro", // Default neighborhood
        payment_method: orderState.paymentMethod || "money",
        items,
        total_price: orderState.total,
        status: 'pending' as const,
        channel: 'chatbot' as const
      };
      
      // Create the order
      const newOrder = await createOrder(orderData);
      
      return `🎉 Pedido criado com sucesso! Seu número de pedido é #${newOrder.id.slice(-8)}.\n\nEm breve você receberá uma confirmação pelo WhatsApp. Qualquer dúvida estou à disposição! 💜`;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return "Desculpe, ocorreu um erro ao criar seu pedido. Por favor, tente novamente ou entre em contato pelo WhatsApp (85) 98904-1010.";
    }
  };
  // Load customer phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) {
      setCustomerPhone(savedPhone);
    }
  }, []);

  // Update messages count when messages change
  useEffect(() => {
    setMessagesCount(messages.length);
  }, [messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to get welcome quick replies
  const getWelcomeQuickReplies = () => {
    return [
      { text: '🛒 Fazer um pedido', value: 'quero fazer um pedido' },
      { text: '📋 Ver cardápio', value: 'cardápio' },
      { text: '🔥 Ver promoções', value: 'promoções' },
      { text: '📍 Horários e localização', value: 'horários' },
      { text: '💰 Cashback', value: 'cashback' }
    ];
  };

  // Improved response generation function
  const generateResponse = (userMessage: string): string => {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Check for product categories
    if (orderState.stage === 'product_selection') {
      if (normalizedMessage.includes('açaí') || normalizedMessage.includes('acai')) {
        return "Você escolheu Açaí! Temos vários tamanhos:\n\n• 300g - R$ 13,99\n• 350g - R$ 15,99\n• 400g - R$ 18,99\n• 500g - R$ 22,99\n• 600g - R$ 26,99\n• 700g - R$ 31,99 (2 Cremes + 5 Mix)\n• 800g - R$ 34,99 (2 Cremes + 5 Mix)\n• 900g - R$ 38,99 (2 Cremes + 5 Mix)\n• 1kg - R$ 44,99 (2 Cremes + 5 Mix)\n\nQual tamanho você prefere?";
      } else if (normalizedMessage.includes('combo')) {
        return "Você escolheu Combos! Nossas opções:\n\n• Combo Casal (1kg + Milkshake) - R$ 49,99\n• Combo 1 (400g) - R$ 23,99\n• Combo 2 (500g) - R$ 26,99\n• Combo 3 (600g) - R$ 31,99\n• Combo 4 (900g) - R$ 42,99\n\nQual combo você prefere?";
      } else if (normalizedMessage.includes('milk') || normalizedMessage.includes('shake')) {
        return "Você escolheu Milkshake! Temos:\n\n• 400ml - R$ 11,99\n• 500ml - R$ 12,99\n\nSabores disponíveis: Morango, Chocolate, Baunilha, Ovomaltine\n\nQual tamanho e sabor você prefere?";
      } else if (normalizedMessage.includes('vitamina')) {
        return "Você escolheu Vitamina! Temos:\n\n• Vitamina de Açaí 400ml - R$ 12,00\n• Vitamina de Açaí 500ml - R$ 15,00\n\nOpções de complementos: Amendoim, Castanha, Cereja, Farinha Láctea, Granola, Leite Condensado, Mel\n\nQual tamanho você prefere?";
      }
      
      // Check for size selection
      if (normalizedMessage.includes('300') || normalizedMessage.includes('400') || 
          normalizedMessage.includes('500') || normalizedMessage.includes('700')) {
        // User selected a size
        let size = '';
        let price = 0;
        
        if (normalizedMessage.includes('300')) { size = '300g'; price = 13.99; }
        else if (normalizedMessage.includes('350')) { size = '350g'; price = 15.99; }
        else if (normalizedMessage.includes('400')) { size = '400g'; price = 18.99; }
        else if (normalizedMessage.includes('500')) { size = '500g'; price = 22.99; }
        else if (normalizedMessage.includes('600')) { size = '600g'; price = 26.99; }
        else if (normalizedMessage.includes('700')) { size = '700g'; price = 31.99; }
        else if (normalizedMessage.includes('800')) { size = '800g'; price = 34.99; }
        else if (normalizedMessage.includes('900')) { size = '900g'; price = 38.99; }
        else if (normalizedMessage.includes('1kg') || normalizedMessage.includes('1 kg')) { size = '1kg'; price = 44.99; }
        
        // Store the current product
        setCurrentProduct({
          name: `Açaí ${size}`,
          price: price,
          size: size
        });
        
        // Move to add more stage
        setOrderState({
          ...orderState,
          stage: 'add_more'
        });
        
        return `Você escolheu Açaí ${size}. Deseja adicionar mais algum produto ao seu pedido?\n\n• Digite "sim" para adicionar mais produtos\n• Digite "continuar" para prosseguir com os complementos`;
      }
    }
    
    // Check for direct commands first
    if (normalizedMessage.includes("fazer um pedido") || normalizedMessage.includes("quero pedir")) {
      setOrderState({
        ...orderState,
        stage: 'delivery_info'
      });
      return "Vamos começar seu pedido! Você deseja delivery ou retirada na loja?";
    }
    
    if (normalizedMessage.includes("acompanhar") && (normalizedMessage.includes("pedido") || normalizedMessage.includes("entrega"))) {
      return "Para acompanhar seu pedido, envie seu número de telefone ou código de pedido. 😊";
    }
    
    if (normalizedMessage.includes("cardápio") || normalizedMessage.includes("cardapio") || normalizedMessage.includes("menu")) {
      return "Nosso cardápio está disponível aqui no site! 🍧\n\nVocê pode navegar pelas categorias como Açaí, Combos, Milkshakes, Vitaminas...\n\nQuer que eu te ajude a escolher algo específico?";
    }
    
    if (normalizedMessage.includes("promoção") || normalizedMessage.includes("promocao") || normalizedMessage.includes("desconto") || normalizedMessage.includes("oferta")) {
      window.setTimeout(() => setShowPromotions(true), 300);
      return "Aqui estão nossas promoções do dia! 🔥";
    }
    
    if (normalizedMessage.includes("horário") || normalizedMessage.includes("horario") || normalizedMessage.includes("localização") || normalizedMessage.includes("localizacao") || normalizedMessage.includes("endereço") || normalizedMessage.includes("endereco")) {
      return "Estamos abertos todos os dias das 14h às 22h! ⏰\n\n📍 Loja 1: Rua Dois, 2130-A – Residencial 1 – Cágado\n📍 Loja 2: Rua Um, 1614-C – Residencial 1 – Cágado";
    }

    const matchedIntent = findIntent(normalizedMessage);

    // Se estiver em um processo de pedido, usar fluxo de pedido
    if (orderState.stage !== 'initial' && orderState.stage !== 'complete') {
      return processOrderStage(userMessage);
    }

    // Se a intent for fallback (não reconhecida)
    if (matchedIntent.id === 'fallback') {
      const context = messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');
      saveUnknownQuery(userMessage, context);

      return "Essa informação ainda não está disponível, mas vou anotar para melhorar meu atendimento! 📝\n\nPosso te ajudar com informações sobre nosso cardápio, promoções, horários ou formas de pagamento. O que você gostaria de saber?";
    }

    // Caso a intenção seja válida, mas queira salvar para análise futura (score baixo, opcional)
    const matchScore = matchedIntent.keywords?.reduce((acc, kw) => {
      return normalizedMessage.includes(kw) ? acc + kw.length : acc;
    }, 0) || 0;

    if (shouldSaveAsUnknown(userMessage, matchedIntent.id, matchScore, 0.15)) {
      const context = messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');
      saveUnknownQuery(userMessage, context);
    }

    // Ações especiais por ID de intent
    switch (matchedIntent.id) {
      case 'promotions':
        window.setTimeout(() => setShowPromotions(true), 300);
        break;
      case 'new_order':
        setOrderState({
          ...orderState,
          stage: 'delivery_info'
        });
        return "Vamos iniciar seu pedido! 😊\n\nVocê quer receber em casa (delivery) ou retirar em uma de nossas lojas?";
      default:
        break;
    }

    // Retorna a resposta da intent (texto ou função)
    return typeof matchedIntent.response === 'function'
      ? matchedIntent.response()
      : matchedIntent.response;
  };
  
  // Process order based on current stage
  const processOrderStage = (userInput: string): string => {
    const input = userInput.toLowerCase().trim();
    
    // Helper function to check complement limits
    const checkComplementLimits = (type: string, items: string[], size?: string): string | null => {
      // Determine limits based on size
      let maxCremes = 2;
      let maxMix = 3;
      
      if (size && (size.includes('700g') || size.includes('800g') || size.includes('900g') || size.includes('1kg') || size.includes('1 kg'))) {
        maxMix = 5;
      }
      
      // Check if exceeding limits
      if (type === 'creme' && items.length > maxCremes) {
        return `⚠️ Você selecionou ${items.length} cremes, mas o limite para este tamanho é ${maxCremes}. Por favor, selecione no máximo ${maxCremes} cremes.`;
      }
      
      return null;
    };
    
    switch (orderState.stage) {
      case 'delivery_info':
        // Determine delivery type
        if (input.includes('casa') || input.includes('delivery') || input.includes('entreg')) {
          setOrderState({
            ...orderState,
            deliveryType: 'delivery',
            stage: 'delivery_info'
          });
          
          return "Beleza! Me informe:\n\n📍 Endereço de entrega:\n👤 Nome:\n📞 Telefone:";
        } else if (input.includes('retir') || input.includes('loja') || input.includes('buscar')) {
          setOrderState({
            ...orderState,
            deliveryType: 'pickup',
            stage: 'delivery_info'
          });
          
          return "Ótimo! Em qual loja você deseja retirar?\n\n🏡 Loja 1: Rua Dois, 2130‑A – Residencial 1 – Cágado\n🏡 Loja 2: Rua Um, 1614‑C – Residencial 1 – Cágado";
        } else if (input.includes('rua') || input.includes('avenida') || input.includes('av.')) {
          // User is providing address directly
          setOrderState({
            ...orderState,
            deliveryType: 'delivery',
            customerAddress: userInput,
            stage: 'product_selection'
          });
          
          return "Endereço anotado! O que você gostaria de pedir?";
        } else {
          // Ask again for delivery type
          return "Por favor, me informe se você quer receber em casa (delivery) ou retirar em uma de nossas lojas.";
        }
        
      case 'product_selection':
        // Handle product selection
        if (input.includes('açaí') || input.includes('acai')) {
          return "Você escolheu Açaí! Temos vários tamanhos:\n\n• 300g - R$ 13,99\n• 350g - R$ 15,99\n• 400g - R$ 18,99\n• 500g - R$ 22,99\n• 600g - R$ 26,99\n• 700g - R$ 31,99 (2 Cremes + 5 Mix)\n• 800g - R$ 34,99 (2 Cremes + 5 Mix)\n• 900g - R$ 38,99 (2 Cremes + 5 Mix)\n• 1kg - R$ 44,99 (2 Cremes + 5 Mix)\n\nQual tamanho você prefere?";
        } else if (input.includes('combo')) {
          return "Você escolheu Combos! Nossas opções:\n\n• Combo Casal (1kg + Milkshake) - R$ 49,99\n• Combo 1 (400g) - R$ 23,99\n• Combo 2 (500g) - R$ 26,99\n• Combo 3 (600g) - R$ 31,99\n• Combo 4 (900g) - R$ 42,99\n\nQual combo você prefere?";
        } else if (input.includes('milk') || input.includes('shake')) {
          return "Você escolheu Milkshake! Temos:\n\n• 400ml - R$ 11,99\n• 500ml - R$ 12,99\n\nSabores disponíveis: Morango, Chocolate, Baunilha, Ovomaltine\n\nQual tamanho e sabor você prefere?";
        } else if (input.includes('vitamina')) {
          return "Você escolheu Vitamina! Temos:\n\n• Vitamina de Açaí 400ml - R$ 12,00\n• Vitamina de Açaí 500ml - R$ 15,00\n\nOpções de complementos: Amendoim, Castanha, Cereja, Farinha Láctea, Granola, Leite Condensado, Mel\n\nQual tamanho você prefere?";
        } else if (input.includes('300') || input.includes('400') || input.includes('500') || input.includes('700')) {
          return generateResponse(input); // Use the new size handler
        } else {
          // Check if this is the first time asking
          return "O que você gostaria de pedir hoje? Temos Açaí, Combos, Milkshakes e Vitaminas.";
        }
        
      case 'add_more':
        // Check if user wants to add more products or continue
        if (input.includes('sim') || input.includes('mais') || input.includes('outro')) {
          // Add current product to order and go back to product selection
          if (currentProduct) {
            setOrderState(prev => ({
              ...prev,
              selectedProducts: [...prev.selectedProducts, {
                ...currentProduct,
                quantity: 1
              }],
              total: prev.total + currentProduct.price,
              stage: 'product_selection'
            }));
          }
          
          return "O que mais você gostaria de adicionar?";
        } else if (input.includes('continuar') || input.includes('prosseguir') || input.includes('avançar')) {
          // Add current product to order and move to complements
          if (currentProduct) {
            setOrderState(prev => ({
              ...prev,
              selectedProducts: [...prev.selectedProducts, {
                ...currentProduct,
                quantity: 1
              }],
              total: prev.total + currentProduct.price,
              stage: 'complements'
            }));
          }
          
          // Show summary of selected products
          const productSummary = orderState.selectedProducts.map((p, i) => 
            `${i+1}. ${p.name} - ${formatPrice(p.price)}`
          ).join('\n');
          
          return `Ótimo! Você selecionou:\n\n${productSummary}\n\nAgora vamos aos complementos. Deseja adicionar complementos grátis?\n\n• 2 cremes (nutella, ninho, morango, etc)\n• 3 mix (granola, leite em pó, paçoca, etc)`;
        } else if (input.includes('açaí') || input.includes('acai') || 
                  input.includes('combo') || input.includes('milk') || 
                  input.includes('shake') || input.includes('vitamina')) {
          // User wants to select a different product category
          // Add current product to order first
          if (currentProduct) {
            setOrderState(prev => ({
              ...prev,
              selectedProducts: [...prev.selectedProducts, {
                ...currentProduct,
                quantity: 1
              }],
              total: prev.total + currentProduct.price,
              stage: 'product_selection'
            }));
            setCurrentProduct(null);
          }
          
          // Process the new category selection
          if (input.includes('açaí') || input.includes('acai')) {
            return "Você escolheu Açaí! Temos vários tamanhos:\n\n• 300g - R$ 13,99\n• 350g - R$ 15,99\n• 400g - R$ 18,99\n• 500g - R$ 22,99\n• 600g - R$ 26,99\n• 700g - R$ 31,99 (2 Cremes + 5 Mix)\n• 800g - R$ 34,99 (2 Cremes + 5 Mix)\n• 900g - R$ 38,99 (2 Cremes + 5 Mix)\n• 1kg - R$ 44,99 (2 Cremes + 5 Mix)\n\nQual tamanho você prefere?";
          } else if (input.includes('combo')) {
            return "Você escolheu Combos! Nossas opções:\n\n• Combo Casal (1kg + Milkshake) - R$ 49,99\n• Combo 1 (400g) - R$ 23,99\n• Combo 2 (500g) - R$ 26,99\n• Combo 3 (600g) - R$ 31,99\n• Combo 4 (900g) - R$ 42,99\n\nQual combo você prefere?";
          } else if (input.includes('milk') || input.includes('shake')) {
            return "Você escolheu Milkshake! Temos:\n\n• 400ml - R$ 11,99\n• 500ml - R$ 12,99\n\nSabores disponíveis: Morango, Chocolate, Baunilha, Ovomaltine\n\nQual tamanho e sabor você prefere?";
          } else if (input.includes('vitamina')) {
            return "Você escolheu Vitamina! Temos:\n\n• Vitamina de Açaí 400ml - R$ 12,00\n• Vitamina de Açaí 500ml - R$ 15,00\n\nOpções de complementos: Amendoim, Castanha, Cereja, Farinha Láctea, Granola, Leite Condensado, Mel\n\nQual tamanho você prefere?";
          } else {
            return "O que mais você gostaria de adicionar?";
          }
        } else {
          return "Por favor, digite 'sim' para adicionar mais produtos ou 'continuar' para prosseguir com os complementos.";
        }
        
      case 'complements':
        // Process complements selection
        if (input.includes('creme')) {
          // Get the selected açaí size
          const selectedSize = orderState.selectedProducts.find(p => p.name.includes('Açaí'))?.size || '';
          
          return "Você escolheu adicionar cremes! Quais cremes você gostaria? (Máximo de 2)\n\n• Creme de Cupuaçu\n• Creme de Morango\n• Creme de Ninho\n• Creme de Nutela\n• Creme de Maracujá\n• Creme de Paçoca\n• Creme de Ovomaltine\n• Creme de Coco\n• Creme Morangotela\n• Creme de Pistache\n\nDigite os nomes dos cremes que deseja ou 'continuar' para prosseguir.";
        } else if (input.includes('mix')) {
          const size = orderState.selectedProducts.find(p => p.name.includes('Açaí'))?.size || '';
          let maxMix = 3; // Default for most sizes
          
          // Adjust max mix based on size
          if (size.includes('700g') || size.includes('800g') || size.includes('900g') || size.includes('1kg') || size.includes('1 kg')) {
            maxMix = 5;
          } else if (size.includes('300g') && size.includes('1 Creme')) {
            maxMix = 2;
          }
          
          return `Você escolheu adicionar mix! Quais mix você gostaria? (Máximo de ${maxMix})\n\n• Castanha em Banda\n• Cereja\n• Chocoball\n• Granola\n• Granulado de Chocolate\n• Leite Condensado\n• Morango\n• Paçoca\n• Leite em Pó\n• Uva\n• Kiwi\n• Jujuba\n• Marshmallows\n• M&Ms\n• Sucrilhos\n• Flocos de Tapioca\n• Canudos\n• Ovomaltine\n\nDigite os nomes dos mix que deseja ou 'continuar' para prosseguir.`;
        } else if (input.includes('sem') || input.includes('continuar') || input.includes('prosseguir')) {
          setOrderState({
            ...orderState,
            stage: 'payment'
          });
          
          return `Pedido anotado! O total é ${formatPrice(orderState.total)}.\n\nQual a forma de pagamento?\n• Dinheiro\n• PIX\n• Cartão`;
        } else if (input.includes('nutela') || input.includes('ninho') || input.includes('morango') || 
                  input.includes('cupuaçu') || input.includes('maracujá') || input.includes('paçoca') || 
                  input.includes('ovomaltine') || input.includes('coco') || input.includes('morangotela') || 
                  input.includes('pistache')) {
          // User is selecting cremes
          const selectedSize = orderState.selectedProducts.find(p => p.name.includes('Açaí'))?.size || '';
          const maxCremes = 2;
          
          // Extract cremes from input
          const cremeKeywords = ['nutela', 'ninho', 'morango', 'cupuaçu', 'maracujá', 'paçoca', 'ovomaltine', 'coco', 'morangotela', 'pistache'];
          const selectedCremes = cremeKeywords.filter(creme => input.includes(creme));
          
          // Check if exceeding limit
          if (selectedCremes.length > maxCremes) {
            return `⚠️ Você selecionou ${selectedCremes.length} cremes, mas o limite para este tamanho é ${maxCremes}. Por favor, selecione no máximo ${maxCremes} cremes.`;
          }
          
          return `Você selecionou ${selectedCremes.length} cremes: ${selectedCremes.join(', ')}. Deseja adicionar mix também? Digite 'mix' para adicionar ou 'continuar' para prosseguir.`;
        } else if (input.includes('castanha') || input.includes('cereja') || input.includes('chocoball') || 
                  input.includes('granola') || input.includes('granulado') || input.includes('leite condensado') || 
                  input.includes('morango') || input.includes('paçoca') || input.includes('leite em pó') || 
                  input.includes('uva') || input.includes('kiwi') || input.includes('jujuba') || 
                  input.includes('marshmallow') || input.includes('m&m') || input.includes('sucrilho') || 
                  input.includes('tapioca') || input.includes('canudo') || input.includes('ovomaltine')) {
          // User is selecting mix
          const selectedSize = orderState.selectedProducts.find(p => p.name.includes('Açaí'))?.size || '';
          let maxMix = 3;
          
          if (selectedSize.includes('700g') || selectedSize.includes('800g') || selectedSize.includes('900g') || 
              selectedSize.includes('1kg') || selectedSize.includes('1 kg')) {
            maxMix = 5;
          }
          
          // Extract mix from input
          const mixKeywords = ['castanha', 'cereja', 'chocoball', 'granola', 'granulado', 'leite condensado', 
                              'morango', 'paçoca', 'leite em pó', 'uva', 'kiwi', 'jujuba', 'marshmallow', 
                              'm&m', 'sucrilho', 'tapioca', 'canudo', 'ovomaltine'];
          const selectedMix = mixKeywords.filter(mix => input.includes(mix));
          
          // Check if exceeding limit
          if (selectedMix.length > maxMix) {
            return `⚠️ Você selecionou ${selectedMix.length} mix, mas o limite para este tamanho é ${maxMix}. Por favor, selecione no máximo ${maxMix} mix.`;
          }
          
          return `Você selecionou ${selectedMix.length} mix: ${selectedMix.join(', ')}. Digite 'continuar' para prosseguir.`;
        } else {
          const size = orderState.selectedProducts.find(p => p.name.includes('Açaí'))?.size || '';
          let maxCremes = 2;
          let maxMix = 3;
          
          // Adjust max complements based on size from delivery system
          if (size.includes('700g') || size.includes('800g') || size.includes('900g') || size.includes('1kg') || size.includes('1 kg')) {
            maxMix = 5;
          }
          
          return `Deseja adicionar complementos grátis?\n\n• Cremes (Máximo de ${maxCremes}): Nutella, Ninho, Morango, etc\n• Mix (Máximo de ${maxMix}): Granola, Leite em pó, Paçoca, etc\n\nOu digite 'continuar' para prosseguir sem complementos.`;
        }
        
      case 'payment':
        // Process payment method
        let paymentMethod: 'money' | 'pix' | 'card' = 'money';
        
        if (input.includes('pix')) {
          paymentMethod = 'pix';
        } else if (input.includes('cartão') || input.includes('cartao') || input.includes('card')) {
          paymentMethod = 'card';
        }
        
        setOrderState({
          ...orderState,
          paymentMethod,
          stage: 'confirmation'
        });
        
        let paymentDetails = '';
        if (paymentMethod === 'pix') {
          paymentDetails = "\n\n📱 **DADOS PIX:**\nChave: 85989041010\nNome: Grupo Elite";
        } else if (paymentMethod === 'money') {
          paymentDetails = "\n\nPrecisa de troco? Me informe para quanto.";
        }
        
        return `Você escolheu pagar com ${paymentMethod === 'money' ? 'dinheiro' : paymentMethod === 'pix' ? 'PIX' : 'cartão'}.${paymentDetails}\n\nConfirma o pedido?`;
        
      case 'confirmation':
        // Confirm order
        if (input.includes('sim') || input.includes('confirmo') || input.includes('ok')) {
          // Store the selected complements in the order
          const selectedCremes = [];
          const selectedMix = [];
          
          // Extract complements from the conversation
          for (let i = 0; i < messages.length; i++) {
            const message = messages[i].text.toLowerCase();
            
            if (message.includes('você selecionou') && message.includes('cremes:')) {
              const match = message.match(/você selecionou \d+ cremes: (.*?)\./i);
              if (match && match[1]) {
                selectedCremes.push(...match[1].split(', '));
              }
            }
            
            if (message.includes('você selecionou') && message.includes('mix:')) {
              const match = message.match(/você selecionou \d+ mix: (.*?)\./i);
              if (match && match[1]) {
                selectedMix.push(...match[1].split(', '));
              }
            }
          }
          
          setOrderState({
            stage: 'complete',
            ...orderState,
            selectedComplements: [...selectedCremes, ...selectedMix]
          });
          
          // Create the actual order in the system
          return createRealOrder();
        } else if (input.includes('não') || input.includes('nao') || input.includes('cancelar')) {
          setOrderState({
            stage: 'initial',
            selectedProducts: [],
            total: 0
          });
          
          return "Pedido cancelado. Se quiser fazer um novo pedido ou tiver outras dúvidas, estou à disposição! 😊";
        } else {
          return "Por favor, confirme se deseja finalizar o pedido digitando 'sim' ou 'não'.";
        }
        
      default:
        return "Desculpe, não entendi. Vamos recomeçar o pedido? Por favor, me diga se você quer delivery ou retirada na loja.";
    }
  };
  
  // Helper function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
      
      // If the message looks like a phone number, store it for future use
      if (/^\d{10,11}$/.test(input.trim())) {
        setCustomerPhone(input.trim());
        localStorage.setItem('customer_phone', input.trim());
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    
    // Reset order state when opening/closing chat
    setOrderState({
      stage: 'initial',
      selectedProducts: [],
      total: 0,
      selectedComplements: []
    });
    setCurrentProduct(null);
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const currentInput = input; // Store current input before clearing
      
      // If input looks like customer info in delivery_info stage, extract it
      if (orderState.stage === 'delivery_info' && 
          (currentInput.includes('Endereço:') || 
           currentInput.includes('Nome:') || 
           currentInput.includes('Telefone:'))) {
        
        // Extract customer info
        const addressMatch = currentInput.match(/Endereço:?\s*([^\n]+)/i);
        const nameMatch = currentInput.match(/Nome:?\s*([^\n]+)/i);
        const phoneMatch = currentInput.match(/Telefone:?\s*([^\n]+)/i);
        
        if (addressMatch || nameMatch || phoneMatch) {
          setOrderState(prev => ({
            ...prev,
            customerAddress: addressMatch ? addressMatch[1] : prev.customerAddress,
            customerName: nameMatch ? nameMatch[1] : prev.customerName,
            customerPhone: phoneMatch ? phoneMatch[1] : prev.customerPhone,
            stage: 'product_selection'
          }));
        }
      }
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: currentInput,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        let response = generateResponse(currentInput);
        
        // If response is a Promise (from createRealOrder), resolve it
        if (response instanceof Promise) {
          response.then(resolvedResponse => {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: resolvedResponse,
              sender: 'bot',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
          });
          return;
        }
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className={`bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col ${isMinimized ? 'h-12' : ''}`}>
          <div className="bg-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <span className="font-semibold">Açaí Bot</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-purple-700 p-1 rounded"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={toggleChat}
                className="hover:bg-purple-700 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
                {messages.length === 0 && (
                  <div className="flex items-start space-x-2">
                    <Bot size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs whitespace-pre-line">
                      <p className="text-sm whitespace-pre-line">{getInitialGreeting()}</p>
                      
                      <div className="mt-3 space-y-2">
                        <button 
                          onClick={() => {
                            setInput("Fazer um pedido");
                            handleSendMessage();
                          }}
                          className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                        >
                          🛒 Fazer um pedido
                        </button>
                        
                        <button 
                          onClick={() => {
                            setInput("Ver promoções");
                            handleSendMessage();
                          }}
                          className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                        >
                          🔥 Ver promoções
                        </button>
                        
                        <button 
                          onClick={() => {
                            setInput("Horários e localização");
                            handleSendMessage();
                          }}
                          className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                        >
                          📍 Horários e localização
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.sender === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <Bot size={20} className="text-purple-600 mt-1" />
                    )}
                    <div 
                      className={`rounded-lg p-3 max-w-xs whitespace-pre-line ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-line">{message.text}</div>
                      
                      {/* Quick reply buttons for bot messages */}
                      {message.sender === 'bot' && message.text.includes("Você deseja delivery ou retirada") && (
                        <div className="mt-3 space-y-2">
                          <button 
                            onClick={() => {
                              setInput("Delivery");
                              handleSendMessage();
                            }}
                            className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                          >
                            🚚 Delivery
                          </button>
                          
                          <button 
                            onClick={() => {
                              setInput("Retirar na loja");
                              handleSendMessage();
                            }}
                            className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                          >
                            🏪 Retirar na loja
                          </button>
                        </div>
                      )}
                    </div>
                    {message.sender === 'user' && (
                      <User size={20} className="text-gray-600 mt-1" />
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start space-x-2">
                    <Bot size={20} className="text-purple-600 mt-1" />
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {showPromotions && (
                <div className="p-4 border-t">
                  <PromotionsAIResponse onClose={() => setShowPromotions(false)} />
                </div>
              )}

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-2 transition-colors shadow-sm"
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                {/* Product category quick replies - show when in product selection stage */}
                {orderState.stage === 'product_selection' && !isTyping && (
                  <div className="mt-3 space-y-2">
                    <button 
                      onClick={() => {
                        setInput("Açaí");
                        handleSendMessage();
                      }}
                      className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 Açaí
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Combo");
                        handleSendMessage();
                      }}
                      className="w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      🍨 Combos
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Milkshake");
                        handleSendMessage();
                      }}
                      className="w-full text-left px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm transition-colors"
                    >
                      🥤 Milkshakes
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Vitamina");
                        handleSendMessage();
                      }}
                      className="w-full text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-colors"
                    >
                      🍓 Vitaminas
                    </button>
                  </div>
                )}
                
                {/* Size selection quick replies for Açaí - show when last bot message contains size options */}
                {messages.length > 0 && 
                 messages[messages.length - 1]?.sender === 'bot' && 
                 (messages[messages.length - 1]?.text.includes("Qual tamanho você prefere") || 
                  messages[messages.length - 1]?.text.includes("Temos vários tamanhos") || 
                  messages[messages.length - 1]?.text.includes("Qual combo você prefere")) && 
                 messages[messages.length - 1]?.text.includes("Açaí") && 
                 !isTyping && (
                  <div className="mt-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    <button 
                      onClick={() => {
                        setInput("300g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 300g - R$ 13,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("350g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 350g - R$ 15,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("400g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 400g - R$ 18,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("500g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 500g - R$ 22,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("600g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 600g - R$ 26,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("700g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 700g - R$ 31,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("800g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 800g - R$ 34,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("900g");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 900g - R$ 38,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("1kg");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍧 1kg - R$ 44,99
                    </button>
                  </div>
                )}
                
                {/* Combo selection quick replies */}
                {messages.length > 0 && 
                 messages[messages.length - 1]?.sender === 'bot' && 
                 messages[messages.length - 1]?.text.includes("Qual combo você prefere") && 
                 !isTyping && (
                  <div className="mt-3 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    <button 
                      onClick={() => {
                        setInput("Combo Casal");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      🍨 Combo Casal (1kg + Milkshake) - R$ 49,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Combo 1");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      🍨 Combo 1 (400g) - R$ 23,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Combo 2");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      🍨 Combo 2 (500g) - R$ 26,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Combo 3");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      🍨 Combo 3 (600g) - R$ 31,99
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Combo 4");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      🍨 Combo 4 (900g) - R$ 42,99
                    </button>
                  </div>
                )}
                
                {/* Milkshake selection quick replies */}
                {messages.length > 0 && 
                 messages[messages.length - 1]?.sender === 'bot' && 
                 messages[messages.length - 1]?.text.includes("Você escolheu Milkshake") && 
                 !isTyping && (
                  <div className="mt-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    <button 
                      onClick={() => {
                        setInput("Milkshake 400ml Morango");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm transition-colors"
                    >
                      🍓 400ml Morango
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Milkshake 400ml Chocolate");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm transition-colors"
                    >
                      🍫 400ml Chocolate
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Milkshake 500ml Morango");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm transition-colors"
                    >
                      🍓 500ml Morango
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Milkshake 500ml Chocolate");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm transition-colors"
                    >
                      🍫 500ml Chocolate
                    </button>
                  </div>
                )}
                
                {/* Vitamina selection quick replies */}
                {messages.length > 0 && 
                 messages[messages.length - 1]?.sender === 'bot' && 
                 messages[messages.length - 1]?.text.includes("Você escolheu Vitamina") && 
                 !isTyping && (
                  <div className="mt-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    <button 
                      onClick={() => {
                        setInput("Vitamina 400ml");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-colors"
                    >
                      🥤 Vitamina 400ml - R$ 12,00
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Vitamina 500ml");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-colors"
                    >
                      🥤 Vitamina 500ml - R$ 15,00
                    </button>
                  </div>
                )}
                
                {/* Add more or continue buttons - show when in add_more stage */}
                {orderState.stage === 'add_more' && !isTyping && (
                  <div className="mt-3 space-y-2">
                    <button 
                      onClick={() => {
                        setInput("Sim, quero adicionar mais");
                        handleSendMessage();
                      }}
                      className="w-full text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      ➕ Adicionar mais produtos
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Continuar");
                        handleSendMessage();
                      }}
                      className="w-full text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-colors"
                    >
                      ✅ Continuar para complementos
                    </button>
                  </div>
                )}
                
                {/* Complement options - show when in complements stage */}
                {orderState.stage === 'complements' && !isTyping && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => {
                        setInput("Quero adicionar cremes");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🍦 Cremes (Máx. 2)
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Quero adicionar mix");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      🥜 Mix (Máx. 3-5)
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Sem complementos");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      ⏭️ Sem complementos
                    </button>
                  </div>
                )}
                
                {/* Payment method options - show when in payment stage */}
                {orderState.stage === 'payment' && !isTyping && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => {
                        setInput("Dinheiro");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-colors"
                    >
                      💵 Dinheiro
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("PIX");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      📱 PIX
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Cartão");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
                    >
                      💳 Cartão
                    </button>
                  </div>
                )}
                
                {/* Confirmation options - show when in confirmation stage */}
                {orderState.stage === 'confirmation' && !isTyping && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setInput("Sim, confirmo o pedido");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm transition-colors"
                    >
                      ✅ Confirmar pedido
                    </button>
                    
                    <button 
                      onClick={() => {
                        setInput("Não, quero cancelar");
                        handleSendMessage();
                      }}
                      className="text-left px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AcaiChatbot;