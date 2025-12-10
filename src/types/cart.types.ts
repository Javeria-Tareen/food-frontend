// src/types/cart.types.ts
// src/types/cart.types.ts

// src/types/cart.types.ts

// export interface MenuItemInCart {
//   _id: string;
//   name: string;
//   price: number;
//   image?: string;
//   isAvailable?: boolean;     // ADD THIS LINE
//   isVeg?: boolean;           // optional – good to have
//   isSpicy?: boolean;         // optional
// }
export interface MenuItemInCart {
  _id: string;
  name: string;
  price: number;
  image?: string;
  isAvailable?: boolean;   // ✅ must be optional
  isVeg?: boolean;
  isSpicy?: boolean;
}

export interface ServerCartItem {
  _id: string; // MongoDB subdocument _id
  menuItem: MenuItemInCart;
  quantity: number;
  priceAtAdd: number;
  addedAt?: string;
}

export interface GuestCartItem {
  _id: string; // UUID for guest cart
  menuItem: MenuItemInCart;
  quantity: number;
  priceAtAdd: number;
}

export type CartItem = ServerCartItem | GuestCartItem;

export interface CartResponse {
  success: boolean;
  message: string;
  cart: {
    items: ServerCartItem[];
    total: number;
  };
  isGuest: boolean;
}