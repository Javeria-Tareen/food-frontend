import { create } from 'zustand';
import { MenuItem, Order, User, Rider } from './mockData';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface AppState {
  // User state
  currentUser: User | null;
  selectedArea: string | null;
  cart: CartItem[];
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setSelectedArea: (area: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Order management
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Rider management
  riders: Rider[];
  updateRiderStatus: (riderId: string, status: Rider['status']) => void;
  assignOrderToRider: (orderId: string, riderId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  selectedArea: null,
  cart: [],
  orders: [],
  riders: [],
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setSelectedArea: (area) => set({ selectedArea: area }),
  
  addToCart: (item) => set((state) => {
    const existingItem = state.cart.find((cartItem) => cartItem.menuItem.id === item.id);
    if (existingItem) {
      return {
        cart: state.cart.map((cartItem) =>
          cartItem.menuItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ),
      };
    }
    return { cart: [...state.cart, { menuItem: item, quantity: 1 }] };
  }),
  
  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart.filter((item) => item.menuItem.id !== itemId),
  })),
  
  updateCartQuantity: (itemId, quantity) => set((state) => ({
    cart: state.cart.map((item) =>
      item.menuItem.id === itemId ? { ...item, quantity } : item
    ),
  })),
  
  clearCart: () => set({ cart: [] }),
  
  addOrder: (order) => set((state) => ({
    orders: [...state.orders, order],
  })),
  
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId ? { ...order, status } : order
    ),
  })),
  
  updateRiderStatus: (riderId, status) => set((state) => ({
    riders: state.riders.map((rider) =>
      rider.id === riderId ? { ...rider, status } : rider
    ),
  })),
  
  assignOrderToRider: (orderId, riderId) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId ? { ...order, riderId } : order
    ),
    riders: state.riders.map((rider) =>
      rider.id === riderId
        ? { ...rider, currentOrders: [...rider.currentOrders, orderId] }
        : rider
    ),
  })),
}));
