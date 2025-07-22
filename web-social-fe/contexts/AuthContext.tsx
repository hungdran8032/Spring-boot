// 'use client';

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from 'react';
// import {
//   authService,
//   Auth,
//   Login,
//   Register,
// } from '@/lib/auth-service';

// interface AuthContextType {
//   user: Auth | null;
//   loading: boolean;
//   login: (data: Login) => Promise<void>;
//   register: (data: Register) => Promise<void>;
//   logout: () => void;
//   googleLogin: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<Auth | null>(null);
//   const [loading, setLoading] = useState<boolean>(true); // 👈

//   useEffect(() => {
//   const token = localStorage.getItem('token');
//   if (token && !user) {
//     authService
//       .getCurrentUser()
//       .then((userData) => {
//         setUser(userData);
//       })
//       .catch((err) => {
//         console.error('Không lấy được thông tin user:', err);
//         logout();
//       })
//       .finally(() => {
//         setLoading(false); // ✅ kết thúc loading
//       });
//   } else {
//     setLoading(false); // Không có token → cũng dừng loading
//   }
//   }, []);

//   const login = async (data: Login) => {
//     const authData = await authService.login(data);
//     setUser(authData);
//     localStorage.setItem('token', authData.token);
//     localStorage.setItem('refreshToken', authData.refreshToken);
//   };

//   const register = async (data: Register) => {
//     const authData = await authService.register(data);
//     setUser(authData);
//     localStorage.setItem('token', authData.token);
//     localStorage.setItem('refreshToken', authData.refreshToken);
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('refreshToken');
//   };

//   const googleLogin = () => {
//     const googleLoginUrl = authService.loginGoogle();
//     if (typeof googleLoginUrl === 'string') {
//       window.location.href = googleLoginUrl;
//     } else {
//       console.error('Google login URL is invalid.');
//     }
//   };

//   return (
//     <AuthContext.Provider
//   value={{ user, loading, login, register, logout, googleLogin }}
// >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
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
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
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