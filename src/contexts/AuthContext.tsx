import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { supabase } from "@/supabase";
import { toast } from "@/hooks/use-toast";

type Role = "customer" | "admin" | "unknown";

interface AppUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  role: Role;
}

interface AuthContextType {
  user: AppUser | null;
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
  const [authLoading, setAuthLoading] = useState(true);
  const initializedRef = useRef(false);
  const pendingSessionRef = useRef<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null>(null);
  const lastGoogleWelcomeToastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const applySession = async (session: typeof pendingSessionRef.current) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      const role = await fetchUserRole(session.user.id);
      if (!mounted) return;
      setUser({
        id: session.user.id,
        email: session.user.email || "",
        name: (session.user.user_metadata as any)?.name || (session.user.user_metadata as any)?.full_name || undefined,
        createdAt: (session.user as any)?.created_at || undefined,
        role,
      });
    };

    // Keep auth state in sync (login/logout/token refresh)
    // but do not apply changes until initial getSession() restore completes.
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        // eslint-disable-next-line no-console
        console.log("[Auth] onAuthStateChange", {
          event: _event,
          hasSession: !!session,
          userId: session?.user?.id || null,
        });
      } catch {
        // ignore
      }

      pendingSessionRef.current = session;
      if (!initializedRef.current) return;

      try {
        if (
          _event === "SIGNED_IN" &&
          session?.user?.id &&
          (session.user.app_metadata as any)?.provider === "google" &&
          lastGoogleWelcomeToastUserIdRef.current !== session.user.id
        ) {
          lastGoogleWelcomeToastUserIdRef.current = session.user.id;
          toast({ title: "Welcome!", description: "Logged in with Google." });
        }

        await applySession(session);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    });

    // Restore existing session on app load (source of truth)
    (async () => {
      try {
        try {
          const keys = Object.keys(window.localStorage || {}).filter((k) => k.includes("auth") || k.includes("sb-"));
          // eslint-disable-next-line no-console
          console.log("[Auth] storage keys (filtered)", keys);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("[Auth] localStorage not accessible", e);
        }

        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        try {
          // eslint-disable-next-line no-console
          console.log("[Auth] getSession result", {
            error: error ? { message: (error as any).message, name: (error as any).name } : null,
            hasSession: !!data.session,
            userId: data.session?.user?.id || null,
          });
        } catch {
          // ignore
        }

        if (error) {
          console.error("Error restoring session:", error);
          setUser(null);
          initializedRef.current = true;
          setAuthLoading(false);
          return;
        }

        await applySession(data.session);

        initializedRef.current = true;

        // If an auth event arrived during init, apply the latest session once.
        const pending = pendingSessionRef.current;
        if (pending !== data.session) {
          await applySession(pending);
        }

        if (mounted) setAuthLoading(false);
      } catch (e) {
        console.error("Error restoring session:", e);
        if (!mounted) return;
        setUser(null);
        initializedRef.current = true;
        setAuthLoading(false);
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
      const role = await fetchUserRole(u.id);
      setUser({
        id: u.id,
        email: u.email || "",
        name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || undefined,
        createdAt: (u as any)?.created_at || undefined,
        role,
      });
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
      setUser({ id: u.id, email: u.email || "", name, createdAt: (u as any)?.created_at || undefined, role });
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Signup failed";
      return { ok: false as const, error: msg };
    }
  };

  const googleSignIn = async () => {
    try {
      setAuthLoading(true);
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
    setUser(null);

    void supabase.auth.signOut().catch((e) => {
      console.error(e);
    });
  };

  const value = useMemo(
    () => ({
      user,
      authLoading,
      loading: authLoading,
      login,
      signup,
      googleSignIn,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
    }),
    [user, authLoading]
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
