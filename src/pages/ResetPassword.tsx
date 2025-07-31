
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { KeyRound, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const validateResetToken = async () => {
      console.log("=== Password Reset Token Validation ===");
      setIsLoading(true);
      setErrorMessage("");

      try {
        // Get all possible URL parameters
        const params = {
          access_token: searchParams.get('access_token'),
          refresh_token: searchParams.get('refresh_token'),
          type: searchParams.get('type'),
          token: searchParams.get('token'),
          token_hash: searchParams.get('token_hash'),
          error: searchParams.get('error'),
          error_description: searchParams.get('error_description')
        };

        console.log("URL Parameters:", params);

        // Check for errors in URL
        if (params.error) {
          const errorMsg = params.error_description || params.error;
          console.error("URL contains error:", errorMsg);
          setErrorMessage(errorMsg);
          setIsValidToken(false);
          return;
        }

        // Method 1: Handle modern Supabase format (access_token + refresh_token)
        if (params.access_token && params.refresh_token) {
          console.log("Attempting session setup with access/refresh tokens");
          
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });

          if (error) {
            console.error("Session setup error:", error);
            setErrorMessage("Invalid or expired reset link. Please request a new one.");
            setIsValidToken(false);
            return;
          }

          console.log("Session established successfully:", data.user?.email);
          setIsValidToken(true);
          return;
        }

        // Method 2: Handle token_hash or token with OTP verification
        if (params.token_hash || params.token) {
          console.log("Attempting OTP verification with token");
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: params.token_hash || params.token || '',
            type: 'recovery',
          });

          if (error) {
            console.error("OTP verification error:", error);
            setErrorMessage("Invalid or expired reset link. Please request a new one.");
            setIsValidToken(false);
            return;
          }

          console.log("OTP verified successfully:", data.user?.email);
          setIsValidToken(true);
          return;
        }

        // Method 3: Check if there's already a valid session
        console.log("No tokens in URL, checking existing session");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session check error:", sessionError);
          setErrorMessage("Unable to verify reset permissions.");
          setIsValidToken(false);
          return;
        }

        if (session) {
          console.log("Valid existing session found:", session.user?.email);
          setIsValidToken(true);
          return;
        }

        // No valid tokens or session found
        console.log("No valid reset tokens or session found");
        setErrorMessage("No valid reset link found. Please request a new password reset.");
        setIsValidToken(false);

      } catch (error: any) {
        console.error("Unexpected error during token validation:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateResetToken();
  }, [searchParams]);

  // Loading state
  if (isLoading) {
    return (
      <AuthLayout
        title="Validating Reset Link"
        subtitle="Please wait while we verify your password reset request"
        icon={<KeyRound className="h-8 w-8 text-primary" />}
      >
        <Card className="animate-pulse">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Error state
  if (isValidToken === false) {
    return (
      <AuthLayout
        title="Reset Link Issue"
        subtitle="There was a problem with your password reset link"
        icon={<AlertCircle className="h-8 w-8 text-destructive" />}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Unable to Reset Password</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This usually happens when:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>The reset link has expired (links expire after 1 hour)</li>
              <li>The link has already been used</li>
              <li>The link was copied incorrectly</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => navigate("/forgot-password")} 
                className="flex-1"
              >
                Request New Reset Link
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")} 
                className="flex-1"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Success state - show password reset form
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below"
      icon={<KeyRound className="h-8 w-8 text-primary" />}
    >
      <ResetPasswordForm />
      
      <div className="text-center text-sm mt-4">
        <div>
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
