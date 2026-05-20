import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "../../i18n";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: number[];
  privileges?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  roles = [],
  privileges = [],
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // ✅ WAIT until auth is fully resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        {t("legacy.checking_authentication", "Checking authentication...")}
      </div>
    );
  }

  // ✅ Redirect ONLY after loading is false
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (privileges.length > 0 && user.role !== 3) {
    const granted = Array.isArray(user.permissions) ? user.permissions : [];
    if (user.role === 1 && granted.length === 0) {
      return children;
    }
    if (granted.includes("all")) {
      return children;
    }
    const hasPrivilege = privileges.some((privilege) =>
      granted.includes(privilege),
    );
    if (!hasPrivilege) {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}
