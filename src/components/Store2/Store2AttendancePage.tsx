import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Store2AttendanceLogin from './Store2AttendanceLogin';
import Store2UnifiedAttendancePage from './Store2UnifiedAttendancePage';
import { useStore2Attendance } from '../../hooks/useStore2Attendance';

const Store2AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { session, login, logout } = useStore2Attendance();

  // Se o atendente está logado, mostrar painel de atendimento
  if (session.isAuthenticated) {
    return (
      <Store2UnifiedAttendancePage 
        operator={session.user ? {
          id: session.user.id,
          name: session.user.username,
          code: session.user.username.toUpperCase(),
          permissions: {
            can_discount: true,
            can_cancel: true,
            can_manage_products: true,
            can_view_sales: true,
            can_view_cash_register: true,
            can_view_products: true,
            can_view_orders: false, // Loja 2 não tem delivery
            can_view_reports: true,
            can_view_sales_report: true,
            can_view_cash_report: true,
            can_view_operators: true
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          password_hash: '',
          last_login: null
        } : undefined}
        onLogout={logout}
      />
    );
  }

  // Se não está logado, mostrar tela de login
  return (
    <Store2AttendanceLogin 
      onLogin={async (username, password) => {
        const success = await login(username, password);
        return success;
      }} 
    />
  );
};

export default Store2AttendancePage;