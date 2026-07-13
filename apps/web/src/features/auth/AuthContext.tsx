import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../../services/apiClient';
import * as authService from '../../services/authService';
import type { AuthUser } from '../../types/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .getCurrentUser()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => clearStoredToken())
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user != null,
      async login(email: string, password: string) {
        const { token, user: loggedUser } = await authService.login({ email, password });
        setStoredToken(token);
        setUser(loggedUser);
      },
      async register(name: string, email: string, password: string) {
        await authService.register({ name, email, password });
        const { token, user: loggedUser } = await authService.login({ email, password });
        setStoredToken(token);
        setUser(loggedUser);
      },
      logout() {
        clearStoredToken();
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return ctx;
}
