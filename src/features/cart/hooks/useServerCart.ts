// src/features/cart/hooks/useServerCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CartResponse, ServerCartItem } from '@/types/cart.types';

const CART_QUERY_KEY = 'serverCart';

export const useServerCart = () => {
  return useQuery({
    queryKey: [CART_QUERY_KEY],
    queryFn: async () => {
      const { data } = await axios.get<CartResponse>('/api/cart');
      return data;
    },
    select: (data) => ({
      items: data.cart.items as ServerCartItem[],
      total: data.cart.total,
      isGuest: data.isGuest,
    }),
  });
};

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuItemId, quantity = 1 }: { menuItemId: string; quantity?: number }) => {
      const res = await axios.post('/api/cart', { menuItemId, quantity });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};

export const useUpdateCartQuantity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await axios.patch(`/api/cart/item/${itemId}`, { quantity });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await axios.delete(`/api/cart/item/${itemId}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};

export const useClearCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axios.delete('/api/cart/clear');
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};
