import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

type UserRole = 'customer' | 'rider' | 'admin';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireApprovedRider?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireApprovedRider = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized, user, isRider, isRiderApproved, isRiderPending } = useAuth();
  const location = useLocation();
  
  const role = user?.role;
  const riderStatus = user?.riderStatus;

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    switch (role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'rider':
        return <Navigate to={riderStatus === 'approved' ? '/rider/dashboard' : '/rider/status'} replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Check rider approval status
  if (requireApprovedRider && role === 'rider' && riderStatus !== 'approved') {
    return <Navigate to="/rider/status" replace />;
  }

  return <>{children}</>;
}
