import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../../context/AuthContext";

// Staff/backoffice roles — ye log /admin pe jaate hain
const BACKOFFICE_ROLES: UserRole[] = ["admin", "manager", "hr", "rider", "staff"];

const ProtectedRoute = ({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: UserRole[];
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper pt-40 text-center text-muted">
        Loading your session...
      </div>
    );
  }

  // Login nahi hai to login page pe bhejo
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Agar role allowed list mein nahi hai to correct dashboard pe redirect karo
  if (allow && !allow.includes(user.role)) {
    // Backoffice users (admin/manager/staff/rider) hamesha /admin pe jaayenge
    if (BACKOFFICE_ROLES.includes(user.role)) {
      return <Navigate to="/admin" replace />;
    }
    // Regular customers (user) hamesha /profile pe jaayenge
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
