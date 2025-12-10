import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { VerifyOtpRequest, VerifyOtpResponse } from '@/types/auth.types';
import { toast } from 'sonner';

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: VerifyOtpRequest) => {
      const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('OTP verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    },
  });
};
