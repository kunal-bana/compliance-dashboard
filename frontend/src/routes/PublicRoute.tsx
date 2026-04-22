import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export default function PublicRoute({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { isAuthenticated, isAuthChecked } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthChecked) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}