import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export const ProtectedRoute = ({ children }: any) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
