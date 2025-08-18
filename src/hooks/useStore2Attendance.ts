import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface Store2User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'attendant' | 'admin';
  isActive: boolean;
  permissions: {
    can_view_orders: boolean;
    can_update_status: boolean;
    can_chat: boolean;
    can_create_manual_orders: boolean;
    can_print_orders: boolean;
  };
  created_at: string;
  last_login?: string;
}

interface Store2Session {
  isAuthenticated: boolean;
  user?: Store2User;
}

export const useStore2Attendance = () => {
  const [session, setSession] = useState<Store2Session>(() => {
    // Try to restore session from localStorage
    try {
      const stored = localStorage.getItem('store2_attendance_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (error) {
      console.error('Error restoring Store2 attendance session:', error);
    }
    return { isAuthenticated: false };
  });

  // Default users for Store 2 (fallback if database is not available)
  const users = useMemo(() => [{
    id: '1',
    username: 'loja2',
    password: 'elite2024',
    name: 'Administrador Loja 2',
    role: 'admin' as const,
    isActive: true,
    permissions: {
      can_view_orders: false, // Loja 2 não tem delivery
      can_update_status: false,
      can_chat: false,
      can_create_manual_orders: false,
      can_print_orders: true
    },
    created_at: new Date().toISOString()
  }], []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Store2 - Tentando login com:', { username, password: password ? '***' : 'vazio' });

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const isSupabaseConfigured = supabaseUrl && supabaseKey && 
                                  supabaseUrl !== 'your_supabase_url_here' && 
                                  supabaseKey !== 'your_supabase_anon_key_here' &&
                                  !supabaseUrl.includes('placeholder');

      if (isSupabaseConfigured) {
        try {
          console.log('🔍 Store2 - Buscando usuário no banco de dados...');
          
          // First, try to get the user from attendance_users table
          const { data: user, error: fetchError } = await supabase
            .from('attendance_users')
            .select('*')
            .eq('username', username.trim())
            .eq('is_active', true)
            .single();

          if (fetchError) {
            console.log('⚠️ Store2 - Usuário não encontrado no banco:', fetchError.message);
          } else if (user) {
            console.log('✅ Store2 - Usuário encontrado no banco:', user.username);
            
            // Verify password using the database function
            const { data: authData, error: authError } = await supabase.rpc(
              'verify_attendance_user_password',
              {
                user_username: username.trim(),
                password_to_check: password
              }
            );

            if (authError) {
              console.error('❌ Store2 - Erro na verificação de senha:', authError);
            } else if (authData) {
              console.log('✅ Store2 - Senha verificada com sucesso');
              
              // Update last login
              await supabase
                .from('attendance_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);

              // Convert database user to Store2User format
              const store2User: Store2User = {
                id: user.id,
                username: user.username,
                password: '', // Don't store password in session
                name: user.name,
                role: user.role === 'admin' ? 'admin' : 'attendant',
                isActive: user.is_active,
                permissions: {
                  can_view_orders: false, // Loja 2 não tem delivery
                  can_update_status: false,
                  can_chat: false,
                  can_create_manual_orders: false,
                  can_print_orders: user.permissions?.can_print_orders || true
                },
                created_at: user.created_at,
                last_login: user.last_login
              };

              const newSession = { isAuthenticated: true, user: store2User };
              setSession(newSession);
              localStorage.setItem('store2_attendance_session', JSON.stringify(newSession));
              
              console.log('✅ Store2 - Login realizado com usuário do banco de dados');
              return true;
            } else {
              console.log('❌ Store2 - Senha incorreta para usuário do banco');
            }
          }
        } catch (dbError) {
          console.warn('⚠️ Store2 - Erro ao acessar banco de dados:', dbError);
        }
      }

      // Fallback to hardcoded users if database is not available or user not found
      console.log('🔄 Store2 - Tentando com usuários hardcoded...');
      const user = users.find(u => u.username === username && u.password === password && u.isActive);
      
      if (user) {
        const newSession = { isAuthenticated: true, user };
        setSession(newSession);
        localStorage.setItem('store2_attendance_session', JSON.stringify(newSession));
        console.log('✅ Store2 - Login realizado com usuário hardcoded');
        return true;
      }

      console.log('❌ Store2 - Credenciais inválidas');
      throw new Error('Credenciais inválidas');
    } catch (error) {
      console.error('❌ Store2 - Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Store2 - Logout realizado');
    setSession({ isAuthenticated: false });
    localStorage.removeItem('store2_attendance_session');
  };

  return {
    session,
    login,
    logout,
    users
  };
};