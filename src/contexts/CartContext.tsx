import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Product } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";

interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const hydratedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const storageKey = (userId: string) => `cart:${userId}`;

  const safeParseItems = (raw: string | null): CartItem[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((x) => x && typeof x === "object")
        .map((x: any) => ({
          product: x.product as Product,
          quantity: Number(x.quantity ?? 0),
          size: String(x.size ?? ""),
        }))
        .filter((x) => x.product && typeof x.product === "object" && typeof x.product.id === "string" && x.product.id.length > 0)
        .filter((x) => Number.isFinite(x.quantity) && x.quantity > 0);
    } catch {
      return [];
    }
  };

  // Rehydrate cart after auth session is restored.
  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id ?? null;

    // On logout: clear in-memory cart.
    if (!userId) {
      hydratedRef.current = true;
      lastUserIdRef.current = null;
      setItems([]);
      return;
    }

    // On first load or user switch: load from storage.
    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      const raw = window.localStorage.getItem(storageKey(userId));
      setItems(safeParseItems(raw));
      hydratedRef.current = true;
    }
  }, [authLoading, user?.id]);

  // Persist cart whenever it changes (after hydration).
  useEffect(() => {
    if (authLoading) return;
    if (!hydratedRef.current) return;
    const userId = user?.id;
    if (!userId) return;
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, authLoading, user?.id]);

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { product, quantity, size }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
