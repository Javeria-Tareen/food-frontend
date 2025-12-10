// src/features/cart/hooks/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItemInCart, GuestCartItem } from '@/types/cart.types';

interface CartState {
  items: GuestCartItem[];
  addItem: (menuItem: MenuItemInCart, quantity?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

const calculateTotal = (items: GuestCartItem[]) =>
  items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(i => i.menuItem._id === menuItem._id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.menuItem._id === menuItem._id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, 50) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                _id: crypto.randomUUID(),
                menuItem,
                quantity,
                priceAtAdd: menuItem.price,
              },
            ],
          };
        }),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(i => i._id !== cartItemId)
              : state.items.map(i => (i._id === cartItemId ? { ...i, quantity } : i)),
        })),

      removeItem: (cartItemId) =>
        set(state => ({
          items: state.items.filter(i => i._id !== cartItemId),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => calculateTotal(get().items),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'amfood-cart-v2',
    }
  )
);