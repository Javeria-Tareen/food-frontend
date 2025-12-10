import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    checkAuth, 
    logout,
    setAuth,
    setUser 
  } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  const isRider = user?.role === 'rider';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  const isRiderApproved = isRider && user?.riderStatus === 'approved';
  const isRiderPending = isRider && user?.riderStatus === 'pending';

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    isRider,
    isAdmin,
    isCustomer,
    isRiderApproved,
    isRiderPending,
    logout,
    setAuth,
    setUser,
    checkAuth,
  };
};
