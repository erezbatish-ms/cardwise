import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, type AuthUser } from "../lib/api";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    api
      .authStatus()
      .then((res) => {
        setIsAuthenticated(res.authenticated);
        setUser(res.user || null);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.authStatus();
      setIsAuthenticated(res.authenticated);
      setUser(res.user || null);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
