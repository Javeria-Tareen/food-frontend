import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { UpdateProfileRequest, UpdateProfileResponse } from '@/types/auth.types';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const useUpdateProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await api.put<UpdateProfileResponse>('/auth/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};
