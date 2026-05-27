'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  sku: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  metalType?: string;
  carat?: string;
  variantId?: string;
  finishName?: string;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'brm_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const key = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
      const existing = prev.find((i) => {
        const iKey = i.variantId ? `${i.productId}-${i.variantId}` : i.productId;
        return iKey === key;
      });
      if (existing) {
        return prev.map((i) => {
          const iKey = i.variantId ? `${i.productId}-${i.variantId}` : i.productId;
          return iKey === key ? { ...i, quantity: i.quantity + item.quantity } : i;
        });
      }
      return [...prev, { ...item, id: `${key}-${Date.now()}` }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = parseFloat(items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
