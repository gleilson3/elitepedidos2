import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AttendanceUser {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: 'attendant' | 'admin';
  is_active: boolean;
  permissions: {
    can_chat: boolean;
    can_view_orders: boolean;
    can_print_orders: boolean;
    can_update_status: boolean;
    can_create_manual_orders: boolean;
    can_view_cash_register: boolean;
    can_view_sales: boolean;
    can_view_reports: boolean;
    can_view_cash_report: boolean;
    can_view_sales_report: boolean;
    can_manage_products: boolean;
    can_view_operators: boolean;
    can_view_attendance: boolean;
    can_manage_settings: boolean;
    can_use_scale: boolean;
    can_discount: boolean;
    can_cancel: boolean;
    can_view_expected_balance: boolean;
  };
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface AttendanceSession {
  isAuthenticated: boolean;
  user?: AttendanceUser;
}

export const useAttendance = () => {
  const [session, setSession] = useState<AttendanceSession>(() => {
    try {
      const storedSession = localStorage.getItem('attendance_session');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        console.log('🔍 useAttendance - Sessão recuperada do localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      localStorage.removeItem('attendance_session');
    }
    return { isAuthenticated: false };
  });

  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Credenciais padrão
  const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: 'elite2024'
  };

  // Usuários padrão
  const DEFAULT_USERS: AttendanceUser[] = [
    {
      id: '1',
      username: 'admin',
      password_hash: 'elite2024',
      name: 'Administrador',
      role: 'admin',
      is_active: true,
      permissions: {
        can_chat: true,
        can_view_orders: true,
        can_print_orders: true,
        can_update_status: true,
        can_create_manual_orders: true,
        can_view_cash_register: true,
        can_view_sales: true,
        can_view_reports: true,
        can_view_cash_report: true,
        can_view_sales_report: true,
        can_manage_products: true,
        can_view_operators: true,
        can_view_attendance: true,
        can_manage_settings: true,
        can_use_scale: true,
        can_discount: true,
        can_cancel: true,
        can_view_expected_balance: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Carregar usuários
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar se Supabase está configurado
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const isSupabaseConfigured = supabaseUrl && supabaseKey && 
                                  supabaseUrl !== 'your_supabase_url_here' && 
                                  supabaseKey !== 'your_supabase_anon_key_here' &&
                                  !supabaseUrl.includes('placeholder');

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase não configurado - usando localStorage');
        loadUsersFromLocalStorage();
        return;
      }

      console.log('🔄 Carregando usuários de atendimento do banco...');

      const { data, error } = await supabase
        .from('attendance_users')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        // Fallback para localStorage se houver erro
        loadUsersFromLocalStorage();
        return;
      }

      console.log(`✅ ${data?.length || 0} usuários carregados do banco`);
      setUsers(data || []);

      // Salvar backup no localStorage
      if (data && data.length > 0) {
        localStorage.setItem('attendance_users', JSON.stringify(data));
      }

    } catch (err) {
      console.error('❌ Erro ao carregar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      loadUsersFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários do localStorage
  const loadUsersFromLocalStorage = () => {
    try {
      const savedUsers = localStorage.getItem('attendance_users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        console.log('✅ Usuários carregados do localStorage:', parsedUsers.length);
        setUsers(parsedUsers);
      } else {
        console.log('ℹ️ Nenhum usuário no localStorage, criando usuários padrão');
        setUsers(DEFAULT_USERS);
        localStorage.setItem('attendance_users', JSON.stringify(DEFAULT_USERS));
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      setUsers(DEFAULT_USERS);
    }
  };

  // Criar usuário
  const createUser = async (userData: Omit<AttendanceUser, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Verificar se Supabase está configurado
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const isSupabaseConfigured = supabaseUrl && supabaseKey && 
                                  supabaseUrl !== 'your_supabase_url_here' && 
                                  supabaseKey !== 'your_supabase_anon_key_here' &&
                                  !supabaseUrl.includes('placeholder');

      if (!isSupabaseConfigured) {
        // Fallback para localStorage
        const newUser: AttendanceUser = {
          ...userData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('attendance_users', JSON.stringify(updatedUsers));
        
        console.log('✅ Usuário criado no localStorage:', newUser.username);
        return newUser;
      }

      console.log('🚀 Criando usuário no banco:', userData.username);

      const { data, error } = await supabase
        .from('attendance_users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Usuário criado no banco:', data);
      
      // Atualizar lista local
      setUsers(prev => [...prev, data]);
      
      // Atualizar localStorage
      const updatedUsers = [...users, data];
      localStorage.setItem('attendance_users', JSON.stringify(updatedUsers));

      return data;
    } catch (err) {
      console.error('❌ Erro ao criar usuário:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  // Atualizar usuário
  const updateUser = async (id: string, updates: Partial<AttendanceUser>) => {
    try {
      // Verificar se Supabase está configurado
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const isSupabaseConfigured = supabaseUrl && supabaseKey && 
                                  supabaseUrl !== 'your_supabase_url_here' && 
                                  supabaseKey !== 'your_supabase_anon_key_here' &&
                                  !supabaseUrl.includes('placeholder');

      if (!isSupabaseConfigured) {
        // Fallback para localStorage
        const updatedUsers = users.map(user => 
          user.id === id 
            ? { ...user, ...updates, updated_at: new Date().toISOString() }
            : user
        );
        setUsers(updatedUsers);
        localStorage.setItem('attendance_users', JSON.stringify(updatedUsers));
        
        console.log('✅ Usuário atualizado no localStorage:', id);
        return;
      }

      console.log('✏️ Atualizando usuário no banco:', id);

      const { data, error } = await supabase
        .from('attendance_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Usuário atualizado no banco:', data);
      
      // Atualizar lista local
      setUsers(prev => prev.map(user => user.id === id ? data : user));
      
      // Atualizar localStorage
      const updatedUsers = users.map(user => user.id === id ? data : user);
      localStorage.setItem('attendance_users', JSON.stringify(updatedUsers));

      return data;
    } catch (err) {
      console.error('❌ Erro ao atualizar usuário:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    }
  };

  // Excluir usuário
  const deleteUser = async (id: string) => {
    try {
      // Verificar se Supabase está configurado
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const isSupabaseConfigured = supabaseUrl && supabaseKey && 
                                  supabaseUrl !== 'your_supabase_url_here' && 
                                  supabaseKey !== 'your_supabase_anon_key_here' &&
                                  !supabaseUrl.includes('placeholder');

      if (!isSupabaseConfigured) {
        // Fallback para localStorage
        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);
        localStorage.setItem('attendance_users', JSON.stringify(updatedUsers));
        
        console.log('✅ Usuário excluído do localStorage:', id);
        return;
      }

      console.log('🗑️ Excluindo usuário do banco:', id);

      const { error } = await supabase
        .from('attendance_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Usuário excluído do banco');
      
      // Atualizar lista local
      setUsers(prev => prev.filter(user => user.id !== id));
      
      // Atualizar localStorage
      const updatedUsers = users.filter(user => user.id !== id);
      localStorage.setItem('attendance_users', JSON.stringify(updatedUsers));

    } catch (err) {
      console.error('❌ Erro ao excluir usuário:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir usuário');
    }
  };

  // Login
  const login = (username: string, password: string): boolean => {
    console.log('🔐 useAttendance - Tentativa de login:', { username, password: password ? '***' : 'vazio' });
    
    // Verificar credenciais padrão primeiro
    if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
      const adminUser = users.find(u => u.username === username) || DEFAULT_USERS[0];
      
      const newSession = {
        isAuthenticated: true,
        user: adminUser
      };
      
      setSession(newSession);
      localStorage.setItem('attendance_session', JSON.stringify(newSession));
      
      console.log('✅ useAttendance - Login bem-sucedido (credenciais padrão)');
      return true;
    }

    // Verificar usuários cadastrados
    const user = users.find(u => 
      u.username === username && 
      u.password_hash === password && 
      u.is_active
    );

    if (user) {
      const newSession = {
        isAuthenticated: true,
        user
      };
      
      setSession(newSession);
      localStorage.setItem('attendance_session', JSON.stringify(newSession));
      
      console.log('✅ useAttendance - Login bem-sucedido (usuário cadastrado):', user.username);
      return true;
    }

    console.log('❌ useAttendance - Login falhou para:', username);
    return false;
  };

  // Logout
  const logout = () => {
    console.log('🚪 useAttendance - Logout');
    setSession({ isAuthenticated: false });
    localStorage.removeItem('attendance_session');
  };

  // Carregar usuários quando o hook for inicializado
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    session,
    users,
    loading,
    error,
    login,
    logout,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};