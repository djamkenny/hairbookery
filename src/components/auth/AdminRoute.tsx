
import React from "react";
import { Navigate } from "react-router-dom";
import { adminAuth } from "@/services/adminAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAuthenticated = adminAuth.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
