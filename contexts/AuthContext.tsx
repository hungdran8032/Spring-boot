'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { authService, Auth, Login, Register } from '@/lib/auth-service';

interface AuthContextType {
  user: Auth | null;
  login: (data: Login) => Promise<void>;
  register: (data: Register) => Promise<void>;
  logout: () => void;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Auth | null>(null);

  const login = async (data: Login) => {
    // Chỉnh sửa: không cần truy cập .data
    const authData = await authService.login(data);
    setUser(authData); // Chỉ cần set trực tiếp
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);
  };

  const register = async (data: Register) => {
    // Chỉnh sửa: không cần truy cập .data
    const authData = await authService.register(data);
    setUser(authData); // Chỉ cần set trực tiếp
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const googleLogin = () => {
    const googleLoginUrl = authService.loginGoogle();
    if (typeof googleLoginUrl === 'string') {
      window.location.href = googleLoginUrl;
    } else {
      console.error('Google login URL is invalid.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
