import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistContextType {
  wishlist: Set<string>;
  loaded: boolean;
  isUpdating: (productId: string) => boolean;
  toggle: (productId: string) => Promise<
    | { ok: true; wishlist: Set<string> }
    | { ok: false; needsLogin: true }
    | { ok: false; error: string }
  >;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const updatingIdsRef = useRef<Set<string>>(new Set());
  const [, forceRender] = useState(0);

  const setUpdating = (productId: string, updating: boolean) => {
    const s = updatingIdsRef.current;
    if (updating) s.add(productId);
    else s.delete(productId);
    forceRender((x) => x + 1);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user?.id) {
      setWishlist(new Set());
      setLoaded(true);
      return;
    }

    let alive = true;
    setLoaded(false);

    void (async () => {
      try {
        const { data, error } = await supabase.rpc("get_wishlist");
        if (!alive) return;
        if (error) throw error;
        const arr = Array.isArray(data) ? (data as unknown[]).map((x) => String(x)) : [];
        setWishlist(new Set(arr.filter((x) => x.length > 0)));
      } catch {
        if (!alive) return;
        setWishlist(new Set());
      } finally {
        if (!alive) return;
        setLoaded(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authLoading, isAuthenticated, user?.id]);

  const isUpdating = (productId: string) => updatingIdsRef.current.has(productId);

  const toggle: WishlistContextType["toggle"] = async (productId) => {
    if (!isAuthenticated || !user?.id) {
      return { ok: false, needsLogin: true };
    }

    const pid = String(productId ?? "").trim();
    if (!pid) return { ok: false, error: "Invalid product" };

    const prev = wishlist;
    const next = new Set(prev);
    const had = next.has(pid);
    if (had) next.delete(pid);
    else next.add(pid);

    setWishlist(next);
    setUpdating(pid, true);

    try {
      const { data, error } = await supabase.rpc("toggle_wishlist", { p_product_id: pid });
      if (error) throw error;
      const arr = Array.isArray(data) ? (data as unknown[]).map((x) => String(x)) : [];
      const finalSet = new Set(arr.filter((x) => x.length > 0));
      setWishlist(finalSet);
      return { ok: true, wishlist: finalSet };
    } catch (e: any) {
      setWishlist(prev);
      return { ok: false, error: e?.message || "Failed to update wishlist" };
    } finally {
      setUpdating(pid, false);
    }
  };

  const value = useMemo(
    () => ({
      wishlist,
      loaded,
      isUpdating,
      toggle,
    }),
    [wishlist, loaded]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
