import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/supabase";

type Role = "customer" | "admin" | "unknown";

interface AppUser {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    mobile: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  googleSignIn: () => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserRole(userId: string): Promise<Role> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return "customer";
    }

    return (data.role as Role) || "customer";
  } catch (error) {
    console.error('Error fetching user role:', error);
    return "customer";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with current session
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      if (!s?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      const role = await fetchUserRole(s.user.id);
      setUser({ id: s.user.id, email: s.user.email || "", role });
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user;
      if (!u) {
        setUser(null);
        return;
      }
      const role = await fetchUserRole(u.id);
      setUser({ id: u.id, email: u.email || "", role });
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      if (!u) return { ok: false as const, error: "Login failed" };
      const role = await fetchUserRole(u.id);
      setUser({ id: u.id, email: u.email || "", role });
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Login failed";
      return { ok: false as const, error: msg };
    }
  };

  const signup = async (name: string, email: string, password: string, mobile: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, mobile, role: "customer" as Role },
        },
      });
      if (error) throw error;
      const u = data.user;
      if (!u) return { ok: true as const }; // may need email verification
      const role = (u.user_metadata?.role as Role) || "customer";
      setUser({ id: u.id, email: u.email || "", role });
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Signup failed";
      return { ok: false as const, error: msg };
    }
  };

  const googleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      // Redirect will occur; return ok to satisfy caller
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Google sign-in failed";
      return { ok: false as const, error: msg };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      googleSignIn,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
