import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ResetPasswordRequest, ResetPasswordResponse } from '@/types/auth.types';
import { toast } from 'sonner';

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
};
