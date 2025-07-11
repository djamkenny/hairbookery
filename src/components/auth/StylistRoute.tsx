
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface StylistRouteProps {
  children: React.ReactNode;
}

const StylistRoute = ({ children }: StylistRouteProps) => {
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

    // Set up auth state listener
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

  if (!isStylist) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default StylistRoute;
