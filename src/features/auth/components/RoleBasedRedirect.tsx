import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading, isInitialized, isRiderApproved } = useAuth();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'rider':
      return isRiderApproved 
        ? <Navigate to="/rider/dashboard" replace />
        : <Navigate to="/rider/apply/status" replace />;
    case 'customer':
    default:
      return <Navigate to="/menu" replace />;
  }
};
