import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="page-shell"><div className="loading-card">Loading secure workspace...</div></div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
