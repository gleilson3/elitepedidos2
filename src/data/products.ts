// IMPORTANTE: Os produtos agora são gerenciados pelo banco de dados
// Este arquivo mantém a estrutura para compatibilidade, mas os dados
// administrativos devem ser gerenciados através do painel /administrativo
// que agora salva no banco de dados via tabela delivery_products

export const categoryNames = {
  acai: 'Açaí',
  combo: 'Combos',
  milkshake: 'Milkshakes',
  vitamina: 'Vitaminas',
  sorvetes: 'Sorvetes' 
};

// NOTA: Os produtos do delivery agora são gerenciados pelo banco de dados
// através da tabela delivery_products. Este arquivo mantém os produtos
// para compatibilidade com o sistema atual, mas o painel administrativo
// agora salva diretamente no banco.

// Grupos de complementos padrão que serão usados em todos os produtos
const standardComplementGroups = [
  {
    id: 'tipo-acai',
    name: 'TIPO DE AÇAÍ (ESCOLHA 1 ITEM)',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'acai-tradicional', name: 'AÇAÍ PREMIUM TRADICIONAL', price: 0, description: 'Açaí tradicional premium' },
      { id: 'acai-fit', name: 'AÇAÍ PREMIUM (0% AÇÚCAR - FIT)', price: 0, description: 'Açaí sem açúcar, ideal para dieta' },
      { id: 'acai-morango', name: 'AÇAÍ PREMIUM COM MORANGO', price: 0, description: 'Açaí premium com sabor morango' }
    ].map(comp => ({ ...comp, isActive: true }))
  },
  {
    id: 'quantidade-acai',
    name: 'COMO DESEJA A QUANTIDADE DE AÇAÍ?',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'mais-acai', name: 'MAIS AÇAÍ', price: 0, description: 'Quantidade extra de açaí' },
      { id: 'nao-quero-acai', name: 'NÃO QUERO AÇAÍ', price: 0, description: 'Sem açaí' },
      { id: 'menos-acai', name: 'MENOS AÇAÍ', price: 0, description: 'Quantidade reduzida de açaí' },
      { id: 'quantidade-normal', name: 'QUANTIDADE NORMAL', price: 0, description: 'Quantidade padrão de açaí' }
    ].map(comp => ({ ...comp, isActive: true }))
  },
  {
    id: 'cremes-opcional',
    name: 'CREMES * OPCIONAL (ATÉ 2 ITEM)',
    required: false,
    minItems: 0,
    maxItems: 2,
    complements: [
      { id: 'creme-cupuacu', name: 'CREME DE CUPUAÇU', price: 0, description: 'Creme cremoso de cupuaçu' },
      { id: 'creme-morango', name: 'CREME DE MORANGO', price: 0, description: 'Creme doce de morango' },
      { id: 'creme-ninho', name: 'CREME DE NINHO', price: 0, description: 'Creme de leite ninho' },
      { id: 'creme-nutela', name: 'CREME DE NUTELA', price: 0, description: 'Creme de nutella' },
      { id: 'creme-maracuja', name: 'CREME DE MARACUJÁ', price: 0, description: 'Creme azedinho de maracujá' },
      { id: 'creme-pacoca', name: 'CREME DE PAÇOCA', price: 0, description: 'Creme de paçoca' },
      { id: 'creme-ovomaltine', name: 'CREME DE OVOMALTINE', price: 0, description: 'Creme de ovomaltine' },
      { id: 'creme-pistache', name: 'CREME DE PISTACHE', price: 0, description: 'Creme de pistache' }
    ].map(comp => ({ ...comp, isActive: true }))
  },
  {
    id: 'adicionais-3',
    name: '3 ADICIONAIS * OPCIONAL (ATÉ 3 ITENS)',
    required: false,
    minItems: 0,
    maxItems: 3,
    complements: [
      { id: 'castanha-banda', name: 'CASTANHA EM BANDA', price: 0, description: 'Castanha em fatias' },
      { id: 'cereja', name: 'CEREJA', price: 0, description: 'Cereja doce' },
      { id: 'chocoball-mine', name: 'CHOCOBALL MINE', price: 0, description: 'Chocoball pequeno' },
      { id: 'chocoball-power', name: 'CHOCOBALL POWER', price: 0, description: 'Chocoball grande' },
      { id: 'creme-cookies-branco', name: 'CREME DE COOKIES BRANCO', price: 0, description: 'Creme de cookies branco' },
      { id: 'chocolate-avela', name: 'CHOCOLATE COM AVELÃ (NUTELA)', price: 0, description: 'Chocolate com avelã' },
      { id: 'cobertura-chocolate', name: 'COBERTURA DE CHOCOLATE', price: 0, description: 'Cobertura de chocolate' },
      { id: 'cobertura-morango', name: 'COBERTURA DE MORANGO', price: 0, description: 'Cobertura de morango' },
      { id: 'cobertura-fine-dentadura', name: 'COBERTURA FINE DENTADURA', price: 0, description: 'Cobertura fine dentadura' },
      { id: 'cobertura-fine-bananinha', name: 'COBERTURA FINE BANANINHA', price: 0, description: 'Cobertura fine bananinha' },
      { id: 'cobertura-fine-beijinho', name: 'COBERTURA FINE BEIJINHO', price: 0, description: 'Cobertura fine beijinho' },
      { id: 'ganache-meio-amargo', name: 'GANACHE MEIO AMARGO', price: 0, description: 'Ganache meio amargo' },
      { id: 'gotas-chocolate-preto', name: 'GOTAS DE CHOCOLATE PRETO', price: 0, description: 'Gotas de chocolate preto' },
      { id: 'granulado-chocolate', name: 'GRANULADO DE CHOCOLATE', price: 0, description: 'Granulado de chocolate' },
      { id: 'granola', name: 'GRANOLA', price: 0, description: 'Granola crocante' },
      { id: 'jujuba', name: 'JUJUBA', price: 0, description: 'Jujuba colorida' },
      { id: 'kiwi', name: 'KIWI', price: 0, description: 'Kiwi fatiado' },
      { id: 'leite-condensado', name: 'LEITE CONDENSADO', price: 0, description: 'Leite condensado' },
      { id: 'leite-po', name: 'LEITE EM PÓ', price: 0, description: 'Leite em pó' },
      { id: 'marshmallows', name: 'MARSHMALLOWS', price: 0, description: 'Marshmallows macios' },
      { id: 'mms', name: 'MMS', price: 0, description: 'Confetes coloridos' },
      { id: 'morango', name: 'MORANGO', price: 0, description: 'Morango fresco' },
      { id: 'pacoca', name: 'PAÇOCA', price: 0, description: 'Paçoca triturada' },
      { id: 'recheio-leitinho', name: 'RECHEIO LEITINHO', price: 0, description: 'Recheio de leitinho' },
      { id: 'sucrilhos', name: 'SUCRILHOS', price: 0, description: 'Sucrilhos crocantes' },
      { id: 'uva', name: 'UVA', price: 0, description: 'Uva fresca' },
      { id: 'uva-passas', name: 'UVA PASSAS', price: 0, description: 'Uva passas' },
      { id: 'flocos-tapioca', name: 'FLOCOS DE TAPIOCA CARAMELIZADO', price: 0, description: 'Flocos de tapioca caramelizado' },
      { id: 'canudos', name: 'CANUDOS', price: 0, description: 'Canudos crocantes' },
      { id: 'ovomaltine', name: 'OVOMALTINE', price: 0, description: 'Ovomaltine em pó' },
      { id: 'farinha-lactea', name: 'FARINHA LÁCTEA', price: 0, description: 'Farinha láctea' },
      { id: 'abacaxi-vinho', name: 'ABACAXI AO VINHO', price: 0, description: 'Abacaxi ao vinho' },
      { id: 'amendoim-colorido', name: 'AMENDOIM COLORIDO', price: 0, description: 'Amendoim colorido' },
      { id: 'fine-beijinho', name: 'FINE BEIJINHO', price: 0, description: 'Fine beijinho' },
      { id: 'fine-amora', name: 'FINE AMORA', price: 0, description: 'Fine amora' },
      { id: 'fine-dentadura', name: 'FINE DENTADURA', price: 0, description: 'Fine dentadura' },
      { id: 'neston-flocos', name: 'NESTON EM FLOCOS', price: 0, description: 'Neston em flocos' },
      { id: 'recheio-ferrero', name: 'RECHEIO FERRERO ROCHÊ', price: 0, description: 'Recheio ferrero rochê' },
      { id: 'aveia-flocos', name: 'AVEIA EM FLOCOS', price: 0, description: 'Aveia em flocos' },
      { id: 'ganache-leite', name: 'GANACHE CHOCOLATE AO LEITE', price: 0, description: 'Ganache chocolate ao leite' },
      { id: 'chocoboll-branco', name: 'CHOCOBOLL BOLA BRANCA', price: 0, description: 'Chocoboll bola branca' },
      { id: 'morango-caldas', name: 'MORANGO EM CALDAS', price: 0, description: 'Morango em caldas' },
      { id: 'doce-leite', name: 'DOCE DE LEITE', price: 0, description: 'Doce de leite' },
      { id: 'chocowafer-branco', name: 'CHOCOWAFER BRANCO', price: 0, description: 'Chocowafer branco' },
      { id: 'creme-cookies-preto', name: 'CREME DE COOKIES PRETO', price: 0, description: 'Creme de cookies preto' },
      { id: 'pasta-amendoim', name: 'PASTA DE AMENDOIM', price: 0, description: 'Pasta de amendoim' },
      { id: 'recheio-leitinho-2', name: 'RECHEIO DE LEITINHO', price: 0, description: 'Recheio de leitinho' },
      { id: 'beijinho', name: 'BEIJINHO', price: 0, description: 'Beijinho' },
      { id: 'brigadeiro', name: 'BRIGADEIRO', price: 0, description: 'Brigadeiro' },
      { id: 'porcoes-brownie', name: 'PORÇÕES DE BROWNIE', price: 0, description: 'Porções de brownie' },
      { id: 'raspas-chocolate', name: 'RASPAS DE CHOCOLATE', price: 0, description: 'Raspas de chocolate' },
      { id: 'recheio-ferrero-2', name: 'RECHEIO DE FERREIRO ROCHÊ', price: 0, description: 'Recheio de ferreiro rochê' }
    ]
  },
  {
    id: 'adicionais-10',
    name: '10 ADICIONAIS * OPCIONAL (ATÉ 10 ITENS)',
    required: false,
    minItems: 0,
    maxItems: 10,
    complements: [
      { id: 'amendoin-pago', name: 'AMENDOIN', price: 2.00, description: 'Amendoim torrado' },
      { id: 'castanha-banda-pago', name: 'CASTANHA EM BANDA', price: 3.00, description: 'Castanha em fatias' },
      { id: 'cereja-pago', name: 'CEREJA', price: 2.00, description: 'Cereja doce' },
      { id: 'chocoball-mine-pago', name: 'CHOCOBALL MINE', price: 2.00, description: 'Chocoball pequeno' },
      { id: 'chocoball-power-pago', name: 'CHOCOBALL POWER', price: 2.00, description: 'Chocoball grande' },
      { id: 'creme-cookies-pago', name: 'CREME DE COOKIES', price: 3.00, description: 'Creme de cookies' },
      { id: 'chocolate-avela-pago', name: 'CHOCOLATE COM AVELÃ (NUTELA)', price: 3.00, description: 'Chocolate com avelã' },
      { id: 'cobertura-chocolate-pago', name: 'COBERTURA DE CHOCOLATE', price: 2.00, description: 'Cobertura de chocolate' },
      { id: 'cobertura-morango-pago', name: 'COBERTURA DE MORANGO', price: 2.00, description: 'Cobertura de morango' },
      { id: 'ganache-meio-amargo-pago', name: 'GANACHE MEIO AMARGO', price: 2.00, description: 'Ganache meio amargo' },
      { id: 'granola-pago', name: 'GRANOLA', price: 2.00, description: 'Granola crocante' },
      { id: 'gotas-chocolate-pago', name: 'GOTAS DE CHOCOLATE', price: 3.00, description: 'Gotas de chocolate' },
      { id: 'granulado-chocolate-pago', name: 'GRANULADO DE CHOCOLATE', price: 2.00, description: 'Granulado de chocolate' },
      { id: 'jujuba-pago', name: 'JUJUBA', price: 2.00, description: 'Jujuba colorida' },
      { id: 'kiwi-pago', name: 'KIWI', price: 3.00, description: 'Kiwi fatiado' },
      { id: 'leite-condensado-pago', name: 'LEITE CONDENSADO', price: 2.00, description: 'Leite condensado' },
      { id: 'leite-po-pago', name: 'LEITE EM PÓ', price: 3.00, description: 'Leite em pó' },
      { id: 'marshmallows-pago', name: 'MARSHMALLOWS', price: 2.00, description: 'Marshmallows macios' },
      { id: 'mms-pago', name: 'MMS', price: 2.00, description: 'Confetes coloridos' },
      { id: 'morango-pago', name: 'MORANGO', price: 3.00, description: 'Morango fresco' },
      { id: 'pacoca-pago', name: 'PAÇOCA', price: 2.00, description: 'Paçoca triturada' },
      { id: 'recheio-ninho-pago', name: 'RECHEIO DE NINHO', price: 2.00, description: 'Recheio de ninho' },
      { id: 'uva-pago', name: 'UVA', price: 2.00, description: 'Uva fresca' },
      { id: 'uva-passas-pago', name: 'UVA PASSAS', price: 2.00, description: 'Uva passas' },
      { id: 'cobertura-fine-dentadura-pago', name: 'COBERTURA FINE DENTADURA', price: 2.00, description: 'Cobertura fine dentadura' },
      { id: 'cobertura-fine-beijinho-pago', name: 'COBERTURA FINE BEIJINHO', price: 2.00, description: 'Cobertura fine beijinho' },
      { id: 'cobertura-fine-bananinha-pago', name: 'COBERTURA FINE BANANINHA', price: 2.00, description: 'Cobertura fine bananinha' }
    ]
  },
  {
    id: 'opcionais-separados',
    name: 'VOCÊ PREFERE OS OPCIONAIS SEPARADOS OU JUNTO COM O AÇAÍ?',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'tudo-junto', name: 'SIM, QUERO TUDO JUNTO', price: 0, description: 'Misturar tudo com o açaí' },
      { id: 'separados', name: 'NÃO, QUERO SEPARADOS', price: 0, description: 'Servir os complementos separadamente' }
    ]
  },
  {
    id: 'colher-descartavel',
    name: 'CONSUMA MENOS DESCARTÁVEIS.',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'sim-colher', name: 'SIM, VOU QUERER A COLHER', price: 0, description: 'Incluir colher descartável' },
      { id: 'nao-colher', name: 'NÃO QUERO COLHER, VOU AJUDAR AO MEIO AMBIENTE', price: 0, description: 'Sem colher, ajudando o meio ambiente' }
    ]
  }
];

// Complementos específicos para produtos com 1 creme + 2 mix
const complementsFor1Creme2Mix = [
  {
    id: 'tipo-acai',
    name: 'TIPO DE AÇAÍ (ESCOLHA 1 ITEM)',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'acai-tradicional', name: 'AÇAÍ PREMIUM TRADICIONAL', price: 0, description: 'Açaí tradicional premium' },
      { id: 'acai-fit', name: 'AÇAÍ PREMIUM (0% AÇÚCAR - FIT)', price: 0, description: 'Açaí sem açúcar, ideal para dieta' },
      { id: 'acai-morango', name: 'AÇAÍ PREMIUM COM MORANGO', price: 0, description: 'Açaí premium com sabor morango' }
    ]
  },
  {
    id: 'quantidade-acai',
    name: 'COMO DESEJA A QUANTIDADE DE AÇAÍ?',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'mais-acai', name: 'MAIS AÇAÍ', price: 0, description: 'Quantidade extra de açaí' },
      { id: 'nao-quero-acai', name: 'NÃO QUERO AÇAÍ', price: 0, description: 'Sem açaí' },
      { id: 'menos-acai', name: 'MENOS AÇAÍ', price: 0, description: 'Quantidade reduzida de açaí' },
      { id: 'quantidade-normal', name: 'QUANTIDADE NORMAL', price: 0, description: 'Quantidade padrão de açaí' }
    ]
  },
  {
    id: 'cremes-opcional-1',
    name: 'CREMES * OPCIONAL (ATÉ 1 ITEM)',
    required: false,
    minItems: 0,
    maxItems: 1,
    complements: [
      { id: 'creme-cupuacu', name: 'CREME DE CUPUAÇU', price: 0, description: 'Creme cremoso de cupuaçu' },
      { id: 'creme-morango', name: 'CREME DE MORANGO', price: 0, description: 'Creme doce de morango' },
      { id: 'creme-ninho', name: 'CREME DE NINHO', price: 0, description: 'Creme de leite ninho' },
      { id: 'creme-nutela', name: 'CREME DE NUTELA', price: 0, description: 'Creme de nutella' },
      { id: 'creme-maracuja', name: 'CREME DE MARACUJÁ', price: 0, description: 'Creme azedinho de maracujá' },
      { id: 'creme-pacoca', name: 'CREME DE PAÇOCA', price: 0, description: 'Creme de paçoca' },
      { id: 'creme-ovomaltine', name: 'CREME DE OVOMALTINE', price: 0, description: 'Creme de ovomaltine' },
      { id: 'creme-pistache', name: 'CREME DE PISTACHE', price: 0, description: 'Creme de pistache' }
    ]
  },
  {
    id: 'adicionais-2',
    name: '2 ADICIONAIS * OPCIONAL (ATÉ 2 ITENS)',
    required: false,
    minItems: 0,
    maxItems: 2,
    complements: [
      { id: 'castanha-banda', name: 'CASTANHA EM BANDA', price: 0, description: 'Castanha em fatias' },
      { id: 'cereja', name: 'CEREJA', price: 0, description: 'Cereja doce' },
      { id: 'chocoball-mine', name: 'CHOCOBALL MINE', price: 0, description: 'Chocoball pequeno' },
      { id: 'chocoball-power', name: 'CHOCOBALL POWER', price: 0, description: 'Chocoball grande' },
      { id: 'creme-cookies-branco', name: 'CREME DE COOKIES BRANCO', price: 0, description: 'Creme de cookies branco' },
      { id: 'chocolate-avela', name: 'CHOCOLATE COM AVELÃ (NUTELA)', price: 0, description: 'Chocolate com avelã' },
      { id: 'cobertura-chocolate', name: 'COBERTURA DE CHOCOLATE', price: 0, description: 'Cobertura de chocolate' },
      { id: 'cobertura-morango', name: 'COBERTURA DE MORANGO', price: 0, description: 'Cobertura de morango' },
      { id: 'granola', name: 'GRANOLA', price: 0, description: 'Granola crocante' },
      { id: 'granulado-chocolate', name: 'GRANULADO DE CHOCOLATE', price: 0, description: 'Granulado de chocolate' },
      { id: 'leite-condensado', name: 'LEITE CONDENSADO', price: 0, description: 'Leite condensado' },
      { id: 'morango', name: 'MORANGO', price: 0, description: 'Morango fresco' },
      { id: 'pacoca', name: 'PAÇOCA', price: 0, description: 'Paçoca triturada' }
    ]
  },
  {
    id: 'opcionais-separados',
    name: 'VOCÊ PREFERE OS OPCIONAIS SEPARADOS OU JUNTO COM O AÇAÍ?',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'tudo-junto', name: 'SIM, QUERO TUDO JUNTO', price: 0, description: 'Misturar tudo com o açaí' },
      { id: 'separados', name: 'NÃO, QUERO SEPARADOS', price: 0, description: 'Servir os complementos separadamente' }
    ]
  },
  {
    id: 'colher-descartavel',
    name: 'CONSUMA MENOS DESCARTÁVEIS.',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'sim-colher', name: 'SIM, VOU QUERER A COLHER', price: 0, description: 'Incluir colher descartável' },
      { id: 'nao-colher', name: 'NÃO QUERO COLHER, VOU AJUDAR AO MEIO AMBIENTE', price: 0, description: 'Sem colher, ajudando o meio ambiente' }
    ]
  }
];

// Complementos específicos para produtos com 5 mix
const complementsFor5Mix = [
  {
    id: 'tipo-acai',
    name: 'TIPO DE AÇAÍ (ESCOLHA 1 ITEM)',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'acai-tradicional', name: 'AÇAÍ PREMIUM TRADICIONAL', price: 0, description: 'Açaí tradicional premium' },
      { id: 'acai-fit', name: 'AÇAÍ PREMIUM (0% AÇÚCAR - FIT)', price: 0, description: 'Açaí sem açúcar, ideal para dieta' },
      { id: 'acai-morango', name: 'AÇAÍ PREMIUM COM MORANGO', price: 0, description: 'Açaí premium com sabor morango' }
    ]
  },
  {
    id: 'quantidade-acai',
    name: 'COMO DESEJA A QUANTIDADE DE AÇAÍ?',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'mais-acai', name: 'MAIS AÇAÍ', price: 0, description: 'Quantidade extra de açaí' },
      { id: 'nao-quero-acai', name: 'NÃO QUERO AÇAÍ', price: 0, description: 'Sem açaí' },
      { id: 'menos-acai', name: 'MENOS AÇAÍ', price: 0, description: 'Quantidade reduzida de açaí' },
      { id: 'quantidade-normal', name: 'QUANTIDADE NORMAL', price: 0, description: 'Quantidade padrão de açaí' }
    ]
  },
  {
    id: 'cremes-opcional',
    name: 'CREMES * OPCIONAL (ATÉ 2 ITEM)',
    required: false,
    minItems: 0,
    maxItems: 2,
    complements: [
      { id: 'creme-cupuacu', name: 'CREME DE CUPUAÇU', price: 0, description: 'Creme cremoso de cupuaçu' },
      { id: 'creme-morango', name: 'CREME DE MORANGO', price: 0, description: 'Creme doce de morango' },
      { id: 'creme-ninho', name: 'CREME DE NINHO', price: 0, description: 'Creme de leite ninho' },
      { id: 'creme-nutela', name: 'CREME DE NUTELA', price: 0, description: 'Creme de nutella' },
      { id: 'creme-maracuja', name: 'CREME DE MARACUJÁ', price: 0, description: 'Creme azedinho de maracujá' },
      { id: 'creme-pacoca', name: 'CREME DE PAÇOCA', price: 0, description: 'Creme de paçoca' },
      { id: 'creme-ovomaltine', name: 'CREME DE OVOMALTINE', price: 0, description: 'Creme de ovomaltine' },
      { id: 'creme-pistache', name: 'CREME DE PISTACHE', price: 0, description: 'Creme de pistache' }
    ]
  },
  {
    id: 'adicionais-5',
    name: '5 ADICIONAIS * OPCIONAL (ATÉ 5 ITENS)',
    required: false,
    minItems: 0,
    maxItems: 5,
    complements: [
      { id: 'castanha-banda', name: 'CASTANHA EM BANDA', price: 0, description: 'Castanha em fatias' },
      { id: 'cereja', name: 'CEREJA', price: 0, description: 'Cereja doce' },
      { id: 'chocoball-mine', name: 'CHOCOBALL MINE', price: 0, description: 'Chocoball pequeno' },
      { id: 'chocoball-power', name: 'CHOCOBALL POWER', price: 0, description: 'Chocoball grande' },
      { id: 'creme-cookies-branco', name: 'CREME DE COOKIES BRANCO', price: 0, description: 'Creme de cookies branco' },
      { id: 'chocolate-avela', name: 'CHOCOLATE COM AVELÃ (NUTELA)', price: 0, description: 'Chocolate com avelã' },
      { id: 'cobertura-chocolate', name: 'COBERTURA DE CHOCOLATE', price: 0, description: 'Cobertura de chocolate' },
      { id: 'cobertura-morango', name: 'COBERTURA DE MORANGO', price: 0, description: 'Cobertura de morango' },
      { id: 'cobertura-fine-dentadura', name: 'COBERTURA FINE DENTADURA', price: 0, description: 'Cobertura fine dentadura' },
      { id: 'cobertura-fine-bananinha', name: 'COBERTURA FINE BANANINHA', price: 0, description: 'Cobertura fine bananinha' },
      { id: 'cobertura-fine-beijinho', name: 'COBERTURA FINE BEIJINHO', price: 0, description: 'Cobertura fine beijinho' },
      { id: 'ganache-meio-amargo', name: 'GANACHE MEIO AMARGO', price: 0, description: 'Ganache meio amargo' },
      { id: 'gotas-chocolate-preto', name: 'GOTAS DE CHOCOLATE PRETO', price: 0, description: 'Gotas de chocolate preto' },
      { id: 'granulado-chocolate', name: 'GRANULADO DE CHOCOLATE', price: 0, description: 'Granulado de chocolate' },
      { id: 'granola', name: 'GRANOLA', price: 0, description: 'Granola crocante' },
      { id: 'jujuba', name: 'JUJUBA', price: 0, description: 'Jujuba colorida' },
      { id: 'kiwi', name: 'KIWI', price: 0, description: 'Kiwi fatiado' },
      { id: 'leite-condensado', name: 'LEITE CONDENSADO', price: 0, description: 'Leite condensado' },
      { id: 'leite-po', name: 'LEITE EM PÓ', price: 0, description: 'Leite em pó' },
      { id: 'marshmallows', name: 'MARSHMALLOWS', price: 0, description: 'Marshmallows macios' },
      { id: 'mms', name: 'MMS', price: 0, description: 'Confetes coloridos' },
      { id: 'morango', name: 'MORANGO', price: 0, description: 'Morango fresco' },
      { id: 'pacoca', name: 'PAÇOCA', price: 0, description: 'Paçoca triturada' },
      { id: 'recheio-leitinho', name: 'RECHEIO LEITINHO', price: 0, description: 'Recheio de leitinho' },
      { id: 'sucrilhos', name: 'SUCRILHOS', price: 0, description: 'Sucrilhos crocantes' },
      { id: 'uva', name: 'UVA', price: 0, description: 'Uva fresca' },
      { id: 'uva-passas', name: 'UVA PASSAS', price: 0, description: 'Uva passas' },
      { id: 'flocos-tapioca', name: 'FLOCOS DE TAPIOCA CARAMELIZADO', price: 0, description: 'Flocos de tapioca caramelizado' },
      { id: 'canudos', name: 'CANUDOS', price: 0, description: 'Canudos crocantes' },
      { id: 'ovomaltine', name: 'OVOMALTINE', price: 0, description: 'Ovomaltine em pó' },
      { id: 'farinha-lactea', name: 'FARINHA LÁCTEA', price: 0, description: 'Farinha láctea' },
      { id: 'abacaxi-vinho', name: 'ABACAXI AO VINHO', price: 0, description: 'Abacaxi ao vinho' },
      { id: 'amendoim-colorido', name: 'AMENDOIM COLORIDO', price: 0, description: 'Amendoim colorido' },
      { id: 'fine-beijinho', name: 'FINE BEIJINHO', price: 0, description: 'Fine beijinho' },
      { id: 'fine-amora', name: 'FINE AMORA', price: 0, description: 'Fine amora' },
      { id: 'fine-dentadura', name: 'FINE DENTADURA', price: 0, description: 'Fine dentadura' },
      { id: 'neston-flocos', name: 'NESTON EM FLOCOS', price: 0, description: 'Neston em flocos' },
      { id: 'recheio-ferrero', name: 'RECHEIO FERRERO ROCHÊ', price: 0, description: 'Recheio ferrero rochê' },
      { id: 'aveia-flocos', name: 'AVEIA EM FLOCOS', price: 0, description: 'Aveia em flocos' },
      { id: 'ganache-leite', name: 'GANACHE CHOCOLATE AO LEITE', price: 0, description: 'Ganache chocolate ao leite' },
      { id: 'chocoboll-branco', name: 'CHOCOBOLL BOLA BRANCA', price: 0, description: 'Chocoboll bola branca' },
      { id: 'morango-caldas', name: 'MORANGO EM CALDAS', price: 0, description: 'Morango em caldas' },
      { id: 'doce-leite', name: 'DOCE DE LEITE', price: 0, description: 'Doce de leite' },
      { id: 'chocowafer-branco', name: 'CHOCOWAFER BRANCO', price: 0, description: 'Chocowafer branco' },
      { id: 'creme-cookies-preto', name: 'CREME DE COOKIES PRETO', price: 0, description: 'Creme de cookies preto' },
      { id: 'pasta-amendoim', name: 'PASTA DE AMENDOIM', price: 0, description: 'Pasta de amendoim' },
      { id: 'recheio-leitinho-2', name: 'RECHEIO DE LEITINHO', price: 0, description: 'Recheio de leitinho' },
      { id: 'beijinho', name: 'BEIJINHO', price: 0, description: 'Beijinho' },
      { id: 'brigadeiro', name: 'BRIGADEIRO', price: 0, description: 'Brigadeiro' },
      { id: 'porcoes-brownie', name: 'PORÇÕES DE BROWNIE', price: 0, description: 'Porções de brownie' },
      { id: 'raspas-chocolate', name: 'RASPAS DE CHOCOLATE', price: 0, description: 'Raspas de chocolate' },
      { id: 'recheio-ferrero-2', name: 'RECHEIO DE FERREIRO ROCHÊ', price: 0, description: 'Recheio de ferreiro rochê' }
    ]
  },
  {
    id: 'adicionais-10',
    name: '10 ADICIONAIS * OPCIONAL (ATÉ 10 ITENS)',
    required: false,
    minItems: 0,
    maxItems: 10,
    complements: [
      { id: 'amendoin-pago', name: 'AMENDOIN', price: 2.00, description: 'Amendoim torrado' },
      { id: 'castanha-banda-pago', name: 'CASTANHA EM BANDA', price: 3.00, description: 'Castanha em fatias' },
      { id: 'cereja-pago', name: 'CEREJA', price: 2.00, description: 'Cereja doce' },
      { id: 'chocoball-mine-pago', name: 'CHOCOBALL MINE', price: 2.00, description: 'Chocoball pequeno' },
      { id: 'chocoball-power-pago', name: 'CHOCOBALL POWER', price: 2.00, description: 'Chocoball grande' },
      { id: 'creme-cookies-pago', name: 'CREME DE COOKIES', price: 3.00, description: 'Creme de cookies' },
      { id: 'chocolate-avela-pago', name: 'CHOCOLATE COM AVELÃ (NUTELA)', price: 3.00, description: 'Chocolate com avelã' },
      { id: 'cobertura-chocolate-pago', name: 'COBERTURA DE CHOCOLATE', price: 2.00, description: 'Cobertura de chocolate' },
      { id: 'cobertura-morango-pago', name: 'COBERTURA DE MORANGO', price: 2.00, description: 'Cobertura de morango' },
      { id: 'ganache-meio-amargo-pago', name: 'GANACHE MEIO AMARGO', price: 2.00, description: 'Ganache meio amargo' },
      { id: 'granola-pago', name: 'GRANOLA', price: 2.00, description: 'Granola crocante' },
      { id: 'gotas-chocolate-pago', name: 'GOTAS DE CHOCOLATE', price: 3.00, description: 'Gotas de chocolate' },
      { id: 'granulado-chocolate-pago', name: 'GRANULADO DE CHOCOLATE', price: 2.00, description: 'Granulado de chocolate' },
      { id: 'jujuba-pago', name: 'JUJUBA', price: 2.00, description: 'Jujuba colorida' },
      { id: 'kiwi-pago', name: 'KIWI', price: 3.00, description: 'Kiwi fatiado' },
      { id: 'leite-condensado-pago', name: 'LEITE CONDENSADO', price: 2.00, description: 'Leite condensado' },
      { id: 'leite-po-pago', name: 'LEITE EM PÓ', price: 3.00, description: 'Leite em pó' },
      { id: 'marshmallows-pago', name: 'MARSHMALLOWS', price: 2.00, description: 'Marshmallows macios' },
      { id: 'mms-pago', name: 'MMS', price: 2.00, description: 'Confetes coloridos' },
      { id: 'morango-pago', name: 'MORANGO', price: 3.00, description: 'Morango fresco' },
      { id: 'pacoca-pago', name: 'PAÇOCA', price: 2.00, description: 'Paçoca triturada' },
      { id: 'recheio-ninho-pago', name: 'RECHEIO DE NINHO', price: 2.00, description: 'Recheio de ninho' },
      { id: 'uva-pago', name: 'UVA', price: 2.00, description: 'Uva fresca' },
      { id: 'uva-passas-pago', name: 'UVA PASSAS', price: 2.00, description: 'Uva passas' },
      { id: 'cobertura-fine-dentadura-pago', name: 'COBERTURA FINE DENTADURA', price: 2.00, description: 'Cobertura fine dentadura' },
      { id: 'cobertura-fine-beijinho-pago', name: 'COBERTURA FINE BEIJINHO', price: 2.00, description: 'Cobertura fine beijinho' },
      { id: 'cobertura-fine-bananinha-pago', name: 'COBERTURA FINE BANANINHA', price: 2.00, description: 'Cobertura fine bananinha' }
    ]
  },
  {
    id: 'opcionais-separados',
    name: 'VOCÊ PREFERE OS OPCIONAIS SEPARADOS OU JUNTO COM O AÇAÍ?',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'tudo-junto', name: 'SIM, QUERO TUDO JUNTO', price: 0, description: 'Misturar tudo com o açaí' },
      { id: 'separados', name: 'NÃO, QUERO SEPARADOS', price: 0, description: 'Servir os complementos separadamente' }
    ]
  },
  {
    id: 'colher-descartavel',
    name: 'CONSUMA MENOS DESCARTÁVEIS.',
    required: true,
    minItems: 1,
    maxItems: 1,
    complements: [
      { id: 'sim-colher', name: 'SIM, VOU QUERER A COLHER', price: 0, description: 'Incluir colher descartável' },
      { id: 'nao-colher', name: 'NÃO QUERO COLHER, VOU AJUDAR AO MEIO AMBIENTE', price: 0, description: 'Sem colher, ajudando o meio ambiente' }
    ]
  }
];

// Complementos específicos para vitaminas
const vitaminaComplementGroups = [
  {
    id: 'opcoes-vitamina-acai',
    name: 'Opções de Vitamina de Açaí',
    required: false,
    minItems: 0,
    maxItems: 2,
    complements: [
      { id: 'amendoim', name: 'Amendoim', price: 0, description: 'Amendoim torrado' },
      { id: 'castanha-granulada', name: 'Castanha granulada', price: 0, description: 'Castanha granulada' },
      { id: 'cereja', name: 'Cereja', price: 0, description: 'Cereja doce' },
      { id: 'farinha-lactea', name: 'Farinha Láctea', price: 0, description: 'Farinha láctea' },
      { id: 'granola', name: 'Granola', price: 0, description: 'Granola crocante' },
      { id: 'leite-condensado', name: 'Leite condensado', price: 0, description: 'Leite condensado cremoso' },
      { id: 'mel', name: 'Mel', price: 0, description: 'Mel puro' }
    ]
  }
];

export const products = [
  // PROMOÇÕES QUINTA ELITE (Programadas para quinta-feira)
  {
    id: 'promocao-quinta-elite-1kg',
    // ✅ VERIFICADO: Quinta-feira apenas
    name: 'PROMOÇÃO QUINTA ELITE - AÇAI 1KG POR R$ 37,99!',
    category: 'acai' as const,
    price: 37.99,
    originalPrice: 44.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    isActive: true, // Garantir que está ativo
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    },
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: true,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    }
  },
  {
    id: 'promocao-quinta-elite-700g',
    // ✅ VERIFICADO: Quinta-feira apenas
    name: 'PROMOÇÃO QUINTA ELITE - AÇAÍ DE 27,50 (700G)',
    category: 'acai' as const,
    price: 27.50,
    originalPrice: 31.50,
    description: 'AÇAÍ + 2 CREME + 5 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: complementsFor5Mix,
    isActive: true, // Garantir que está ativo
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: true,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },
  {
    id: 'promocao-quinta-elite-600g',
    // ✅ VERIFICADO: Quinta-feira apenas
    name: 'PROMOÇÃO QUINTA ELITE - AÇAÍ DE 23,99 (600G)',
    category: 'acai' as const,
    price: 23.99,
    originalPrice: 26.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    isActive: true, // Garantir que está ativo
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: true,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },
  {
    id: 'promocao-quinta-elite-400g',
    // ✅ VERIFICADO: Quinta-feira apenas
    name: 'PROMOÇÃO QUINTA ELITE - AÇAI DE 16,99 (400G)',
    category: 'acai' as const,
    price: 16.99,
    originalPrice: 18.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    isActive: true, // Garantir que está ativo
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: true,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },

  // PROMOÇÕES DO DIA (Disponíveis todos os dias)
  {
    id: 'promocao-copo-400ml',
    name: 'PROMOÇÃO DO DIA - COPO DE 400ML SEM PESO',
    category: 'acai' as const,
    price: 12.99,
    originalPrice: 18.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    isActive: true,
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: false,
          wednesday: true,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },
  {
    id: 'promocao-copo-500ml',
    name: 'PROMOÇÃO DO DIA - COPO DE 500ML SEM PESO',
    category: 'acai' as const,
    price: 14.99,
    originalPrice: 19.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    isActive: true,
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: true,
        wednesday: false,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: true,
          wednesday: false,
          thursday: false,
          friday: true,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },
  {
    id: 'promocao-copo-300ml',
    name: 'PROMOÇÃO DO DIA - COPO DE 300ML SEM PESO',
    category: 'acai' as const,
    price: 9.99,
    originalPrice: 13.99,
    description: 'AÇAÍ + 1 CREME + 2 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: complementsFor1Creme2Mix,
    isActive: true,
    scheduledDays: {
      enabled: true,
      days: {
        monday: true,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: true,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },

  // COMBO ESPECIAL
  {
    id: 'combo-casal-1kg',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'PROMOÇÃO COMBO CASAL (1 KG) DE AÇAÍ + MILK-SHAKE (300G)',
    category: 'combo' as const,
    price: 49.99,
    originalPrice: 54.99,
    description: 'Combo perfeito para casal: 1kg de açaí + milkshake 300g',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: [
      ...standardComplementGroups,
      {
        id: 'sabor-milkshake-combo',
        name: 'Sabor do Milkshake',
        required: true,
        minItems: 1,
        maxItems: 1,
        complements: [
          { id: 'morango', name: 'Morango', price: 0, description: 'Milkshake de morango' },
          { id: 'chocolate', name: 'Chocolate', price: 0, description: 'Milkshake de chocolate' },
          { id: 'baunilha', name: 'Baunilha', price: 0, description: 'Milkshake de baunilha' },
          { id: 'ovomaltine', name: 'Ovomaltine', price: 0, description: 'Milkshake de ovomaltine' }
        ]
      }
    ]
  },

  // AÇAÍ REGULAR
  {
    id: 'acai-300g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 13,99 (300G)',
    category: 'acai' as const,
    price: 13.99,
    originalPrice: 16.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups
  },
  {
    id: 'acai-350g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 15,99 (350G)',
    category: 'acai' as const,
    price: 15.99,
    originalPrice: 17.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups
  },
  {
    id: 'acai-400g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 18,99 (400G)',
    category: 'acai' as const,
    price: 18.99,
    originalPrice: 20.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups
  },
  {
    id: 'acai-500g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 22,99 (500G)',
    category: 'acai' as const,
    price: 22.99,
    originalPrice: 24.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups
  },
  {
    id: 'acai-600g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 26,99 (600G)',
    category: 'acai' as const,
    price: 26.99,
    originalPrice: 28.99,
    description: 'AÇAÍ + 2 CREME + 3 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups
  },
  {
    id: 'acai-700g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 31,99 (700G)',
    category: 'acai' as const,
    price: 31.99,
    originalPrice: 34.99,
    description: 'AÇAÍ + 2 CREME + 5 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: complementsFor5Mix
  },
  {
    id: 'acai-800g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 34,99 (800G)',
    category: 'acai' as const,
    price: 34.99,
    originalPrice: 36.99,
    description: 'AÇAÍ + 2 CREME + 5 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: complementsFor5Mix
  },
  {
    id: 'acai-900g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'AÇAÍ DE 38,99 (900G)',
    category: 'acai' as const,
    price: 38.99,
    originalPrice: 41.99,
    description: 'AÇAÍ + 2 CREME + 5 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: complementsFor5Mix
  },

  // COMBOS
  {
    id: 'combo-1-400g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'COMBO 1 (400G) - Pesados Separados',
    category: 'combo' as const,
    price: 23.99,
    originalPrice: 26.99,
    description: '300G DE AÇAÍ + 100G DE CREME + 4 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups
  },
  {
    id: 'combo-2-500g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'COMBO 2 (500G) - Pesados Separados',
    category: 'combo' as const,
    price: 26.99,
    originalPrice: 29.99,
    description: '300G DE AÇAÍ + 200G DE CREME + 4 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups
  },
  {
    id: 'combo-3-600g',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'COMBO 3 (600G) - Pesados Separados',
    category: 'combo' as const,
    price: 31.99,
    originalPrice: 34.99,
    description: '400G AÇAÍ + 200G DE CREMES + 5 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: complementsFor5Mix
  },
  {
    id: 'combo-4-900g',
    // ✅ VERIFICADO: Todos os dias exceto quinta-feira
    name: 'COMBO 4 (900G) - Pesados Separados',
    category: 'combo' as const,
    price: 42.99,
    originalPrice: 44.99,
    description: '600G DE AÇAÍ + 300G DE CREME + 5 MIX',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: complementsFor5Mix,
    scheduledDays: {
      enabled: true,
      days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: true,
        sunday: true
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: false,
          friday: true,
          saturday: true,
          sunday: true
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },

  // MILKSHAKES
  {
    id: 'milkshake-400ml',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'MILKSHAKE DE 400ML',
    category: 'milkshake' as const,
    price: 11.99,
    originalPrice: 13.99,
    description: 'Milkshake cremoso de 400ml',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: [
      {
        id: 'sabor-milkshake-400',
        name: 'Escolha o Sabor',
        required: true,
        minItems: 1,
        maxItems: 1,
        complements: [
          { id: 'morango', name: 'Morango', price: 0, description: 'Milkshake de morango' },
          { id: 'chocolate', name: 'Chocolate', price: 0, description: 'Milkshake de chocolate' },
          { id: 'baunilha', name: 'Baunilha', price: 0, description: 'Milkshake de baunilha' },
          { id: 'ovomaltine', name: 'Ovomaltine', price: 0, description: 'Milkshake de ovomaltine' }
        ]
      }
    ]
  },
  {
    id: 'milkshake-500ml',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'MILKSHAKE DE 500ML',
    category: 'milkshake' as const,
    price: 12.99,
    originalPrice: 14.99,
    description: 'Milkshake cremoso de 500ml',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: [
      {
        id: 'sabor-milkshake-500',
        name: 'Escolha o Sabor',
        required: true,
        minItems: 1,
        maxItems: 1,
        complements: [
          { id: 'morango', name: 'Morango', price: 0, description: 'Milkshake de morango' },
          { id: 'chocolate', name: 'Chocolate', price: 0, description: 'Milkshake de chocolate' },
          { id: 'baunilha', name: 'Baunilha', price: 0, description: 'Milkshake de baunilha' },
          { id: 'ovomaltine', name: 'Ovomaltine', price: 0, description: 'Milkshake de ovomaltine' }
        ]
      }
    ]
  },

  // VITAMINAS
  {
    id: 'vitamina-acai-400ml',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'VITAMINA DE AÇAÍ - 400ml',
    category: 'vitamina' as const,
    price: 12.00,
    originalPrice: 14.00,
    description: 'Açaí, leite em pó em cada vitamina você pode escolher duas dessas opções sem custo.',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: vitaminaComplementGroups
  },
  {
    id: 'vitamina-acai-500ml',
    // ⚠️ SEM PROGRAMAÇÃO: Sempre disponível
    name: 'VITAMINA DE AÇAÍ - 500ml',
    category: 'vitamina' as const,
    price: 15.00,
    originalPrice: 17.00,
    description: 'Açaí, leite em pó em cada vitamina você pode escolher duas dessas opções sem custo.',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: vitaminaComplementGroups
  },

  // AÇAÍ POR PESO
  {
    id: 'acai-1kg',
    name: '1Kg de Açaí',
    category: 'acai' as const,
    price: 44.99,
    description: 'Açaí tradicional vendido por peso - 1kg',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    is_weighable: true,
    pricePerGram: 0.04499 // R$ 44,99/kg = R$ 0,04499/g
  },
  {
    id: 'acai-1kg-quinta',
    name: '1Kg de Açaí - Quinta Promocional',
    category: 'acai' as const,
    price: 37.99,
    description: 'Açaí tradicional vendido por peso - Promoção de quinta-feira',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    is_weighable: true,
    pricePerGram: 0.03799, // R$ 37,99/kg = R$ 0,03799/g
    isActive: true,
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: true,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  },

  // SORVETES
  {
    id: 'sorvete-1kg',
    name: '1kg de Sorvete',
    category: 'sorvetes' as const, 
    price: 44.99,
    description: 'Sorvete tradicional 1kg',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    is_weighable: true,
    pricePerGram: 0.04499 // R$ 44,99/kg = R$ 0,04499/g
  },
  {
    id: 'sorvete-1kg-quinta',
    name: '1kg de Sorvete - Quinta promocional',
    category: 'sorvetes' as const, 
    price: 37.99,
    description: 'Sorvete tradicional 1kg - Promoção de quinta-feira',
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    complementGroups: standardComplementGroups,
    is_weighable: true,
    pricePerGram: 0.03799, // R$ 37,99/kg = R$ 0,03799/g
    isActive: true,
    scheduledDays: {
      enabled: true,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: true,
        friday: false,
        saturday: false,
        sunday: false
      },
      startTime: '00:00',
      endTime: '23:59'
    },
    availability: {
      type: 'specific_days',
      scheduledDays: {
        enabled: true,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: false
        },
        startTime: '00:00',
        endTime: '23:59'
      }
    }
  }
];