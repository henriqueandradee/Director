import { createContext, useContext, useState, ReactNode } from "react";
import { authApi, ApiUser } from "./api";

interface AuthContextValue {
  token: string | null;
  user: ApiUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "diretoria_token";
const USER_KEY = "diretoria_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<ApiUser | null>(() => {
    const s = localStorage.getItem(USER_KEY);
    return s ? (JSON.parse(s) as ApiUser) : null;
  });

  const persist = (t: string, u: ApiUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.login(email, password);
    persist(t, u);
  };

  const register = async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.register(email, password);
    persist(t, u);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
