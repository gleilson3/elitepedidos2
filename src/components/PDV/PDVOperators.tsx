import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Edit3, Trash2, Search, Eye, EyeOff, Lock, Save, User, AlertCircle, X } from 'lucide-react';

interface PDVOperator {
  id: string;
  name: string;
  code: string;
  password_hash: string;
  is_active: boolean;
  permissions: {
    can_cancel: boolean;
    can_discount: boolean;
    can_use_scale: boolean;
    can_view_sales: boolean;
    can_view_orders: boolean;
    can_view_reports: boolean;
    can_view_products: boolean;
    can_view_operators: boolean;
    can_manage_products: boolean;
    can_manage_settings: boolean;
    can_view_attendance: boolean;
    can_view_cash_report: boolean;
    can_view_sales_report: boolean;
    can_view_cash_register: boolean;
    can_view_expected_balance: boolean;
  };
  created_at: string;
  updated_at: string;
  last_login?: string;
}

const PDVOperators: React.FC = () => {
  const [operators, setOperators] = useState<PDVOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOperator, setEditingOperator] = useState<PDVOperator | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabaseConfigured) {
        console.warn('⚠️ Supabase não configurado - usando dados de demonstração');
        
        // Dados de demonstração
        const demoOperators: PDVOperator[] = [
          {
            id: '1',
            name: 'Administrador',
            code: 'ADMIN',
            password_hash: 'elite2024',
            is_active: true,
            permissions: {
              can_cancel: true,
              can_discount: true,
              can_use_scale: true,
              can_view_sales: true,
              can_view_orders: true,
              can_view_reports: true,
              can_view_products: true,
              can_view_operators: true,
              can_manage_products: true,
              can_manage_settings: true,
              can_view_attendance: true,
              can_view_cash_report: true,
              can_view_sales_report: true,
              can_view_cash_register: true,
              can_view_expected_balance: true
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setOperators(demoOperators);
        setLoading(false);
        return;
      }

      console.log('🔄 Carregando operadores do banco...');
      
      const { data, error } = await supabase
        .from('pdv_operators')
        .select('*')
        .order('name');

      if (error) throw error;

      console.log(`✅ ${data?.length || 0} operadores carregados`);
      setOperators(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar operadores:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar operadores');
    } finally {
      setLoading(false);
    }
  };

  const createOperator = async (operatorData: Omit<PDVOperator, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!supabaseConfigured) {
        // Fallback para localStorage se Supabase não configurado
        const newOperator: PDVOperator = {
          ...operatorData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setOperators(prev => [...prev, newOperator]);
        return newOperator;
      }

      console.log('🚀 Criando operador no banco:', operatorData.name);

      const { data, error } = await supabase
        .from('pdv_operators')
        .insert([operatorData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Operador criado:', data);
      setOperators(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar operador:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar operador');
    }
  };

  const updateOperator = async (id: string, updates: Partial<PDVOperator>) => {
    try {
      if (!supabaseConfigured) {
        // Fallback para localStorage se Supabase não configurado
        setOperators(prev => prev.map(op => 
          op.id === id ? { ...op, ...updates, updated_at: new Date().toISOString() } : op
        ));
        return;
      }

      console.log('✏️ Atualizando operador:', id);

      const { data, error } = await supabase
        .from('pdv_operators')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Operador atualizado:', data);
      setOperators(prev => prev.map(op => op.id === id ? data : op));
      return data;
    } catch (err) {
      console.error('❌ Erro ao atualizar operador:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar operador');
    }
  };

  const deleteOperator = async (id: string) => {
    try {
      if (!supabaseConfigured) {
        // Fallback para localStorage se Supabase não configurado
        setOperators(prev => prev.filter(op => op.id !== id));
        return;
      }

      console.log('🗑️ Excluindo operador:', id);

      const { error } = await supabase
        .from('pdv_operators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Operador excluído');
      setOperators(prev => prev.filter(op => op.id !== id));
    } catch (err) {
      console.error('❌ Erro ao excluir operador:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir operador');
    }
  };

  const filteredOperators = searchTerm
    ? operators.filter(operator => 
        operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : operators;

  const handleCreate = () => {
    setEditingOperator({
      id: '',
      name: '',
      code: '',
      password_hash: '',
      is_active: true,
      permissions: {
        can_cancel: false,
        can_discount: false,
        can_use_scale: false,
        can_view_sales: true,
        can_view_orders: false,
        can_view_reports: false,
        can_view_products: true,
        can_view_operators: false,
        can_manage_products: false,
        can_manage_settings: false,
        can_view_attendance: false,
        can_view_cash_report: false,
        can_view_sales_report: false,
        can_view_cash_register: false,
        can_view_expected_balance: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingOperator) return;

    if (!editingOperator.name.trim() || !editingOperator.code.trim()) {
      alert('Nome e código são obrigatórios');
      return;
    }

    if (isCreating && !editingOperator.password_hash.trim()) {
      alert('Senha é obrigatória para novos operadores');
      return;
    }

    // Verificar se código já existe
    const existingOperator = operators.find(op => 
      op.code.toUpperCase() === editingOperator.code.toUpperCase() && op.id !== editingOperator.id
    );
    if (existingOperator) {
      alert('Código já existe. Use um código diferente.');
      return;
    }

    setSaving(true);
    
    try {
      if (isCreating) {
        const { id, created_at, updated_at, ...operatorData } = editingOperator;
        await createOperator({
          ...operatorData,
          code: operatorData.code.toUpperCase()
        });
      } else {
        await updateOperator(editingOperator.id, {
          ...editingOperator,
          code: editingOperator.code.toUpperCase()
        });
      }
      
      setEditingOperator(null);
      setIsCreating(false);
      
      // Mostrar feedback de sucesso
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Operador ${isCreating ? 'criado' : 'atualizado'} com sucesso!
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar operador:', error);
      alert(`Erro ao salvar operador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === '1' || operators.find(op => op.id === id)?.code === 'ADMIN') {
      alert('Não é possível excluir o operador administrador');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o operador "${name}"?`)) {
      try {
        await deleteOperator(id);
      } catch (error) {
        console.error('Erro ao excluir operador:', error);
        alert('Erro ao excluir operador');
      }
    }
  };

  const handleToggleActive = async (operator: PDVOperator) => {
    if (operator.code === 'ADMIN') {
      alert('Não é possível desativar o operador administrador');
      return;
    }

    try {
      await updateOperator(operator.id, { is_active: !operator.is_active });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando operadores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Supabase Configuration Warning */}
      {!supabaseConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Modo Demonstração</h3>
              <p className="text-yellow-700 text-sm">
                Supabase não configurado. Funcionalidades limitadas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Gerenciar Operadores - Loja 1
          </h2>
          <p className="text-gray-600">Configure operadores e suas permissões do PDV</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Operador
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar operadores..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Operators Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Operador</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Código</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Permissões</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Último Acesso</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOperators.map((operator) => (
                <tr key={operator.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-800">{operator.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {operator.code}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {operator.permissions?.can_view_sales && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Vendas
                        </span>
                      )}
                      {operator.permissions?.can_view_cash_register && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Caixa
                        </span>
                      )}
                      {operator.permissions?.can_discount && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Desconto
                        </span>
                      )}
                      {operator.permissions?.can_cancel && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Cancelar
                        </span>
                      )}
                      {operator.code === 'ADMIN' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(operator)}
                      disabled={operator.code === 'ADMIN'}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        operator.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } ${operator.code === 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {operator.is_active ? (
                        <>
                          <Eye size={12} />
                          Ativo
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          Inativo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-500">
                      {operator.last_login 
                        ? new Date(operator.last_login).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingOperator(operator);
                          setIsCreating(false);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar operador"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(operator.id, operator.name)}
                        disabled={operator.code === 'ADMIN'}
                        className={`p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors ${
                          operator.code === 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Excluir operador"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOperators.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum operador encontrado' : 'Nenhum operador cadastrado'}
            </p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingOperator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isCreating ? 'Novo Operador' : 'Editar Operador'}
                </h2>
                <button
                  onClick={() => {
                    setEditingOperator(null);
                    setIsCreating(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Operador *
                </label>
                <input
                  type="text"
                  value={editingOperator.name}
                  onChange={(e) => setEditingOperator({
                    ...editingOperator,
                    name: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: João Silva"
                />
              </div>

              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Acesso *
                </label>
                <input
                  type="text"
                  value={editingOperator.code}
                  onChange={(e) => setEditingOperator({
                    ...editingOperator,
                    code: e.target.value.toUpperCase()
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: OP001"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {isCreating ? '*' : '(deixe em branco para manter a atual)'}
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={editingOperator.password_hash}
                    onChange={(e) => setEditingOperator({
                      ...editingOperator,
                      password_hash: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={isCreating ? "Senha" : "Nova senha (opcional)"}
                  />
                </div>
              </div>

              {/* Permissões */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões do Sistema
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_view_sales || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_view_sales: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Visualizar vendas</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_view_cash_register || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_view_cash_register: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Acessar caixa</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_discount || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_discount: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Aplicar descontos</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_cancel || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_cancel: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Cancelar vendas</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_use_scale || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_use_scale: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Usar balança</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_view_reports || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_view_reports: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Ver relatórios</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_manage_products || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_manage_products: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Gerenciar produtos</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingOperator.permissions?.can_view_operators || false}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        permissions: {
                          ...editingOperator.permissions,
                          can_view_operators: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Ver operadores</span>
                  </label>
                </div>
              </div>

              {/* Status Ativo */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingOperator.is_active}
                    onChange={(e) => setEditingOperator({
                      ...editingOperator,
                      is_active: e.target.checked
                    })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Operador ativo
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingOperator(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingOperator.name.trim() || !editingOperator.code.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isCreating ? 'Criar Operador' : 'Salvar Alterações'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDVOperators;