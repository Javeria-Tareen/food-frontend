import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoginRequest, LoginResponse } from '@/types/auth.types';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<LoginResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};
