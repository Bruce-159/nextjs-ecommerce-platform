"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";

export type CartItemView = {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
  };
  subtotal: number;
};

export type CartView = {
  id: string | null;
  items: CartItemView[];
  itemCount: number;
  total: number;
};

type CartContextValue = {
  cart: CartView;
  loading: boolean;
  refreshCart: () => Promise<void>;
  setCart: (cart: CartView) => void;
};

const emptyCart: CartView = {
  id: null,
  items: [],
  itemCount: 0,
  total: 0,
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [cart, setCart] = useState<CartView>(emptyCart);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (status !== "authenticated") {
      setCart(emptyCart);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        setCart(emptyCart);
        return;
      }
      const data = (await response.json()) as CartView;
      setCart(data);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void refreshCart();
    } else if (status === "unauthenticated") {
      setCart(emptyCart);
    }
  }, [status, refreshCart]);

  const value = useMemo(
    () => ({ cart, loading, refreshCart, setCart }),
    [cart, loading, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
