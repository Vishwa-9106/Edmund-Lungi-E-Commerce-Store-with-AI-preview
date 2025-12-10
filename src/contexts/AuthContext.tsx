import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: "customer" | "admin") => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: "customer" | "admin"): Promise<boolean> => {
    // Placeholder API call - in production, this would call your backend
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Mock successful login
      setUser({
        id: "1",
        name: role === "admin" ? "Admin User" : "Customer User",
        email,
        role,
      });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Placeholder API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setUser({
        id: "1",
        name,
        email,
        role: "customer",
      });
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
