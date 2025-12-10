import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RegisterRequest, RegisterResponse } from '@/types/auth.types';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};
