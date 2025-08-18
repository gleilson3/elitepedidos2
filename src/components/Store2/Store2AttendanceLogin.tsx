import React, { useState } from 'react';
import '../../index.css';
import { User, Lock, Eye, EyeOff, LogIn, Store } from 'lucide-react';

interface Store2AttendanceLoginProps {
  onLogin: (username: string, password: string) => boolean;
}

const Store2AttendanceLogin: React.FC<Store2AttendanceLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔐 Tentando fazer login com:', { username, password: password ? '***' : 'vazio' });

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = await onLogin(username, password);
    
    if (!success) {
      console.log('❌ Login falhou para usuário:', username);
      setError('Credenciais inválidas');
    } else {
      console.log('✅ Login bem-sucedido para usuário:', username);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full p-4 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Store size={36} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loja 2 - Atendimento</h1>
          <p className="text-gray-600">Elite Açaí - Unidade 2</p>
          <p className="text-sm text-blue-600 mt-2">Rua Dois, 2130‑A – Residencial 1 – Cágado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                Acessar Loja 2
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
};

export default Store2AttendanceLogin;