
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
  const [isSpecialist, setIsSpecialist] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          // Check profile table for specialist status
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_stylist, is_laundry_specialist, is_cleaning_specialist')
            .eq('id', session.user.id)
            .single();
          
          const isAnySpecialist = profile?.is_stylist || profile?.is_laundry_specialist || profile?.is_cleaning_specialist;
          setIsSpecialist(!!isAnySpecialist);
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setIsAuthenticated(false);
        setIsSpecialist(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          // Check profile table for specialist status
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_stylist, is_laundry_specialist, is_cleaning_specialist')
            .eq('id', session.user.id)
            .single();
          
          const isAnySpecialist = profile?.is_stylist || profile?.is_laundry_specialist || profile?.is_cleaning_specialist;
          setIsSpecialist(!!isAnySpecialist);
        } else {
          setIsSpecialist(false);
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

  if (!isSpecialist) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default StylistRoute;
