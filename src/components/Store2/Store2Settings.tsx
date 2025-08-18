import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Clock, Store, Printer, Save, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { useStore2Hours } from '../../hooks/useStore2Hours';
import { Store2Hours } from '../../hooks/useStore2Hours';

const Store2Settings: React.FC = () => {
  const { storeHours, storeSettings, updateStoreHours, updateStoreSettings, getStore2Status, refreshData } = useStore2Hours();
  
  const [activeTab, setActiveTab] = useState<'store' | 'hours' | 'printer'>('store');
  const [localHours, setLocalHours] = useState<Record<number, Partial<Store2Hours>>>({});
  const [localSettings, setLocalSettings] = useState({
    store_name: '',
    phone: '',
    cnpj: '',
    address: '',
    is_open_now: true
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [printerSettings, setPrinterSettings] = useState({
    paper_width: '80mm',
    page_size: 300,
    font_size: 14,
    scale: 1,
    margin_left: 0,
    margin_top: 1,
    margin_bottom: 1,
    auto_print_orders: true
  });

  // Inicializar configurações locais quando os dados carregarem
  useEffect(() => {
    if (storeSettings) {
      setLocalSettings({
        store_name: storeSettings.store_name || '',
        phone: storeSettings.phone || '',
        cnpj: storeSettings.cnpj || '',
        address: storeSettings.address || '',
        is_open_now: storeSettings.is_open_now ?? true
      });
    }
  }, [storeSettings]);

  // Carregar configurações de impressora do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('store2_printer_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setPrinterSettings(settings);
      } catch (e) {
        console.error('Erro ao carregar configurações de impressora da Loja 2:', e);
      }
    }
  }, []);

  // Limpar alterações locais quando os dados do servidor mudarem
  useEffect(() => {
    setLocalHours({});
  }, [storeHours]);

  const getHoursForDay = (dayOfWeek: number) => {
    const localHour = localHours[dayOfWeek];
    const originalHour = storeHours.find(h => h.day_of_week === dayOfWeek);
    
    return {
      is_open: localHour?.is_open ?? originalHour?.is_open ?? true,
      open_time: localHour?.open_time ?? originalHour?.open_time ?? '16:00',
      close_time: localHour?.close_time ?? originalHour?.close_time ?? '23:00'
    };
  };

  const updateLocalHours = (dayOfWeek: number, field: keyof Store2Hours, value: any) => {
    setLocalHours(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value
      }
    }));
  };

  const handleSaveHours = async () => {
    setSaving(true);
    try {
      // Salvar horários modificados
      const savePromises = [];
      
      for (const [dayStr, hours] of Object.entries(localHours)) {
        const day = parseInt(dayStr);
        savePromises.push(updateStoreHours(day, hours));
      }

      // Salvar configurações da loja
      savePromises.push(updateStoreSettings(localSettings));

      await Promise.all(savePromises);

      // Limpar alterações locais
      setLocalHours({});
      
      setLastSaved(new Date());
      
      // Mostrar feedback de sucesso
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Configurações da Loja 2 salvas com sucesso!
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao salvar configurações da Loja 2:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrinterSettings = () => {
    try {
      localStorage.setItem('store2_printer_settings', JSON.stringify(printerSettings));
      
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Configurações de impressora da Loja 2 salvas!
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro ao salvar configurações de impressora:', error);
      alert('Erro ao salvar configurações de impressora. Tente novamente.');
    }
  };

  const dayNames = [
    'Domingo',
    'Segunda-feira', 
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  const hasChanges = Object.keys(localHours).length > 0 || 
    JSON.stringify(localSettings) !== JSON.stringify({
      store_name: storeSettings?.store_name || '',
      phone: storeSettings?.phone || '',
      cnpj: storeSettings?.cnpj || '',
      address: storeSettings?.address || '',
      is_open_now: storeSettings?.is_open_now ?? true
    });

  const detectMidnightCrossing = (openTime: string, closeTime: string) => {
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    return closeMinutes < openMinutes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Settings size={24} className="text-gray-600" />
            Configurações do Sistema - Loja 2
          </h2>
          <p className="text-gray-600">Personalize o funcionamento do PDV da Loja 2</p>
          {lastSaved && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Última atualização: {lastSaved.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'store'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Store size={18} />
            Loja
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'hours'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock size={18} />
            Horários de Funcionamento
          </button>
          <button
            onClick={() => setActiveTab('printer')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'printer'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Printer size={18} />
            Impressora
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Store size={20} className="text-blue-600" />
            Informações da Loja 2
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Loja
              </label>
              <input
                type="text"
                value={localSettings.store_name}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, store_name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da sua loja"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={localSettings.phone}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(85) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={localSettings.cnpj || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, cnpj: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={localSettings.address}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rua Dois, 2130-A – Residencial 1 – Cágado"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <span className="text-gray-700 font-medium">Controle Manual:</span>
              </label>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, is_open_now: !prev.is_open_now }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  localSettings.is_open_now
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {localSettings.is_open_now ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Loja Aberta
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Loja Fechada
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Sobrescreve os horários automáticos
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-green-600" />
            Horários de Funcionamento - Loja 2
          </h3>

          <div className="space-y-4">
            {dayNames.map((dayName, index) => {
              const hours = getHoursForDay(index);
              const hasLocalChanges = localHours[index];
              const crossesMidnight = detectMidnightCrossing(hours.open_time, hours.close_time);
              
              return (
                <div key={index} className={`border rounded-lg p-4 ${
                  hasLocalChanges ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 flex items-center gap-2">
                      {dayName}
                      {hasLocalChanges && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                          Modificado
                        </span>
                      )}
                      {crossesMidnight && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                          🌙 Cruza meia-noite
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => updateLocalHours(index, 'is_open', !hours.is_open)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                        hours.is_open
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {hours.is_open ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aberto
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Fechado
                        </>
                      )}
                    </button>
                  </div>

                  {hours.is_open && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Abertura</label>
                          <input
                            type="time"
                            value={hours.open_time}
                            onChange={(e) => updateLocalHours(index, 'open_time', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Fechamento</label>
                          <input
                            type="time"
                            value={hours.close_time}
                            onChange={(e) => updateLocalHours(index, 'close_time', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      
                      {crossesMidnight && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info size={16} className="text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-700">
                              <p className="font-medium">Horário que cruza meia-noite</p>
                              <p>Este horário funciona de {hours.open_time} até {hours.close_time} do dia seguinte.</p>
                              <p className="text-xs mt-1">
                                Exemplo: Abre às {hours.open_time} e fecha às {hours.close_time} da madrugada.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'printer' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Printer size={20} className="text-purple-600" />
            Configurações de Impressora - Loja 2
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Impressão Automática Ativada</p>
                <p className="text-blue-700 text-sm mt-1">
                  A Loja 2 está configurada para imprimir automaticamente todos os pedidos.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largura do Papel
              </label>
              <select
                value={printerSettings.paper_width}
                onChange={(e) => setPrinterSettings(prev => ({ ...prev, paper_width: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm (Padrão)</option>
                <option value="A4">A4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tamanho da Fonte (px)
              </label>
              <input
                type="number"
                min="8"
                max="24"
                value={printerSettings.font_size}
                onChange={(e) => setPrinterSettings(prev => ({ ...prev, font_size: parseInt(e.target.value) || 14 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escala
              </label>
              <input
                type="number"
                min="0.5"
                max="2"
                step="0.1"
                value={printerSettings.scale}
                onChange={(e) => setPrinterSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) || 1 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={printerSettings.auto_print_orders}
                  onChange={(e) => setPrinterSettings(prev => ({ ...prev, auto_print_orders: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Impressão automática de pedidos
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Imprime automaticamente quando novos pedidos chegarem
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSavePrinterSettings}
              className="px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Save size={20} />
              Salvar Configurações de Impressora
            </button>
          </div>
        </div>
      )}

      {/* Informações Importantes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 mb-2">ℹ️ Informações Importantes - Loja 2</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• As configurações são salvas no banco de dados</li>
              <li>• Sincronização automática entre dispositivos</li>
              <li>• O controle manual sobrescreve os horários automáticos</li>
              <li>• Use o controle manual para fechamentos temporários</li>
              <li>• <strong>Horários que cruzam meia-noite são suportados</strong></li>
              <li>• A Loja 2 não possui sistema de delivery</li>
              <li>• Vendas são apenas presenciais</li>
              <li>• Relatórios independentes da Loja 1</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3">
        {hasChanges && (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertCircle size={16} />
            Você tem alterações não salvas
          </div>
        )}
        
        <button
          onClick={handleSaveHours}
          disabled={saving || !hasChanges}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            hasChanges
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save size={20} />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Store2Settings;