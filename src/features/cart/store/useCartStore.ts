// src/features/cart/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === Types ===
export interface MenuItemInCart {
  _id: string;
  name: string;
  price: number;
  image?: string;
  isAvailable?: boolean;     // ← Added (critical for menu cards)
  isVeg?: boolean;
  isSpicy?: boolean;
}

export interface CartItem {
  _id: string;                    // UUID for guest cart
  menuItem: MenuItemInCart;
  quantity: number;
  priceAtAdd: number;
}

export interface AppliedDeal {
  code: string;
  title: string;
  description?: string;
  savings: number;
}

export interface CartState {
  items: CartItem[];
  appliedDeal: AppliedDeal | null;
  discountAmount: number;
  subtotal: number;
  finalTotal: number;

  // Actions
  addItem: (menuItem: MenuItemInCart, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  applyDeal: (deal: AppliedDeal) => void;
  removeDeal: () => void;
  getItemCount: () => number;
  getTotal: () => number;         // ← Now properly exposed!
}

// Helper
const calculateSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDeal: null,
      discountAmount: 0,
      subtotal: 0,
      finalTotal: 0,

      addItem: (menuItem, quantity = 1) => {
        if (!menuItem.isAvailable) return; // prevent adding unavailable items

        set((state) => {
          const existing = state.items.find(i => i.menuItem._id === menuItem._id);

          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map(i =>
              i.menuItem._id === menuItem._id
                ? { ...i, quantity: Math.min(i.quantity + quantity, 50) }
                : i
            );
          } else {
            newItems = [
              ...state.items,
              {
                _id: crypto.randomUUID(),
                menuItem,
                quantity,
                priceAtAdd: menuItem.price,
              },
            ];
          }

          const subtotal = calculateSubtotal(newItems);
          const finalTotal = Math.max(0, subtotal - state.discountAmount);

          return { items: newItems, subtotal, finalTotal };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => {
          const newItems = state.items.filter(i => i._id !== cartItemId);
          const subtotal = calculateSubtotal(newItems);
          const finalTotal = Math.max(0, subtotal - state.discountAmount);
          return { items: newItems, subtotal, finalTotal };
        });
      },

      updateQuantity: (cartItemId, newQuantity) => {
        set((state) => {
          const newItems =
            newQuantity <= 0
              ? state.items.filter(i => i._id !== cartItemId)
              : state.items.map(i =>
                  i._id === cartItemId ? { ...i, quantity: Math.min(newQuantity, 50) } : i
                );

          const subtotal = calculateSubtotal(newItems);
          const finalTotal = Math.max(0, subtotal - state.discountAmount);
          return { items: newItems, subtotal, finalTotal };
        });
      },

      clearCart: () =>
        set({
          items: [],
          appliedDeal: null,
          discountAmount: 0,
          subtotal: 0,
          finalTotal: 0,
        }),

      applyDeal: (deal) => {
        set((state) => ({
          appliedDeal: deal,
          discountAmount: deal.savings,
          finalTotal: Math.max(0, state.subtotal - deal.savings),
        }));
      },

      removeDeal: () => {
        set((state) => ({
          appliedDeal: null,
          discountAmount: 0,
          finalTotal: state.subtotal,
        }));
      },

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      // ← NEW: Now you can use guestCart.getTotal() safely
      getTotal: () => {
        const state = get();
        return state.finalTotal; // respects discount
        // Or use: calculateSubtotal(state.items) for raw subtotal
      },
    }),
    {
      name: 'amfood-cart-v2', // changed name to force refresh old data
      partialize: (state) => ({
        items: state.items,
        appliedDeal: state.appliedDeal,
        discountAmount: state.discountAmount,
      }),
    }
  )
);