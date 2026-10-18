import { Navigate, Outlet, useLocation } from "react-router-dom";

import { tokenService } from "@/services/token.service";

const ProtectedRoute = () => {
  const token = tokenService.getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

