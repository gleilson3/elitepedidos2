import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { 
  BarChart3, 
  ArrowLeft, 
  FileText, 
  Calendar,
  DollarSign,
  Store,
  TrendingUp
} from 'lucide-react';
import PDV2DailyCashReport from '../PDV2/PDV2DailyCashReport';
import PDV2CashReportWithDetails from '../PDV2/PDV2CashReportWithDetails';
import PDV2CashReportWithDateFilter from '../PDV2/PDV2CashReportWithDateFilter';
import Store2SalesReport from './Store2SalesReport';

const Store2ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState<'daily' | 'details' | 'period' | 'sales'>('daily');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔐 CREDENCIAIS DE ACESSO - MODIFIQUE AQUI
  const CREDENTIALS = {
    username: 'admin_loja2',     // ← ALTERE O USUÁRIO AQUI
    password: 'senha_segura_123' // ← ALTERE A SENHA AQUI
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular delay de autenticação
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

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full p-4 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 size={36} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatórios - Loja 2</h1>
            <p className="text-gray-600">Elite Açaí - Acesso Restrito</p>
            <p className="text-sm text-blue-600 mt-2">Rua Dois, 2130‑A – Residencial 1 – Cágado</p>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-1" />
                  Acessar Relatórios
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Credenciais: admin_loja2 / senha_segura_123
            </p>
            <button
              onClick={() => navigate('/atendimento2')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Voltar ao Atendimento
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reports = [
    {
      id: 'daily' as const,
      label: 'Relatório Diário',
      icon: Calendar,
      color: 'bg-teal-600',
      description: 'Resumo das movimentações do dia'
    },
    {
      id: 'details' as const,
      label: 'Histórico Detalhado',
      icon: FileText,
      color: 'bg-indigo-600',
      description: 'Lista expandível de todos os registros'
    },
    {
      id: 'period' as const,
      label: 'Relatório por Período',
      icon: TrendingUp,
      color: 'bg-emerald-600',
      description: 'Análise consolidada por período'
    },
    {
      id: 'sales' as const,
      label: 'Relatório de Vendas',
      icon: BarChart3,
      color: 'bg-purple-600',
      description: 'Análise de vendas e produtos'
    }
  ];

  const renderReport = () => {
    switch (activeReport) {
      case 'daily':
        return <PDV2DailyCashReport />;
      case 'details':
        return <PDV2CashReportWithDetails />;
      case 'period':
        return <PDV2CashReportWithDateFilter />;
      case 'sales':
        return <Store2SalesReport />;
      default:
        return <PDV2DailyCashReport />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Relatórios - Loja 2</h1>
                <p className="text-gray-600">Elite Açaí - Unidade 2 (Rua Dois, 2130-A)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Store size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Loja 2</span>
              </div>
              
              <button
                onClick={() => navigate('/atendimento2')}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                title="Voltar ao atendimento"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                title="Sair dos relatórios"
              >
                <LogIn size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={20} className="text-gray-600" />
              Relatórios da Loja 2
            </h2>
            <div className="text-sm text-gray-500">
              Dados exclusivos da Loja 2
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              const isActive = activeReport === report.id;
              
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isActive
                      ? `${report.color} text-white border-transparent shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-full p-2 ${
                      isActive ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <h3 className="font-semibold">{report.label}</h3>
                  </div>
                  <p className={`text-sm ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {report.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Content */}
        <div className="transition-all duration-300">
          {renderReport()}
        </div>
      </div>
    </div>
  );
};

export default Store2ReportsPage;