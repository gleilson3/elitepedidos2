import { useState, useCallback } from 'react';
import { AdminSession } from '../types/product';

const ADMIN_CREDENTIALS = {
  username: 'admin', 
  password: 'elite2024'
};

export const useAdmin = () => {
  const [session, setSession] = useState<AdminSession>(() => {
    // Tentar recuperar sessão do localStorage
    try {
      const savedSession = localStorage.getItem('admin_session');
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (error) {
      console.error('Erro ao recuperar sessão do admin:', error);
    }
    return { isAuthenticated: false };
  });

  const login = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      console.log('Admin login successful');
      const sessionData = {
        isAuthenticated: true,
        user: {
          id: '1',
          username: ADMIN_CREDENTIALS.username,
          password: '',
          role: 'admin'
        }
      };
      
      // Salvar sessão no localStorage
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      setSession(sessionData);
      return true;
    }
    console.log('Admin login failed');
    return false;
  }, []);

  const logout = useCallback(() => {
    console.log('Admin logout');
    localStorage.removeItem('admin_session');
    setSession({
      isAuthenticated: false
    });
  }, []);

  return {
    session,
    login,
    logout
  };
};