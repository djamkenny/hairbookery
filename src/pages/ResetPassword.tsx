
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
    };

    checkSession();
  }, [navigate]);

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
