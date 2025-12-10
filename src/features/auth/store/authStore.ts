// src/features/auth/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthMeResponse } from '@/types/auth.types';
import { api } from '@/lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      setAuth: (user: User, token: string) => {
        localStorage.setItem('authToken', token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
          set({ isLoading: false, isInitialized: true });
          return;
        }

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          const { data }: { data: AuthMeResponse } = await api.get('/auth/me');

          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error: any) {
          console.warn('Auth check failed:', error.response?.data?.message || error.message);
          localStorage.removeItem('authToken');
          delete api.defaults.headers.common['Authorization'];

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'amfood-auth-storage',
      version: 1,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Optional: migrate old data if needed later
      // migrate: (persistedState, version) => { ... }
    }
  )
);