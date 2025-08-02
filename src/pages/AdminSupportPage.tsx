
import React from "react";
import { useSecurityMiddleware } from "@/hooks/useSecurityMiddleware";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EnhancedAdminChatInterface from "@/components/customer-service/EnhancedAdminChatInterface";

const AdminSupportPage = () => {
  const { isAuthorized } = useSecurityMiddleware(true);
  const navigate = useNavigate();

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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Admin Support</h1>
              <p className="text-sm text-muted-foreground">
                Support dashboard overview
              </p>
            </div>
          </div>
        </div>
      </header>
      <EnhancedAdminChatInterface />
    </div>
  );
};

export default AdminSupportPage;
