// src/features/orders/hooks/useOrderSocket.ts
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initSocket, joinRoom, leaveRoom } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';
import { ORDER_STATUS_LABELS } from '@/types/order.types';
import type { Order } from '@/types/order.types';

interface OrderUpdateEvent {
  event: string;
  orderId: string;
  status: string;
  order: Order;
  message?: string;
}

export const useOrderSocket = (orderId?: string) => {
  const queryClient = useQueryClient();
  const { token, user, isAuthenticated } = useAuthStore();

  const handleOrderUpdate = useCallback(
    (data: OrderUpdateEvent) => {
      const statusLabel = ORDER_STATUS_LABELS[data.status as keyof typeof ORDER_STATUS_LABELS];

      // Update single order cache if orderId exists
      if (data.orderId) {
        queryClient.setQueryData(['order', data.orderId], {
          success: true,
          order: data.order,
        });
      }

      // Always refresh the list of orders
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      // Toast notifications based on event type
      switch (data.event) {
        case 'new_order':
          toast.success('Order placed successfully!');
          break;
        case 'rider_assigned':
          toast.success('Rider assigned! Your food is on the way');
          break;
        case 'status_updated':
          if (data.status === 'delivered') {
            toast.success('Order delivered! Enjoy your meal');
          } else if (data.status === 'out_for_delivery') {
            toast.success('Out for delivery!');
          } else {
            toast.info(`Order is now: ${statusLabel}`);
          }
          break;
        case 'order_cancelled':
        case 'order_rejected':
          toast.error(`Order ${data.status === 'cancelled' ? 'cancelled' : 'rejected'}`);
          break;
        default:
          if (data.message) toast.info(data.message);
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!token && !orderId) return;

    const socket = initSocket(token);

    // Join user-specific room for all personal orders
    if (isAuthenticated && user?._id) {
      joinRoom(`user:${user._id}`);
    }

    // Join specific order room for live tracking
    if (orderId) {
      joinRoom(`order:${orderId}`);
    }

    socket.on('orderUpdate', handleOrderUpdate);

    return () => {
      socket.off('orderUpdate', handleOrderUpdate);

      if (isAuthenticated && user?._id) {
        leaveRoom(`user:${user._id}`);
      }

      if (orderId) {
        leaveRoom(`order:${orderId}`);
      }
    };
  }, [token, user?._id, isAuthenticated, orderId, handleOrderUpdate]);
};
