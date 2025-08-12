import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStylist?: boolean;
}


const ProtectedRoute = ({ children, requireStylist = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStylist, setIsStylist] = useState(false);
  const location = useLocation();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          setIsStylist(metadata.is_stylist || false);
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setIsAuthenticated(false);
        setIsStylist(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener to keep auth state updated
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          setIsStylist(metadata.is_stylist || false);
        } else {
          setIsStylist(false);
        }
        
        setLoading(false);
      }
    );

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if stylist role is required but user is not a stylist
  if (requireStylist && !isStylist) {
    return <Navigate to="/profile" replace />;
  }

  // Check if stylist is trying to access client routes
  if (!requireStylist && isStylist && location.pathname === "/profile") {
    return <Navigate to="/stylist-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
