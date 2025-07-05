
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const metadata = session.user.user_metadata || {};
        if (metadata.is_stylist) {
          navigate("/stylist-dashboard");
        } else {
          navigate("/profile");
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  return { user };
};
