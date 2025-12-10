import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChangePasswordRequest, ChangePasswordResponse } from '@/types/auth.types';
import { toast } from 'sonner';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await api.patch<ChangePasswordResponse>('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};
