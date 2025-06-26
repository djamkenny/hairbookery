
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session for password reset...");
      
      // Check if we have the necessary URL parameters
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      const tokenHash = searchParams.get('token_hash');
      
      console.log("URL params:", { 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken, 
        type, 
        token: !!token,
        tokenHash: !!tokenHash 
      });
      
      // Handle different token formats from Supabase
      if (type === 'recovery') {
        if (accessToken && refreshToken) {
          // New format with access_token and refresh_token
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error("Error setting session:", error);
              toast.error("Invalid or expired reset link");
              navigate("/forgot-password");
              return;
            }
            
            console.log("Session set successfully:", data);
            setIsValidToken(true);
          } catch (error) {
            console.error("Error in session setup:", error);
            toast.error("Invalid or expired reset link");
            navigate("/forgot-password");
          }
        } else if (token || tokenHash) {
          // Legacy format with token or token_hash
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash || token || '',
              type: 'recovery',
            });
            
            if (error) {
              console.error("Error verifying token:", error);
              toast.error("Invalid or expired reset link");
              navigate("/forgot-password");
              return;
            }
            
            console.log("Token verified successfully:", data);
            setIsValidToken(true);
          } catch (error) {
            console.error("Error in token verification:", error);
            toast.error("Invalid or expired reset link");
            navigate("/forgot-password");
          }
        } else {
          console.error("Missing required parameters for password reset");
          toast.error("Invalid reset link format");
          navigate("/forgot-password");
        }
      } else {
        // Fallback: check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          toast.error("Invalid or expired reset link");
          navigate("/forgot-password");
          return;
        }
        
        if (session) {
          setIsValidToken(true);
        } else {
          toast.error("Invalid or expired reset link");
          navigate("/forgot-password");
        }
      }
    };

    checkSession();
  }, [navigate, searchParams]);

  if (isValidToken === null) {
    return (
      <AuthLayout
        title="Loading..."
        subtitle="Validating reset link"
        icon={<KeyRound className="h-8 w-8 text-primary" />}
      >
        <div className="text-center">Loading...</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below"
      icon={<KeyRound className="h-8 w-8 text-primary" />}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default ResetPassword;
