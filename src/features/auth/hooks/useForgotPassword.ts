import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ForgotPasswordRequest, ForgotPasswordResponse } from '@/types/auth.types';
import { toast } from 'sonner';

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`OTP sent to ${data.otpSentTo}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    },
  });
};
