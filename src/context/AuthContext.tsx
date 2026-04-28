import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Try to call the backend API
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: jwtToken, user: userData } = response.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      // Mock fallback for demo
      const mockUser: User = { id: "1", name: "Demo User", email };
      const mockToken = "mock-jwt-token-" + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/signup", { name, email, password });
      const { token: jwtToken, user: userData } = response.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      // Mock fallback for demo
      const mockUser: User = { id: "1", name, email };
      const mockToken = "mock-jwt-token-" + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
