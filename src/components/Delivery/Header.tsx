import React from 'react';
import { ShoppingBag, Search, Gift } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-green-500 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo elite.jpeg" 
              alt="Elite Açaí Logo" 
              className="w-20 h-20 object-contain bg-white rounded-full p-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback to icon if image fails to load
                const fallback = document.createElement('div');
                fallback.innerHTML = '<svg class="w-20 h-20 text-white bg-white rounded-full p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z"></path></svg>';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            <h1 className="text-4xl md:text-5xl font-bold">
              Elite Açaí
            </h1>
          </div>
          <p className="text-xl md:text-2xl font-light mb-6">
            Monte seu Açaí e receba rapidinho!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#cardapio"
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 backdrop-blur-sm border border-white/30"
            >
              Ver Cardápio
            </a>
            <a
              href="/buscar-pedido"
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 backdrop-blur-sm border border-white/30 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Acompanhar Pedido
            </a>
            <a
              href="/meu-cashback"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Gift size={20} />
              Meu Cashback
            </a>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-400/20 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-green-400/20 to-transparent rounded-full"></div>
      </div>

      {/* Botão WhatsApp Flutuante */}
      <div className="fixed bottom-6 left-6 z-50">
        <a
          href="https://wa.me/5585989041010"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </a>
      </div>
    </header>
  );
};

export default Header;