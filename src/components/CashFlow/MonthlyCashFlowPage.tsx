import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Download, 
  Printer, 
  RefreshCw,
  ArrowLeft,
  BarChart3,
  PieChart,
  AlertTriangle,
  Plus,
  Filter,
  FileText,
  Store,
  User,
  LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MonthlyCashFlowChart from './MonthlyCashFlowChart';
import MonthlyCashFlowTable from './MonthlyCashFlowTable';
import AddCashFlowEntryModal from './AddCashFlowEntryModal';

interface MonthlyCashFlowData {
  ano: number;
  mes: number;
  mes_ano: string;
  mes_formatado: string;
  loja: string;
  saldo_inicial: number;
  transferencias_entrada: number;
  transferencias_saida: number;
  receitas: number;
  entradas_sistema: number;
  despesas: number;
  gastos_fixos: number;
  fechamento_sistema: number;
  saldo_do_periodo: number;
  saldo_total_mensal: number;
  total_movimentacoes: number;
  primeira_movimentacao: string;
  ultima_movimentacao: string;
}

interface CashFlowEntry {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  valor: number;
  loja: string;
  criado_em: string;
  criado_por: string;
}

const MonthlyCashFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyCashFlowData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [selectedStore, setSelectedStore] = useState('loja1');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  // 🔐 CREDENCIAIS DE ACESSO
  const CREDENTIALS = {
    username: 'admin',
    password: 'elite2024'
  };

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenciais inválidas');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setError('');
  };

  const loadMonthlyCashFlow = async () => {
    setReportLoading(true);
    try {
      if (!supabaseConfigured) {
        // Mock data for demonstration
        const mockData: MonthlyCashFlowData[] = [
          {
            ano: 2025,
            mes: 1,
            mes_ano: '2025-01',
            mes_formatado: 'Janeiro',
            loja: 'loja1',
            saldo_inicial: 1000.00,
            transferencias_entrada: 500.00,
            transferencias_saida: 200.00,
            receitas: 15000.00,
            entradas_sistema: 8500.00,
            despesas: 3000.00,
            gastos_fixos: 2500.00,
            fechamento_sistema: 1200.00,
            saldo_do_periodo: 17300.00,
            saldo_total_mensal: 18300.00,
            total_movimentacoes: 45,
            primeira_movimentacao: '2025-01-01',
            ultima_movimentacao: '2025-01-31'
          }
        ];
        setMonthlyData(mockData);
        setReportLoading(false);
        return;
      }

      console.log('📊 Carregando fluxo de caixa mensal...');

      const { data, error } = await supabase
        .from('v_fluxo_caixa_mensal')
        .select('*')
        .eq('loja', selectedStore)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .limit(12);

      if (error) throw error;

      console.log(`✅ ${data?.length || 0} registros de fluxo de caixa carregados`);
      setMonthlyData(data || []);

    } catch (err) {
      console.error('❌ Erro ao carregar fluxo de caixa:', err);
      alert('Erro ao carregar dados do fluxo de caixa');
    } finally {
      setReportLoading(false);
    }
  };

  const addCashFlowEntry = async (entry: Omit<CashFlowEntry, 'id' | 'criado_em'>) => {
    try {
      if (!supabaseConfigured) {
        alert('Funcionalidade requer configuração do Supabase');
        return;
      }

      const { data, error } = await supabase
        .from('financeiro_fluxo')
        .insert([{
          ...entry,
          criado_por: 'Sistema PDV'
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Entrada de fluxo de caixa adicionada:', data);
      
      // Recarregar dados
      await loadMonthlyCashFlow();
      
      // Mostrar feedback de sucesso
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Entrada adicionada com sucesso!
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);

    } catch (err) {
      console.error('❌ Erro ao adicionar entrada:', err);
      alert('Erro ao adicionar entrada de fluxo de caixa');
    }
  };

  const exportCSV = () => {
    if (monthlyData.length === 0) return;

    const headers = [
      'Mês',
      'Saldo Inicial',
      'Transferências Entrada',
      'Transferências Saída',
      'Receitas',
      'Entradas Sistema',
      'Despesas',
      'Gastos Fixos',
      'Fechamento Sistema',
      'Saldo do Período',
      'Saldo Total Mensal',
      'Total Movimentações'
    ];

    const rows = monthlyData.map(data => [
      data.mes_formatado,
      formatPrice(data.saldo_inicial),
      formatPrice(data.transferencias_entrada),
      formatPrice(data.transferencias_saida),
      formatPrice(data.receitas),
      formatPrice(data.entradas_sistema),
      formatPrice(data.despesas),
      formatPrice(data.gastos_fixos),
      formatPrice(data.fechamento_sistema),
      formatPrice(data.saldo_do_periodo),
      formatPrice(data.saldo_total_mensal),
      data.total_movimentacoes.toString()
    ]);

    const csvContent = [
      ['Fluxo de Caixa Mensal - Elite Açaí'],
      ['Loja', selectedStore === 'loja1' ? 'Loja 1' : 'Loja 2'],
      ['Gerado em', new Date().toLocaleString('pt-BR')],
      [''],
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fluxo-caixa-mensal-${selectedStore}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMonthlyCashFlow();
    }
  }, [isAuthenticated, selectedStore]);

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full p-4 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp size={36} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Fluxo de Caixa Mensal</h1>
            <p className="text-gray-600">Elite Açaí - Acesso Restrito</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </>
              ) : (
                'Acessar Fluxo de Caixa'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Credenciais: admin / elite2024
            </p>
            <button
              onClick={() => navigate('/pdv')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              ← Voltar ao PDV
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Fluxo de Caixa Mensal</h1>
                <p className="text-gray-600">Elite Açaí - Análise Financeira Consolidada</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <Store size={18} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {selectedStore === 'loja1' ? 'Loja 1' : 'Loja 2'}
                </span>
              </div>
              
              <button
                onClick={() => navigate('/pdv')}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                PDV
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Configuration Warning */}
      {!supabaseConfigured && (
        <div className="max-w-7xl mx-auto px-4 mt-6 print:hidden">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertTriangle size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Modo Demonstração</h3>
                <p className="text-yellow-700 text-sm">
                  Supabase não configurado. Exibindo dados de demonstração.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 print:hidden">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loja
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="loja1">Loja 1</option>
                <option value="loja2">Loja 2</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visualização
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'table'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText size={16} />
                  Tabela
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    viewMode === 'chart'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 size={16} />
                  Gráfico
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddEntry(true)}
                disabled={!supabaseConfigured}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Entrada
              </button>
              
              <button
                onClick={loadMonthlyCashFlow}
                disabled={reportLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} className={reportLoading ? 'animate-spin' : ''} />
                Atualizar
              </button>
              
              <button
                onClick={exportCSV}
                disabled={monthlyData.length === 0}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Exportar
              </button>
              
              <button
                onClick={handlePrint}
                disabled={monthlyData.length === 0}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Printer size={16} />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {reportLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando fluxo de caixa...</p>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Nenhum dado encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Não há movimentações de fluxo de caixa para a loja selecionada.
            </p>
            {supabaseConfigured && (
              <button
                onClick={() => setShowAddEntry(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Adicionar Primeira Entrada
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <MonthlyCashFlowTable data={monthlyData} />
            ) : (
              <MonthlyCashFlowChart data={monthlyData} />
            )}
          </>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <AddCashFlowEntryModal
          isOpen={showAddEntry}
          onClose={() => setShowAddEntry(false)}
          onSave={addCashFlowEntry}
          selectedStore={selectedStore}
        />
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: #fff;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f2f2f2;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyCashFlowPage;