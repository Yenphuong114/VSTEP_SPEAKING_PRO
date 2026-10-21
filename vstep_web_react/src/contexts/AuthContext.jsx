import React, { createContext, useContext, useState } from 'react';
import { loginApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    return sessionStorage.getItem('vstep_role') || null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = sessionStorage.getItem('vstep_role');
    return saved === 'admin' || saved === 'teacher';
  });

  const login = async (password) => {
    const cleanPw = password.trim();

    try {
      const data = await loginApi(cleanPw);
      sessionStorage.setItem('vstep_role', data.role);
      setRole(data.role);
      setIsAuthenticated(true);
      return { success: true, role: data.role };
    } catch (err) {
      // Offline fallback: chỉ dùng đúng mật khẩu trong .env
      if (cleanPw === 'vstep_admin_2025') {
        sessionStorage.setItem('vstep_role', 'admin');
        setRole('admin');
        setIsAuthenticated(true);
        return { success: true, role: 'admin' };
      }
      if (cleanPw === 'vstep_teacher_2025') {
        sessionStorage.setItem('vstep_role', 'teacher');
        setRole('teacher');
        setIsAuthenticated(true);
        return { success: true, role: 'teacher' };
      }

      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('vstep_role');
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
