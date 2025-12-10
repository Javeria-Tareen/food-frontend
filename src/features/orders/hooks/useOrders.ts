// src/features/orders/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';
import type {
  Order,
  CreateOrderPayload,
  CreateGuestOrderPayload,
  OrderResponse,
  OrdersResponse,
} from '@/types/order.types';

// -----------------------
// Fetch user's orders
// -----------------------
export const useMyOrders = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get<OrdersResponse>('/orders/my');
      return data.orders;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
};

// -----------------------
// Fetch single order by ID
// -----------------------
export const useOrder = (orderId: string) => {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get<OrderResponse>(`/orders/${orderId}`);
      return data.order;
    },
    enabled: !!orderId,
  });
};

// -----------------------
// Track guest orders by phone
// -----------------------
export const useTrackOrderByPhone = () => {
  return useMutation<OrdersResponse, Error, string>({
    mutationFn: async (phone) => {
      const { data } = await api.post<OrdersResponse>('/orders/track/by-phone', { phone });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to track orders');
    },
  });
};

// -----------------------
// Create order (authenticated user)
// -----------------------
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<OrderResponse>('/orders', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.removeQueries({ queryKey: ['cart'] });
      toast.success(data.message || 'Order placed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });
};

// -----------------------
// Create guest order (no login)
// -----------------------
export const useCreateGuestOrder = () => {
  return useMutation<OrderResponse, Error, CreateGuestOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<OrderResponse>('/orders', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Order placed! Check your phone.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });
};

// -----------------------
// Cancel order
// -----------------------
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: true; order: Order }, Error, string>({
    mutationFn: async (orderId) => {
      const { data } = await api.patch<{ success: true; order: Order }>(`/orders/${orderId}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cannot cancel order');
    },
  });
};

// -----------------------
// Confirm bank transfer (upload receipt)
// -----------------------
export const useConfirmBankPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: true; message: string }, Error, { orderId: string; receipt: File }>({
    mutationFn: async ({ orderId, receipt }) => {
      const formData = new FormData();
      formData.append('receipt', receipt);

      const { data } = await api.post<{ success: true; message: string }>(
        `/orders/${orderId}/confirm-bank`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Payment proof submitted! We’ll confirm soon.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit proof');
    },
  });
};
