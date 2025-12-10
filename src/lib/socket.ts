// src/lib/socket.ts
import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Initialize the Socket.IO client.
 * Reuses existing socket if already connected.
 * @param token Optional authentication token
 * @returns Socket instance
 */
export const initSocket = (token?: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const options: Partial<ManagerOptions & SocketOptions> = {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  };

  socket = io(SOCKET_URL, options);

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error instanceof Error ? error.message : error);
  });

  return socket;
};

/**
 * Get the current socket instance (or null if not initialized)
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect and clear the socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Safely emit join event if socket is connected
 * @param room Room name
 */
export const joinRoom = (room: string): void => {
  socket?.connected && socket.emit('join', room);
};

/**
 * Safely emit leave event if socket is connected
 * @param room Room name
 */
export const leaveRoom = (room: string): void => {
  socket?.connected && socket.emit('leave', room);
};
