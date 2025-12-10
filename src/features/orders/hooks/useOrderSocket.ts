// src/features/orders/hooks/useOrderSocket.ts
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';
import type { Order } from '@/types/order.types';

interface RiderLocationPayload {
  riderLocation: { lat: number; lng: number };
  riderId: string;
  status?: string;
}

interface OrderSocketEvents {
  orderUpdate: Order;
  orderInit: { orderId: string; status: string; riderLocation?: { lat: number; lng: number } };
  riderLocation: RiderLocationPayload;
  riderLiveUpdate: RiderLocationPayload & { orderId: string };
  riderOnline: { riderId: string; name: string; phone: string };
  riderOffline: { riderId: string };
  error: { message: string };
  payment_success?: any;
  order_cancelled?: any;
}

// Global event for rider location (used by tracking page)
declare global {
  interface Window {
    dispatchEvent: (event: Event) => boolean;
  }
}

export const useOrderSocket = (orderId?: string) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, token } = useAuthStore();

  const handleOrderUpdate = useCallback(
    (order: Order) => {
      // Update single order in cache
      queryClient.setQueryData(['order', order._id], { success: true, order });

      // Update my-orders list
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      // Toast notifications
      const status = order.status;
      if (status === 'confirmed') toast.success('Order confirmed! We’re preparing your food');
      if (status === 'preparing') toast.info('Your order is being prepared');
      if (status === 'out_for_delivery') toast.success('Rider is on the way!');
      if (status === 'delivered') {
        toast.success('Order delivered! Enjoy your meal');
        // Trigger confetti globally
        import('canvas-confetti').then((confetti) => {
          confetti.default({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        });
      }
      if (status === 'cancelled' || status === 'rejected') {
        toast.error(`Order ${status === 'rejected' ? 'rejected' : 'cancelled'}`);
      }
    },
    [queryClient]
  );

  const handleRiderLocation = useCallback((payload: RiderLocationPayload) => {
    // Dispatch global event so any tracking page can listen
    window.dispatchEvent(
      new CustomEvent('riderLocationUpdate', { detail: payload })
    );
  }, []);

  const handleOrderInit = useCallback(
    (payload: OrderSocketEvents['orderInit']) => {
      queryClient.setQueryData(['order', payload.orderId], {
        success: true,
        order: { _id: payload.orderId, status: payload.status } as Order,
      });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = getSocket() || initSocket(token);

    // Join user room
    if (user?._id) {
      socket.emit('join', `user:${user._id}`);
    }

    // Join specific order room for live tracking
    if (orderId) {
      socket.emit('trackOrder', { orderId });
    }

    // Listeners
    socket.on('orderUpdate', handleOrderUpdate);
    socket.on('orderInit', handleOrderInit);
    socket.on('riderLocation', handleRiderLocation);
    socket.on('riderLiveUpdate', handleRiderLocation);

    socket.on('riderOnline', (data) => {
      toast.success(`${data.name} is now online`);
    });

    socket.on('riderOffline', (data) => {
      toast.info(`Rider went offline`);
    });

    socket.on('error', (err) => {
      toast.error(err.message || 'Connection error');
    });

    // Cleanup
    return () => {
      socket.off('orderUpdate', handleOrderUpdate);
      socket.off('orderInit', handleOrderInit);
      socket.off('riderLocation', handleRiderLocation);
      socket.off('riderLiveUpdate', handleRiderLocation);
      socket.off('riderOnline');
      socket.off('riderOffline');
      socket.off('error');

      if (user?._id) socket.emit('leave', `user:${user._id}`);
      if (orderId) socket.emit('leave', `order:${orderId}`);
    };
  }, [
    isAuthenticated,
    token,
    user?._id,
    orderId,
    handleOrderUpdate,
    handleOrderInit,
    handleRiderLocation,
  ]);
};