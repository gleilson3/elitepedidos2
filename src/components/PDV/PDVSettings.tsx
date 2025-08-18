import React, { useState, useEffect } from 'react';
import { Settings, Save, Printer, Scale, Wifi, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PDVSettings {
  id: string;
  store_name: string;
  printer_enabled: boolean;
  scale_enabled: boolean;
  auto_print: boolean;
  sound_enabled: boolean;
  paper_width: string;
  font_size: number;
  scale_port: string;
  scale_baud_rate: number;
  created_at: string;
  updated_at: string;
}

const PDVSettings: React.FC = () => {
  const [settings, setSettings] = useState<PDVSettings>({
    id: 'loja1',
    store_name: 'Elite Açaí - Loja 1',
    printer_enabled: true,
    scale_enabled: true,
    auto_print: false,
    sound_enabled: true,
    paper_width: '80mm',
    font_size: 14,
    scale_port: 'COM1',
    scale_baud_rate: 4800,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  // Check Supabase configuration
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const isConfigured = supabaseUrl && supabaseKey && 
                        supabaseUrl !== 'your_supabase_url_here' && 
                        supabaseKey !== 'your_supabase_anon_key_here' &&
                        !supabaseUrl.includes('placeholder');
    
    setSupabaseConfigured(isConfigured);
  }, []);

  // Load settings from database or localStorage
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabaseConfigured) {
        console.warn('⚠️ Supabase não configurado - usando localStorage');
        loadFromLocalStorage();
        return;
      }

      console.log('🔄 Carregando configurações do banco...');

      const { data, error } = await supabase
        .from('pdv_settings')
        .select('*')
        .eq('id', 'loja1')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar configurações:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Configurações carregadas do banco:', data);
        setSettings(data);
      } else {
        console.log('ℹ️ Nenhuma configuração encontrada, criando padrão...');
        await createDefaultSettings();
      }
    } catch (err) {
      console.error('❌ Erro ao carregar configurações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Load from localStorage as fallback
  const loadFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem('pdv_settings_loja1');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        console.log('✅ Configurações carregadas do localStorage');
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
    setLoading(false);
  };

  // Create default settings in database
  const createDefaultSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pdv_settings')
        .insert([{
          id: 'loja1',
          store_name: 'Elite Açaí - Loja 1',
          printer_enabled: true,
          scale_enabled: true,
          auto_print: false,
          sound_enabled: true,
          paper_width: '80mm',
          font_size: 14,
          scale_port: 'COM1',
          scale_baud_rate: 4800
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Configurações padrão criadas:', data);
      setSettings(data);
    } catch (error) {
      console.error('❌ Erro ao criar configurações padrão:', error);
    }
  };

  // Save settings to database
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (!supabaseConfigured) {
        // Fallback to localStorage
        localStorage.setItem('pdv_settings_loja1', JSON.stringify(settings));
        console.log('💾 Configurações salvas no localStorage');
      } else {
        console.log('💾 Salvando configurações no banco...');

        const { data, error } = await supabase
          .from('pdv_settings')
          .upsert({
            ...settings,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (error) throw error;

        console.log('✅ Configurações salvas no banco:', data);
        setSettings(data);

        // Also save to localStorage as backup
        localStorage.setItem('pdv_settings_loja1', JSON.stringify(data));
      }

      setLastSaved(new Date());

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Configurações salvas com sucesso!
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);

    } catch (err) {
      console.error('❌ Erro ao salvar configurações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // Test database connection
  const testConnection = async () => {
    try {
      setError(null);
      console.log('🔍 Testando conexão com banco...');

      const { data, error } = await supabase
        .from('pdv_settings')
        .select('count', { count: 'exact', head: true });

      if (error) throw error;

      console.log('✅ Conexão com banco OK');
      
      const testMessage = document.createElement('div');
      testMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      testMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Conexão com banco OK!
      `;
      document.body.appendChild(testMessage);
      
      setTimeout(() => {
        if (document.body.contains(testMessage)) {
          document.body.removeChild(testMessage);
        }
      }, 3000);

    } catch (err) {
      console.error('❌ Erro na conexão:', err);
      setError(err instanceof Error ? err.message : 'Erro na conexão');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Supabase Status */}
      {!supabaseConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Modo Offline</h3>
              <p className="text-yellow-700 text-sm">
                Supabase não configurado. Configurações salvas apenas localmente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Settings size={24} className="text-gray-600" />
            Configurações do Sistema - Loja 1
          </h2>
          <p className="text-gray-600">Personalize o funcionamento do PDV</p>
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
          {supabaseConfigured && (
            <button
              onClick={testConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Database size={16} />
              Testar Conexão
            </button>
          )}
          <button
            onClick={loadSettings}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Recarregar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            Configurações Gerais
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Loja
              </label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.sound_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, sound_enabled: e.target.checked }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Habilitar sons do sistema
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Configurações de Impressora */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Printer size={20} className="text-green-600" />
            Impressora
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.printer_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, printer_enabled: e.target.checked }))}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Impressora habilitada
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.auto_print}
                  onChange={(e) => setSettings(prev => ({ ...prev, auto_print: e.target.checked }))}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Impressão automática de pedidos pendentes
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Imprime automaticamente quando novos pedidos chegam no atendimento
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largura do Papel
              </label>
              <select
                value={settings.paper_width}
                onChange={(e) => setSettings(prev => ({ ...prev, paper_width: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
                <option value="A4">A4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tamanho da Fonte
              </label>
              <input
                type="number"
                min="8"
                max="24"
                value={settings.font_size}
                onChange={(e) => setSettings(prev => ({ ...prev, font_size: parseInt(e.target.value) || 14 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Balança */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Scale size={20} className="text-purple-600" />
            Balança
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.scale_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, scale_enabled: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Balança habilitada
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porta Serial
              </label>
              <select
                value={settings.scale_port}
                onChange={(e) => setSettings(prev => ({ ...prev, scale_port: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="COM1">COM1</option>
                <option value="COM2">COM2</option>
                <option value="COM3">COM3</option>
                <option value="COM4">COM4</option>
                <option value="/dev/ttyUSB0">/dev/ttyUSB0</option>
                <option value="/dev/ttyS0">/dev/ttyS0</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baud Rate
              </label>
              <select
                value={settings.scale_baud_rate}
                onChange={(e) => setSettings(prev => ({ ...prev, scale_baud_rate: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={4800}>4800</option>
                <option value={9600}>9600</option>
                <option value={19200}>19200</option>
                <option value={38400}>38400</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
                <strong>Status:</strong> {settings.scale_enabled ? 'Habilitada' : 'Desabilitada'}
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Porta: {settings.scale_port} | Baud: {settings.scale_baud_rate}
              </p>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Database size={20} className="text-indigo-600" />
            Status do Sistema
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Banco de Dados:</span>
              <span className={`text-sm font-medium ${supabaseConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
                {supabaseConfigured ? 'Conectado' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Armazenamento:</span>
              <span className="text-sm font-medium text-green-600">
                {supabaseConfigured ? 'Supabase + Local' : 'Apenas Local'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última Sincronização:</span>
              <span className="text-sm font-medium text-gray-700">
                {lastSaved ? lastSaved.toLocaleTimeString('pt-BR') : 'Nunca'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Configurações:</span>
              <span className="text-sm font-medium text-blue-600">
                {supabaseConfigured ? 'Banco + Backup Local' : 'Apenas Local'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações sobre Configurações */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Database size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">💾 Como as Configurações são Salvas</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {supabaseConfigured ? (
                <>
                  <li>• <strong>Banco de Dados:</strong> Salvas na tabela `pdv_settings` (principal)</li>
                  <li>• <strong>Backup Local:</strong> Cópia no localStorage (segurança)</li>
                  <li>• <strong>Sincronização:</strong> Automática entre dispositivos</li>
                  <li>• <strong>Recuperação:</strong> Fallback para localStorage se banco falhar</li>
                </>
              ) : (
                <>
                  <li>• <strong>Armazenamento Local:</strong> Salvas apenas no localStorage</li>
                  <li>• <strong>Limitação:</strong> Não sincroniza entre dispositivos</li>
                  <li>• <strong>Configure o Supabase</strong> para sincronização completa</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
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

export default PDVSettings;