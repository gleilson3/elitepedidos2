import React, { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface PermissionGuardProps {
  children: ReactNode;
  hasPermission: boolean;
  fallbackPath?: string;
  showMessage?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  hasPermission,
  fallbackPath = '/acesso-negado',
  showMessage = false,
}) => {
  const navigate = useNavigate();

  // Debug logging
  console.log('🛡️ PermissionGuard check:', { hasPermission, showMessage });

  // 1) Se tem permissão explícita, libera imediatamente
  if (hasPermission) {
    console.log('✅ Permission granted');
    return <>{children}</>;
  }

  // 2) Bypass em desenvolvimento
  const isDevelopment = import.meta.env.DEV || 
                       import.meta.env.MODE === 'development' ||
                       window.location.hostname === 'localhost';

  // 3) Bypass para admin (via localStorage.pdv_operator)
  let isAdmin = false;
  try {
    if (typeof window !== 'undefined') {
      // Check both pdv_operator and attendance_session
      const storedOperator = localStorage.getItem('pdv_operator') || 
                            localStorage.getItem('attendance_session');
      if (storedOperator) {
        const operator = JSON.parse(storedOperator);
        
        // Check if it's a session object with user property
        const user = operator.user || operator;
        
        const code = String(user?.code || '').toUpperCase();
        const name = String(user?.name || '').toUpperCase();
        const username = String(user?.username || '').toUpperCase();
        const role = String(user?.role || '').toUpperCase();
        
        isAdmin = code === 'ADMIN' || 
                  name.includes('ADMIN') || 
                  name === 'ADMINISTRADOR' ||
                  username === 'ADMIN' ||
                  username.includes('ADMIN') ||
                 role === 'ADMIN' ||
                 name.toLowerCase().includes('administrador') ||
                 username.toLowerCase().includes('administrador');
                  
        console.log('🔍 Admin check from localStorage:', {
          user: user ? {
            username: user.username,
            name: user.name,
            code: user.code,
            role: user.role
          } : 'No user',
          isAdmin
        });
      }
    }
  } catch (err) {
    console.error('Erro ao verificar admin no localStorage:', err);
  }

  if (isDevelopment || isAdmin) {
    console.log('✅ Access granted via development mode or admin status');
    return <>{children}</>;
  }

  console.log('❌ Access denied, showing fallback');
  
  // 4) Sem permissão -> mensagem amigável OU redirect
  if (showMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página. Entre em contato com o administrador para obter acesso.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <Navigate to={fallbackPath} replace />;
};

export default PermissionGuard;
