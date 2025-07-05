
import React from "react";
import { useSecurityMiddleware } from "@/hooks/useSecurityMiddleware";
import AdminSupportDashboard from "@/components/customer-service/AdminSupportDashboard";

const AdminSupportPage = () => {
  const { isAuthorized } = useSecurityMiddleware(true);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSupportDashboard />
    </div>
  );
};

export default AdminSupportPage;
