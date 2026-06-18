import React from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/common/FullScreenLoader";
import ROUTES from "./paths";

const ProtectedRoute = ({
  children,
  requiredRoles = [],
  allowRoleLess = false,
}) => {

  const { user, loading, isAuthenticating } = useAuth();

  if (loading || isAuthenticating) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  const hasRoles = Array.isArray(user.roles) && user.roles.length > 0;

  if (!hasRoles && !allowRoleLess) {
    return <Navigate to={ROUTES.accessPending} replace />;
  }

  if (requiredRoles.length > 0) {

    const userRoles = user.roles || [];

    const hasRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRole) {
      return <Navigate to={ROUTES.unauthorized} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;