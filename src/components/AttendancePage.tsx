import React from 'react';
import { useNavigate } from 'react-router-dom';
import AttendanceLogin from './Orders/AttendanceLogin';
import UnifiedAttendancePage from './UnifiedAttendancePage';
import { useAttendance } from '../hooks/useAttendance';
import { supabase } from '../lib/supabase';
import { PDVOperator } from '../types/pdv';

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { session, login, logout } = useAttendance();
  const [pdvOperator, setPdvOperator] = React.useState<PDVOperator | null>(null);

  // Fetch the ADMIN operator from pdv_operators table
  React.useEffect(() => {
    const fetchPdvOperator = async () => {
      try {
        const { data, error } = await supabase
          .from('pdv_operators')
          .select('*')
          .eq('code', 'ADMIN')
          .single();

        if (error) {
          console.error('❌ Error fetching PDV operator:', error);
          return;
        }

        if (data) {
          setPdvOperator(data);
          console.log('✅ PDV operator fetched:', data);
        }
      } catch (error) {
        console.error('❌ Error in fetchPdvOperator:', error);
      }
    };

    if (session.isAuthenticated) {
      fetchPdvOperator();
    }
  }, [session.isAuthenticated]);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 AttendancePage - Session state:', {
      isAuthenticated: session.isAuthenticated,
      user: session.user ? {
        username: session.user.username,
        name: session.user.name,
        role: session.user.role,
        permissions: Object.keys(session.user.permissions).filter(key => 
          session.user.permissions[key as keyof typeof session.user.permissions]
        )
      } : 'No user'
    });
  }, [session]);

  // Debug logging adicional
  React.useEffect(() => {
    console.log('🔍 AttendancePage - Dados completos:', {
      session,
      isAuthenticated: session.isAuthenticated,
      hasUser: !!session.user,
      userDetails: session.user
    });
  }, [session]);

  // Se o atendente está logado, mostrar painel de atendimento
  if (session.isAuthenticated) {
    console.log('✅ Usuário autenticado, renderizando UnifiedAttendancePage');
    
    // Wait for PDV operator to be loaded
    if (!pdvOperator) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando operador...</p>
          </div>
        </div>
      );
    }

    return (
      <UnifiedAttendancePage 
        operator={pdvOperator}
        onLogout={logout}
      />
    );
  }

  console.log('❌ Usuário não autenticado, renderizando AttendanceLogin');
  // Se não está logado, mostrar tela de login
  return (
    <AttendanceLogin 
      onLogin={(username, password) => {
        console.log('🔐 Tentativa de login via AttendanceLogin:', { username });
        const success = login(username, password);
        console.log('🔐 Resultado do login:', success);
        
        // Forçar recarregamento dos usuários após login bem-sucedido
        if (success) {
          console.log('🔄 Login bem-sucedido, recarregando usuários...');
          // Pequeno delay para garantir que o estado foi atualizado
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
        
        return success;
      }} 
    />
  );
};

export default AttendancePage;