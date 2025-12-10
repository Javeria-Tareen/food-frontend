// src/lib/store.ts → Cleaned up version
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  currentUser: any | null;

  orders: any[];
  riders: any[];
  deals: any[];
  menuItems: any[];

  setCurrentUser: (user: any) => void;

  // Orders, riders, deals, menu actions...
  addOrder: (order: any) => void;
  updateOrderStatus: (orderId: string, status: any) => void;
  // ... keep all other admin/order logic
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      orders: [],
      riders: [],
      deals: [],
      menuItems: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        })),
      // ... other actions
    }),
    {
      name: "amfood-storage-v2",
      version: 2,
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);