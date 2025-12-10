// src/types/order.types.ts
export type OrderStatus =
  | 'pending'
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  pending_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  pending_payment: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

export interface OrderItem {
  menuItem: {
    _id: string;
    name: string;
    image?: string;
  };
  name: string;
  image?: string;
  priceAtOrder: number;
  quantity: number;
}

export interface AddressDetails {
  fullAddress: string;
  label: string;
  floor?: string;
  instructions?: string;
}

export interface AppliedDeal {
  dealId?: string;
  code?: string;
  title?: string;
  appliedDiscount: number;
}

export interface Order {
  _id: string;
  shortId?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  discountApplied: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'card' | 'easypaisa' | 'jazzcash' | 'bank';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';
  estimatedDelivery?: string;
  placedAt: string;
  deliveredAt?: string;
  addressDetails?: AddressDetails;
  guestInfo?: {
    name: string;
    phone: string;
    isGuest: boolean;
  };
  customer?: {
    _id: string;
    name?: string;
    phone?: string;
  };
  rider?: {
    _id: string;
    name?: string;
    phone?: string;
  };
  area?: {
    _id: string;
    name: string;
  };
  bankTransferReference?: string;
  appliedDeal?: AppliedDeal;
}

export interface CreateOrderPayload {
  items: {
    menuItem: string;
    quantity: number;
  }[];
  addressId: string;
  paymentMethod?: 'cod' | 'card' | 'easypaisa' | 'jazzcash' | 'bank';
  promoCode?: string;
}

export interface CreateGuestOrderPayload {
  items: {
    menuItem: string;
    quantity: number;
  }[];
  guestAddress: {
    fullAddress: string;
    areaId: string;
    label?: string;
    floor?: string;
    instructions?: string;
  };
  name: string;
  phone: string;
  paymentMethod?: 'cod' | 'card' | 'easypaisa' | 'jazzcash' | 'bank';
  promoCode?: string;
}

export interface OrderResponse {
  success: true;
  message: string;
  order: Order;
  clientSecret?: string;
  bankDetails?: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branch: string;
    amount: number;
    reference: string;
  };
}

export interface OrdersResponse {
  success: true;
  orders: Order[];
}