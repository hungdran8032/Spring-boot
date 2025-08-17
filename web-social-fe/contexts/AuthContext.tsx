
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  authService,
  Auth,
  Login,
  Register,
} from '@/lib/auth-service';
import { UserResponse } from '@/lib/user-service';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (data: Login) => Promise<void>;
  register: (data: Register) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = authService.getToken();
        if (storedToken) {
          setToken(storedToken);
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        await logout(); // Gọi logout nếu không lấy được thông tin user
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (data: Login) => {
    const authData = await authService.login(data);
    setToken(authData.token);
    // Gọi getCurrentUser để lấy thông tin UserResponse sau khi đăng nhập
    const userData = await authService.getCurrentUser();
    setUser(userData);
  };

  const register = async (data: Register) => {
    const authData = await authService.register(data);
    setToken(authData.token);
    // Gọi getCurrentUser để lấy thông tin UserResponse sau khi đăng ký
    const userData = await authService.getCurrentUser();
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const googleLogin = () => {
    authService.loginGoogle(); // Gọi trực tiếp, không cần kiểm tra string
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, googleLogin }}
    >
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