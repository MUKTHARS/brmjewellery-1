'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/api/auth.api';

interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.data);
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    const { user: authUser, accessToken } = data.data;
    if (typeof window !== 'undefined') localStorage.setItem('accessToken', accessToken);
    setUser(authUser);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
