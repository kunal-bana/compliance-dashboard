import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type React from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { isAuthenticated, isAuthChecked } = useSelector(
    (state: any) => state.auth
  );
  const location = useLocation();

  if (!isAuthChecked) {
    return null; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

