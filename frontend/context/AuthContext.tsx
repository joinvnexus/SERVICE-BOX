'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import {
  login as loginApi,
  register as registerApi,
  getCurrentUser,
} from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: function inside useEffect (no hoisting issue)
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    const response = await loginApi({ email, password });

    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  // REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string
  ) => {
    const response = await registerApi({
      name,
      email,
      password,
      role,
    });

    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}