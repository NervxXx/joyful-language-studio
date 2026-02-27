import { Navigate, useLocation } from "react-router-dom";

export function RedirectToChat() {
  const { search } = useLocation();
  return <Navigate to={`/chat${search}`} replace />;
}
