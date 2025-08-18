import { isQuintaElite, getTodaySpecialMessage } from '../../utils/availability';

export interface Intent {
  id: string;
  keywords: string[];
  response: string | (() => string);
  priority?: number; // Higher number = higher priority
}

export interface Intent {
  id: string;
  keywords: string[];
  response: string | (() => string);
  priority?: number; // Higher number = higher priority
}

// Helper function to get day-specific promotion content
const getDaySpecificPromotions = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (isQuintaElite()) {
    return `🔥 **QUINTA ELITE - PROMOÇÕES ESPECIAIS:**\n\n• Açaí 1kg por apenas R$ 37,99 (de R$ 44,99)\n• Açaí 700g por R$ 27,50 (de R$ 31,50)\n• Açaí 600g por R$ 23,99 (de R$ 26,99)\n• Açaí 400g por R$ 16,99 (de R$ 18,99)\n\n⏰ Válido apenas HOJE!\n\nQuer aproveitar? Acesse nosso site ou WhatsApp! 😊`;
  } else if (dayOfWeek === 1) { // Monday
    return `🎉 **PROMOÇÃO DE SEGUNDA-FEIRA:**\n\n• Copo 300ml sem peso por R$ 9,99 (de R$ 13,99)\n\n🍧 **PROMOÇÕES DIÁRIAS:**\n• Combo Casal (1kg + Milkshake) por R$ 49,99\n• 5% de cashback em todos os pedidos\n\n⏰ Promoções válidas apenas hoje!\n\nQuer aproveitar? 😊`;
  } else if (dayOfWeek === 2 || dayOfWeek === 5) { // Tuesday or Friday
    return `🎉 **PROMOÇÃO DE ${dayOfWeek === 2 ? "TERÇA" : "SEXTA"}-FEIRA:**\n\n• Copo 500ml sem peso por R$ 14,99 (de R$ 19,99)\n\n🍧 **PROMOÇÕES DIÁRIAS:**\n• Combo Casal (1kg + Milkshake) por R$ 49,99\n• 5% de cashback em todos os pedidos\n\n⏰ Promoções válidas apenas hoje!\n\nQuer aproveitar? 😊`;
  } else if (dayOfWeek === 3) { // Wednesday
    return `🎉 **PROMOÇÃO DE QUARTA-FEIRA:**\n\n• Copo 400ml sem peso por R$ 12,99 (de R$ 18,99)\n\n🍧 **PROMOÇÕES DIÁRIAS:**\n• Combo Casal (1kg + Milkshake) por R$ 49,99\n• 5% de cashback em todos os pedidos\n\n⏰ Promoções válidas apenas hoje!\n\nQuer aproveitar? 😊`;
  } else {
    return `🎉 **PROMOÇÕES ATIVAS:**\n\n🍧 **Combo Casal:** 1kg de açaí + milkshake 300g = R$ 49,99\n🍧 **Combo 4 (900g):** 600g de açaí + 300g de creme + 5 mix = R$ 42,99\n💰 **Cashback:** 5% em todos os pedidos\n\n⏰ Não perca a Quinta Elite com descontos especiais!\n\nQuer aproveitar alguma promoção? 😊`;
  }
};

// Helper function to get initial greeting based on time of day
export const getInitialGreeting = (): string => {
  const hour = new Date().getHours();
  let greeting = '👋 ';
  
  if (hour < 12) {
    greeting += 'Bom dia! ☀️';
  } else if (hour < 18) {
    greeting += 'Boa tarde! 🌤️';
  } else {
    greeting += 'Boa noite! 🌙';
  }
  
  return `${greeting} Bem-vindo(a) ao Elite Açaí! 🍧\n\nEu sou a assistente virtual e estou aqui para ajudar você! Posso te ajudar com:\n\n🛒 Fazer um pedido\n📦 Acompanhar seu pedido\n📋 Ver nosso cardápio\n💰 Informações sobre promoções\n📍 Horários e localização\n\nO que você gostaria de fazer hoje? Escolha uma opção abaixo ou digite sua pergunta.`;
};

// Define all intents with enhanced keywords and responses
export const intents: Intent[] = [
  // Greeting intents
  {
    id: 'greeting',
    keywords: ['oi', 'olá', 'ola', 'boa tarde', 'bom dia', 'boa noite', 'ei', 'hey', 'oi tudo bem', 'como vai'],
    response: getInitialGreeting,
    priority: 10
  },
  
  // Menu/cardápio intents
  {
    id: 'menu',
    keywords: ['cardápio', 'cardapio', 'menu', 'produtos', 'preços', 'precos', 'valor', 'quanto custa', 'opções', 'opcoes'],
    response: "🍧 **NOSSO CARDÁPIO** 🍧\n\n**AÇAÍ TRADICIONAL:**\n• Pequeno (300g) - R$ 13,99\n• Médio (500g) - R$ 22,99\n• Grande (700g) - R$ 31,99\n\n**ADICIONAIS:**\n• Frutas: morango, banana, kiwi\n• Granola, leite em pó, castanhas\n• Leite condensado, chocolate\n\n**COMBOS:**\n• Combo Casal (1kg + Milkshake) - R$ 49,99\n• Combo 4 (900g) - R$ 42,99\n\n**BEBIDAS:**\n• Milkshake (400ml) - R$ 11,99\n• Vitaminas - R$ 12,00\n\nQuer fazer um pedido? 😊",
    priority: 5
  },
  
  // Promotions intents
  {
    id: 'promotions',
    keywords: ['promoção', 'promocao', 'desconto', 'oferta', 'promoções', 'promocoes', 'quinta elite', 'especial', 'tem promoção', 'tem promocao', 'tem desconto', 'tem oferta'],
    response: getDaySpecificPromotions,
    priority: 8
  },
  
  // Hours/horários intents
  {
    id: 'hours',
    keywords: ['horário', 'horario', 'hora', 'funciona', 'aberto', 'fechado', 'expediente', 'funcionamento'],
    response: "🕐 **NOSSOS HORÁRIOS:**\n\n📅 Segunda a Sexta: 8h às 22h\n📅 Sábado: 8h às 23h\n📅 Domingo: 10h às 20h\n\n📍 **LOCALIZAÇÃO:**\nRua Dois, 2130-A – Residencial 1 – Cágado\nRua Um, 1614-C – Residencial 1 – Cágado\n\n📞 **CONTATO:**\n(85) 98904-1010",
    priority: 5
  },
  
  // Delivery/entrega intents
  {
    id: 'delivery',
    keywords: ['entrega', 'delivery', 'entregar', 'taxa', 'taxas', 'frete', 'tempo', 'demora', 'quanto tempo'],
    response: "🚴 **DELIVERY DISPONÍVEL!**\n\n📦 Taxa de entrega: A partir de R$ 5,00\n⏰ Tempo médio: 35-50 minutos\n💰 Pedido mínimo: R$ 15,00\n\n📍 Atendemos diversos bairros da região!\n\nPara fazer seu pedido:\n📱 WhatsApp: (85) 98904-1010\n🌐 Site: https://celadon-scone-64f36c.netlify.app\n\nQuer fazer um pedido agora? 😊",
    priority: 5
  },
  
  // Payment/pagamento intents
  {
    id: 'payment',
    keywords: ['pagamento', 'pagar', 'cartão', 'cartao', 'pix', 'dinheiro', 'crédito', 'credito', 'débito', 'debito', 'forma de pagamento'],
    response: "💳 **FORMAS DE PAGAMENTO:**\n\n✅ Dinheiro\n✅ PIX (85989041010)\n✅ Cartão de Crédito\n✅ Cartão de Débito\n\n💡 **CASHBACK:**\nGanhe 5% de cashback em todos os pedidos para usar nas próximas compras!\n\nQuer fazer um pedido? 😊",
    priority: 5
  },
  
  // Order tracking intents
  {
    id: 'order_tracking',
    keywords: ['acompanhar pedido', 'onde está meu pedido', 'meu pedido já saiu', 'status do pedido', 'cadê meu pedido', 'rastrear pedido', 'pedido', 'status'],
    response: "Para que eu possa verificar, por favor, me informe o número do seu pedido ou o nome completo utilizado na compra.",
    priority: 7
  },
  
  // New order intents
  {
    id: 'new_order',
    keywords: ['fazer pedido', 'pedir açaí', 'começar pedido', 'quero pedir', 'quero comprar', 'comprar', 'pedir', 'fazer um pedido', 'iniciar pedido'],
    response: "Olá! Que ótimo que você quer fazer um pedido! 😊\n\nPara fazer seu pedido, você pode:\n\n🌐 Acessar nosso site de delivery\n📱 Usar nosso WhatsApp: (85) 98904-1010\n🏪 Vir até nossa loja\n\nNossos principais produtos:\n🍧 Açaí tradicional (P, M, G)\n🍨 Sorvetes artesanais\n🥤 Bebidas geladas\n🍓 Vitaminas naturais\n\nQual opção prefere para fazer seu pedido?",
    priority: 7
  },
  
  // Location intents
  {
    id: 'location',
    keywords: ['localização', 'localizacao', 'endereço', 'endereco', 'onde fica', 'onde vocês ficam', 'onde voces ficam', 'loja', 'lojas'],
    response: "📍 **NOSSAS LOJAS:**\n\n🏡 **Loja 1:**\nRua Dois, 2130‑A – Residencial 1 – Cágado\n🕐 Aberta das 17h às 23h\n\n🏡 **Loja 2:**\nRua Um, 1614‑C – Residencial 1 – Cágado\n🕐 Aberta das 16h às 23h\n\nAmbas as lojas oferecem delivery e atendimento presencial! 😊",
    priority: 5
  },
  
  // Cashback intents
  {
    id: 'cashback',
    keywords: ['cashback', 'dinheiro de volta', 'pontos', 'fidelidade', 'programa', 'recompensa'],
    response: "💰 **PROGRAMA DE CASHBACK:**\n\n• Ganhe 5% de cashback em todos os pedidos\n• Valor disponível para uso até o final do mês\n• Aplicado automaticamente como desconto em compras futuras\n• Consulte seu saldo em nosso site: /meu-cashback\n\nExemplo: Em um pedido de R$ 50,00, você ganha R$ 2,50 de cashback para usar até o final do mês!",
    priority: 5
  },
  
  // Thanks/obrigado intents
  {
    id: 'thanks',
    keywords: ['obrigado', 'obrigada', 'valeu', 'brigado', 'brigada', 'agradecido', 'agradecida', 'grato', 'grata'],
    response: "😊 Por nada! Fico feliz em ajudar!\n\nSe precisar de mais alguma coisa, é só chamar! Estamos sempre aqui para você! 💜\n\n🍧 Elite Açaí - O melhor açaí da cidade! 🍧",
    priority: 3
  },
  
  // Help intents
  {
    id: 'help',
    keywords: ['ajuda', 'help', 'socorro', 'dúvida', 'duvida', 'como funciona', 'o que você faz', 'o que voce faz'],
    response: "Posso ajudar com informações sobre nosso cardápio, promoções, formas de pagamento ou entrega. Se quiser fazer um pedido, é só me dizer! 😊\n\nVocê pode perguntar sobre:\n• Cardápio e preços\n• Promoções do dia\n• Horários de funcionamento\n• Formas de pagamento\n• Delivery e taxas\n\nComo posso te ajudar hoje?",
    priority: 4
  },
  
  // Order process intents
  {
    id: 'order_process',
    keywords: ['como fazer pedido', 'como pedir', 'processo de pedido', 'passo a passo', 'como comprar'],
    response: "Fazer seu pedido é super fácil! 😊\n\n1️⃣ Escolha se quer delivery ou retirada na loja\n2️⃣ Informe seus dados (nome, telefone, endereço)\n3️⃣ Escolha seus produtos do cardápio\n4️⃣ Personalize com complementos\n5️⃣ Escolha a forma de pagamento\n6️⃣ Confirme seu pedido\n\nPosso te ajudar a fazer um pedido agora? Basta dizer 'quero fazer um pedido'!",
    priority: 6
  },
  
  // Specific product intents
  {
    id: 'acai_products',
    keywords: ['açaí', 'acai', 'tamanhos', 'peso', 'gramas', 'kg', 'kilo', 'quilo'],
    response: "🍧 **NOSSO AÇAÍ:**\n\n• 300g - R$ 13,99\n• 350g - R$ 15,99\n• 400g - R$ 18,99\n• 500g - R$ 22,99\n• 600g - R$ 26,99\n• 700g - R$ 31,99\n• 800g - R$ 34,99\n• 900g - R$ 38,99\n• 1kg - R$ 44,99\n\nTodos acompanham complementos grátis! Quer fazer um pedido? 😊",
    priority: 6
  },
  
  // Complements intents
  {
    id: 'complements',
    keywords: ['complementos', 'acompanhamentos', 'adicionais', 'frutas', 'granola', 'leite condensado', 'mix'],
    response: "🍓 **COMPLEMENTOS GRÁTIS:**\n\nNosso açaí vem com complementos grátis que você pode escolher:\n\n• Frutas: morango, banana, kiwi, uva\n• Cereais: granola, sucrilhos, farinha láctea\n• Doces: leite condensado, chocolate, paçoca\n• Cremes: ninho, nutella, cupuaçu, morango\n\nTambém temos complementos extras pagos para você incrementar ainda mais seu açaí! 🤩",
    priority: 6
  },
  
  // Quinta Elite specific intent
  {
    id: 'quinta_elite',
    keywords: ['quinta elite', 'quinta-feira', 'promoção de quinta', 'quinta especial'],
    response: "⚡ **QUINTA ELITE** ⚡\n\nToda quinta-feira temos promoções especiais:\n\n• Açaí 1kg por apenas R$ 37,99 (de R$ 44,99)\n• Açaí 700g por R$ 27,50 (de R$ 31,50)\n• Açaí 600g por R$ 23,99 (de R$ 26,99)\n• Açaí 400g por R$ 16,99 (de R$ 18,99)\n\n⏰ Válido apenas às quintas-feiras!\n\nQuer aproveitar? Acesse nosso site ou WhatsApp! 😊",
    priority: 7
  },
  
  // Contact intent
  {
    id: 'contact',
    keywords: ['contato', 'telefone', 'whatsapp', 'falar com atendente', 'falar com humano', 'numero', 'número'],
    response: "📞 **NOSSOS CONTATOS:**\n\n• WhatsApp: (85) 98904-1010\n• Telefone: (85) 98904-1010\n\nEstamos disponíveis durante todo o horário de funcionamento das lojas para atender você! 😊\n\nDeseja que eu te ajude com mais alguma coisa?",
    priority: 5
  },
  
  // Order size recommendation
  {
    id: 'size_recommendation',
    keywords: ['qual tamanho', 'tamanho ideal', 'quantidade', 'porção', 'porcao', 'serve quantas pessoas'],
    response: "🍧 **GUIA DE TAMANHOS:**\n\n• 300g-400g: Ideal para 1 pessoa com fome moderada\n• 500g-600g: Perfeito para 1 pessoa com bastante fome\n• 700g-800g: Bom para 2 pessoas dividirem\n• 900g-1kg: Ótimo para 2-3 pessoas ou para levar para casa\n\nNossos combos também são excelentes opções para compartilhar! Posso te ajudar a escolher? 😊",
    priority: 6
  },
  // Fallback intent (lowest priority)
  {
    id: 'fallback',
    keywords: [],
    response: "Posso ajudar com informações sobre nosso cardápio, promoções, formas de pagamento ou entrega. Se quiser fazer um pedido, é só me dizer! 😊\n\nVocê pode perguntar sobre:\n• Cardápio e preços\n• Promoções do dia\n• Horários de funcionamento\n• Formas de pagamento\n• Delivery e taxas\n\nComo posso te ajudar hoje?",
    priority: 0
  }
];

// Function to find the best matching intent for a message
export const findIntent = (message: string): Intent => {
  const normalizedMessage = message.toLowerCase().trim();
  console.log('Buscando intent para:', normalizedMessage);
  
  // Check if it looks like an order ID or name (for order tracking)
  const isOrderId = /^[a-f0-9]{8,}$/i.test(normalizedMessage);
  const isName = /^[a-zA-ZÀ-ÿ\s]{3,}$/.test(normalizedMessage);
  
  // Special case for order tracking
  if (isOrderId || isName) {
    return {
      id: 'order_lookup',
      keywords: [],
      response: `Estou procurando informações sobre seu pedido "${normalizedMessage}"... \n\nPara demonstração, vamos simular que encontramos seu pedido. Seu pedido está em preparo e será enviado em breve. Obrigado pela paciência! 🙌`,
      priority: 9
    };
  }
  
  // Score each intent based on keyword matches
  const scoredIntents = intents.map(intent => {
    let score = 0;
    let matchedKeywords = [];
    
    // Check each keyword
    intent.keywords.forEach(keyword => {
      if (normalizedMessage.includes(keyword)) {
        // Add to score based on keyword length (longer keywords are more specific)
        score += keyword.length;
        matchedKeywords.push(keyword);
      }
    });
    
    // Apply priority multiplier
    score *= (intent.priority || 1);
    
    return { intent, score, matchedKeywords };
  });
  
  // Log top matches for debugging
  const topMatches = scoredIntents
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
    
  console.log('Top intent matches:', topMatches.map(m => ({
    id: m.intent.id,
    score: m.score,
    keywords: m.matchedKeywords
  })));
  
  // Sort by score (descending)
  scoredIntents.sort((a, b) => b.score - a.score);
  
  // Return the highest scoring intent, or fallback if no matches
  const bestMatch = scoredIntents[0];
  const result = bestMatch.score > 0 
    ? bestMatch.intent 
    : intents.find(intent => intent.id === 'fallback')!;
    
  console.log('Intent selecionada:', result.id, 'com score:', bestMatch.score);
  return result;
};