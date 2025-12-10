import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('customer' | 'rider' | 'admin')[];
  requireRiderApproved?: boolean;
}

export const AuthGuard = ({
  children,
  requireAuth = true,
  allowedRoles,
  requireRiderApproved = false,
}: AuthGuardProps) => {
  const { user, isAuthenticated, isLoading, isInitialized, isRiderApproved, isRiderPending } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    // Role-based redirect
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === 'rider') {
      if (isRiderApproved) {
        return <Navigate to="/rider/dashboard" replace />;
      }
      return <Navigate to="/rider/apply/status" replace />;
    }
    return <Navigate to="/menu" replace />;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Check rider approval status
  if (requireRiderApproved && user?.role === 'rider' && !isRiderApproved) {
    return <Navigate to="/rider/apply/status" replace />;
  }

  return <>{children}</>;
};
