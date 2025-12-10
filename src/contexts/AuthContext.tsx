import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  logout as firebaseLogout,
  signInWithGoogle as firebaseSignInWithGoogle,
  subscribeToAuthChanges
} from "../lib/auth";
import { getDocument, setDocument } from "../lib/firestore";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  photoURL?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Firestore
  const loadUserProfile = async (fbUser: FirebaseUser) => {
    try {
      const profile = await getDocument<UserProfile>("users", fbUser.uid);

      if (profile) {
        setUser(profile);
      } else {
        // Create new user profile if doesn't exist
        const newProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || "User",
          email: fbUser.email || "",
          role: "customer",
          photoURL: fbUser.photoURL || undefined,
        };

        await setDocument("users", fbUser.uid, newProfile, false);
        setUser(newProfile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  // Subscribe to Firebase auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        await loadUserProfile(fbUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await firebaseSignIn(email, password);
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await firebaseSignUp(email, password, name);

      // Create user profile in Firestore
      const newProfile: UserProfile = {
        id: userCredential.user.uid,
        name,
        email,
        role: "customer",
      };

      await setDocument("users", userCredential.user.uid, newProfile, false);
      return true;
    } catch (error: any) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      await firebaseSignInWithGoogle();
      return true;
    } catch (error: any) {
      console.error("Google login failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {!loading && children}
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
