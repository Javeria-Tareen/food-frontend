import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: () => {
      // Still logout locally even if server request fails
      logout();
      navigate('/login');
    },
  });
};
