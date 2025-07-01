
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { secureAdminAuth } from "@/services/security/adminAuth";

export const useSecurityMiddleware = (requireAdmin: boolean = false) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = () => {
      if (requireAdmin) {
        const admin = secureAdminAuth.getCurrentAdmin();
        if (!admin) {
          navigate("/admin-login");
          return;
        }
        setIsAuthorized(true);
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuthorization();

    // Set up session refresh interval for admin sessions
    if (requireAdmin) {
      const interval = setInterval(() => {
        if (!secureAdminAuth.refreshSession()) {
          navigate("/admin-login");
        }
      }, 30 * 60 * 1000); // Check every 30 minutes

      return () => clearInterval(interval);
    }
  }, [requireAdmin, navigate]);

  return { isAuthorized };
};
