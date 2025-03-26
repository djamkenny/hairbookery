
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

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
};
