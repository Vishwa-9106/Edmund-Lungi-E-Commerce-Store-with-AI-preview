import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { auth, db } from "@/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

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

async function getUserRole(uid: string): Promise<Role | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as { role?: Role };
  return data.role ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      // Set immediately for instant UI/navigation; role unknown for now
      setUser({ id: fbUser.uid, email: fbUser.email || "", role: "unknown" });
      setLoading(false);
      // Background role fetch and enforcement
      getUserRole(fbUser.uid)
        .then(async (role) => {
          if (!role) return; // No doc yet (e.g., just signed up) - allow UI to proceed
          if (role !== "customer") {
            await signOut(auth);
            setUser(null);
          } else {
            setUser((prev) => (prev ? { ...prev, role: "customer" } : prev));
          }
        })
        .catch((e) => {
          console.warn("role fetch failed", e);
        });
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Set immediately; do not block on role fetch
      setUser({ id: cred.user.uid, email: cred.user.email || "", role: "unknown" });
      // Background enforcement
      getUserRole(cred.user.uid)
        .then(async (role) => {
          if (role !== "customer") {
            await signOut(auth);
            setUser(null);
          } else {
            setUser((prev) => (prev ? { ...prev, role: "customer" } : prev));
          }
        })
        .catch((e) => console.warn("role fetch failed", e));
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Login failed";
      return { ok: false as const, error: msg };
    }
  };

  const signup = async (name: string, email: string, password: string, mobile: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set immediately; write profile in background for speed
      setUser({ id: cred.user.uid, email: cred.user.email || "", role: "unknown" });
      setDoc(doc(db, "users", cred.user.uid), {
        email,
        role: "customer" as Role,
        createdAt: serverTimestamp(),
        name,
        mobile,
      })
        .then(() => setUser((prev) => (prev ? { ...prev, role: "customer" } : prev)))
        .catch((e) => console.warn("profile write failed", e));
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Signup failed";
      return { ok: false as const, error: msg };
    }
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const uid = cred.user.uid;
      // Set immediately
      setUser({ id: uid, email: cred.user.email || "", role: "unknown" });
      // Background: ensure profile exists and enforce role
      const userRef = doc(db, "users", uid);
      getDoc(userRef)
        .then((snap) => {
          if (!snap.exists()) {
            return setDoc(userRef, {
              email: cred.user.email || "",
              name: cred.user.displayName || "",
              role: "customer" as Role,
              createdAt: serverTimestamp(),
            });
          }
          const data = snap.data() as { role?: Role };
          if (data.role !== "customer") {
            return signOut(auth).then(() => setUser(null));
          }
          setUser((prev) => (prev ? { ...prev, role: "customer" } : prev));
        })
        .catch((e) => console.warn("google profile ensure failed", e));
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Google sign-in failed";
      return { ok: false as const, error: msg };
    }
  };

  const logout = async () => {
    await signOut(auth);
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
