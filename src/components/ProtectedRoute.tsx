import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireOfficial?: boolean;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireOfficial = false,
  allowedRoles 
}: ProtectedRouteProps) => {
  const { isAuthenticated, profile, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 p-8">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireOfficial && userRole !== 'official' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;