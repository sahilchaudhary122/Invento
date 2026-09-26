import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials } from '../types/auth';
import { authApi } from '../api/auth.api';
import { getToken, setToken, removeToken } from '../utils/token';

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
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    let isMounted = true;

    async function initAuth() {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const currentUser = await authApi.getMe();
          if (isMounted) {
            setUser(currentUser);
            setTokenState(storedToken);
          }
        } catch {
          if (isMounted) {
            removeToken();
            setUser(null);
            setTokenState(null);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials.email, credentials.password);
    setToken(response.access_token);
    setTokenState(response.access_token);

    // Fetch user details immediately after obtaining token
    const currentUser = await authApi.getMe();
    setUser(currentUser);
  };

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setTokenState(null);
  }, []);

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
