import React from 'react';
import { Clock, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  storeSettings?: any;
}

const Footer: React.FC<FooterProps> = ({ storeSettings }) => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Horário de Funcionamento */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Horário de Funcionamento
            </h3>
            <div className="space-y-3 text-gray-300">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium text-white">🏡 Loja 1</span>
                </div>
                <p className="text-sm">Rua Um, 1614‑C – Residencial 1 – Cágado</p>
                <p className="text-sm font-medium text-green-400">🕐 17h às 23h</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-medium text-white">🏡 Loja 2</span>
                </div>
                <p className="text-sm">Rua Dois, 2130‑A – Residencial 1 – Cágado</p>
                <p className="text-sm font-medium text-green-400">🕐 Aberta das 16h às 23h</p>
              </div>
            </div>
          </div>
          
          {/* Localização */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Nossas Lojas
            </h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <p className="font-medium text-white mb-1">Loja 1</p>
                <p className="text-sm">Rua Um, 1614‑C</p>
                <p className="text-sm">Residencial 1 - Cágado</p>
                <p className="text-sm text-green-400">17h às 23h</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Loja 2</p>
                <p className="text-sm">Rua Dois, 2130‑A</p>
                <p className="text-sm">Residencial 1 - Cágado</p>
                <p className="text-sm text-green-400">16h às 23h</p>
              </div>
            </div>
          </div>
          
          {/* Contato e Redes Sociais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone size={20} />
              Contato
            </h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <p className="font-medium text-white mb-2">Central de Atendimento</p>
                <p className="text-lg font-bold text-green-400">(85) 98904-1010</p>
                <p className="text-sm text-gray-300">CNPJ: {storeSettings?.cnpj || '38.130.139/0001-22'}</p>
                <p className="text-sm">WhatsApp e Ligações</p>
              </div>
              
              <div>
                <p className="font-medium text-white mb-2">Redes Sociais</p>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full hover:scale-110 transition-transform"
                    title="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 p-2 rounded-full hover:scale-110 transition-transform"
                    title="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Elite Açaí. Todos os direitos reservados.</p>
          <p className="text-sm mt-1">CNPJ: {storeSettings?.cnpj || '38.130.139/0001-22'}</p>
          <p className="text-sm mt-2">Delivery disponível apenas na loja 1 • Açaí fresquinho direto na sua casa</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;