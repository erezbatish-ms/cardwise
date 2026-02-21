import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .authStatus()
      .then((res) => setIsAuthenticated(res.authenticated))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (password: string) => {
    const res = await api.login(password);
    setIsAuthenticated(res.success);
    return res.success;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}
