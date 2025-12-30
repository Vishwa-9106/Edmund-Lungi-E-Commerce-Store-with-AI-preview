import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { supabase } from "@/supabase";
import { toast } from "@/hooks/use-toast";

type Role = "admin" | "user";

interface AppUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AppUser | null;
  role: Role | null;
  authLoading: boolean;
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
      return "user";
    }

    return (data as any)?.role === "admin" ? "admin" : "user";
  } catch {
    return "user";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const initializedRef = useRef(false);
  const lastGoogleWelcomeToastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const applySessionUserOnly = (
      session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null,
    ) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setRole(null);
        return;
      }

      setUser({
        id: session.user.id,
        email: session.user.email || "",
        name:
          (session.user.user_metadata as any)?.name ||
          (session.user.user_metadata as any)?.full_name ||
          undefined,
        createdAt: (session.user as any)?.created_at || undefined,
      });
    };

    const applySession = async (
      session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null,
    ) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setRole(null);
        return;
      }

      // Check if user exists in public.users, if not create them
      const { data: profile, error: profileFetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      let resolvedRole: Role = "user";

      if (profileFetchError && profileFetchError.code === 'PGRST116') {
        // User record missing in public.users, create it
        const metadata = session.user.user_metadata as any;
        const { error: insertError } = await supabase.from('users').insert({
          id: session.user.id,
          name: metadata?.name || metadata?.full_name || "User",
          email: session.user.email,
          phone: metadata?.mobile || "",
          role: "customer",
          no_of_orders: 0
        });
        
        if (insertError) {
          console.error("Error creating missing user profile:", insertError);
        }
        resolvedRole = "user";
      } else if (profile) {
        resolvedRole = (profile as any).role === "admin" ? "admin" : "user";
      }

      if (!mounted) return;
      setUser({
        id: session.user.id,
        email: session.user.email || "",
        name: (session.user.user_metadata as any)?.name || (session.user.user_metadata as any)?.full_name || undefined,
        createdAt: (session.user as any)?.created_at || undefined,
      });
      setRole(resolvedRole);
    };

    // Keep auth state in sync (login/logout/token refresh)
    // but do not interfere with initial restore.
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!initializedRef.current) return;

      if (
        _event === "SIGNED_IN" &&
        session?.user?.id &&
        (session.user.app_metadata as any)?.provider === "google" &&
        lastGoogleWelcomeToastUserIdRef.current !== session.user.id
      ) {
        lastGoogleWelcomeToastUserIdRef.current = session.user.id;
        toast({ title: "Welcome!", description: "Logged in with Google." });
      }

      // Critical: never toggle authLoading or re-fetch role after initial app startup.
      // Listener only keeps session/user data in sync.
      applySessionUserOnly(session);
    });

    // Restore existing session on app load (source of truth)
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          setUser(null);
          setRole(null);
          return;
        }

        await applySession(data.session ?? null);
      } catch {
        if (!mounted) return;
        setUser(null);
        setRole(null);
      } finally {
        initializedRef.current = true;
        if (mounted) setAuthLoading(false);
      }
    })();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      if (!u) return { ok: false as const, error: "Login failed" };
      const resolvedRole = await fetchUserRole(u.id);
      setUser({
        id: u.id,
        email: u.email || "",
        name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || undefined,
        createdAt: (u as any)?.created_at || undefined,
      });
      setRole(resolvedRole);
      return { ok: true as const };
    } catch (e: any) {
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
          data: { name, mobile, role: "customer" },
        },
      });
      if (error) throw error;
      const u = data.user;
      if (!u) return { ok: true as const }; // may need email verification

      // Create profile in public.users table
      const { error: profileError } = await supabase.from("users").insert({
        id: u.id,
        name,
        email,
        phone: mobile,
        role: "customer",
        no_of_orders: 0
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }

      setUser({ id: u.id, email: u.email || "", name, createdAt: (u as any)?.created_at || undefined });
      setRole("user");
      return { ok: true as const };
    } catch (e: any) {
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
      const msg = e?.message || "Google sign-in failed";
      return { ok: false as const, error: msg };
    }
  };

  const logout = async () => {
    setUser(null);
    setRole(null);

    void supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      user,
      role,
      authLoading,
      loading: authLoading,
      login,
      signup,
      googleSignIn,
      logout,
      isAuthenticated: !!user,
      isAdmin: role === "admin",
    }),
    [user, role, authLoading]
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
