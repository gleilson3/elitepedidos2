import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { 
  Settings, 
  ArrowLeft, 
  Users, 
  Package,
  Store,
  Clock,
  Tag,
  Printer,
  BarChart3
} from 'lucide-react';
import Store2UsersManager from './Store2UsersManager';
import Store2Settings from './Store2Settings';
import Store2ProductsManager from './Store2ProductsManager';

const Store2ManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'settings' | 'reports'>('users');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔐 CREDENCIAIS DE ACESSO - MODIFIQUE AQUI
  const CREDENTIALS = {
    username: 'admin_loja2',     // ← ALTERE O USUÁRIO AQUI
    password: 'config_loja2_123' // ← ALTERE A SENHA AQUI
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-purple-100 rounded-full p-4 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Settings size={36} className="text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento - Loja 2</h1>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-1" />
                  Acessar Gerenciamento
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Credenciais: admin_loja2 / config_loja2_123
            </p>
            <button
              onClick={() => navigate('/atendimento2')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Voltar ao Atendimento
            </button>
          </div>
        </div>
      </div>
    );
  }

  const managementTabs = [
    {
      id: 'users' as const,
      label: 'Usuários',
      icon: Users,
      color: 'bg-blue-600',
      description: 'Gerenciar usuários e permissões'
    },
    {
      id: 'products' as const,
      label: 'Produtos',
      icon: Package,
      color: 'bg-green-600',
      description: 'Catálogo de produtos da Loja 2'
    },
    {
      id: 'settings' as const,
      label: 'Configurações',
      icon: Settings,
      color: 'bg-purple-600',
      description: 'Loja, impressora e balança'
    },
    {
      id: 'reports' as const,
      label: 'Relatórios',
      icon: BarChart3,
      color: 'bg-indigo-600',
      description: 'Relatórios de caixa e vendas'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <Store2UsersManager />;
      case 'products':
        return <Store2ProductsManager />;
      case 'settings':
        return <Store2Settings />;
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={24} className="text-indigo-600" />
                Relatórios da Loja 2
              </h2>
              <p className="text-gray-600 mb-6">
                Acesse os relatórios específicos da Loja 2 para análise detalhada das operações.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <BarChart3 size={20} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-800">Relatórios de Caixa</h3>
                  </div>
                  <p className="text-blue-700 text-sm mb-4">
                    Acesse relatórios detalhados de movimentações de caixa, vendas e análises financeiras da Loja 2.
                  </p>
                  <button
                    onClick={() => window.location.href = '/relatorios_loja2'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Acessar Relatórios
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <Settings size={20} className="text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Configurações Avançadas</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    Configure horários de funcionamento, impressora e outras configurações específicas da Loja 2.
                  </p>
                  <div className="text-center">
                    <span className="text-sm text-gray-500">
                      Disponível na aba "Configurações" acima
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <BarChart3 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Tipos de Relatórios Disponíveis</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• <strong>Relatório Diário:</strong> Resumo das movimentações do dia</li>
                      <li>• <strong>Histórico Detalhado:</strong> Lista expandível de todos os registros</li>
                      <li>• <strong>Relatório por Período:</strong> Análise consolidada por período</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Store2UsersManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Settings size={24} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gerenciamento - Loja 2</h1>
                <p className="text-gray-600">Elite Açaí - Unidade 2 (Rua Dois, 2130-A)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                <Store size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Loja 2</span>
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
                title="Sair do gerenciamento"
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
              <Settings size={20} className="text-gray-600" />
              Painel de Gerenciamento
            </h2>
            <div className="text-sm text-gray-500">
              Configurações exclusivas da Loja 2
            </div>
          </div>
          
            {managementTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isActive
                      ? `${tab.color} text-white border-transparent shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-full p-2 ${
                      isActive ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <h3 className="font-semibold">{tab.label}</h3>
                  </div>
                  <p className={`text-sm ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </p>
                </button>
              );
            })}
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Store2ManagementPage;