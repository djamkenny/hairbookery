import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Scissors } from "lucide-react";

const SpecialistLogin = () => {
  // Check if user is already logged in
  useAuthRedirect();

  return (
    <AuthLayout
      title="Specialist Login"
      subtitle="Sign in to manage your appointments and grow your business"
      icon={<Scissors className="h-8 w-8 text-primary" />}
    >
      <LoginForm />
      
      <div className="px-4">
        <div className="flex items-center gap-2 my-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Or continue with Google</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleSignInButton label="Continue with Google" isStylist={true} />
      </div>

      <div className="text-center text-sm mt-4 space-y-2 px-4">
        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-1 space-y-1 sm:space-y-0">
          <span>Don't have an account?</span>
          <Link to="/stylist-register" className="text-primary hover:underline font-medium">
            Sign up as Specialist
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-1 space-y-1 sm:space-y-0">
          <span>Are you a client?</span>
          <Link to="/client-login" className="text-primary hover:underline font-medium">
            Client Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SpecialistLogin;