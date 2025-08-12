import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuth0 } from "@auth0/auth0-react";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthenticated: isAuth0Authenticated } = useAuth0();

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
        return;
      }

      // If Auth0 is authenticated but no Supabase session, send to profile as a safe default
      if (isAuth0Authenticated) {
        navigate("/profile");
      }
    };
    
    checkSession();
  }, [navigate, isAuth0Authenticated]);

  return { user };
};
