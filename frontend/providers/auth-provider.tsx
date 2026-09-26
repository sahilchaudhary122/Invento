"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials } from '@/types/auth';
import { authApi } from '@/lib/api/auth.api';
import { getToken, setToken, removeToken } from '@/lib/utils/token';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      return;
    }

    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      setTokenState(currentToken);
    } catch {
      // Invalid/expired token or server unreachable
      removeToken();
      setUser(null);
      setTokenState(null);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = getToken();
      if (storedToken) {
        setTokenState(storedToken);
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch {
          removeToken();
          setUser(null);
          setTokenState(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  // Protect routes
  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials.email, credentials.password);
    setToken(response.access_token);
    setTokenState(response.access_token);

    // Fetch user details immediately after obtaining token
    const currentUser = await authApi.getMe();
    setUser(currentUser);
    router.push('/dashboard');
  };

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setTokenState(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
