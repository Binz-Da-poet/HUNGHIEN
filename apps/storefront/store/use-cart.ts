import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface CartStore {
  items: CartItem[];
  buyNowItem: CartItem | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setBuyNowItem: (item: Omit<CartItem, 'quantity'>) => void;
  clearBuyNowItem: () => void;
  getTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowItem: null,
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.productId === item.productId);
        
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      setBuyNowItem: (item) => set({ buyNowItem: { ...item, quantity: 1 } }),
      clearBuyNowItem: () => set({ buyNowItem: null }),
      getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
