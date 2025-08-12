import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import StylistRegisterForm from "@/components/auth/StylistRegisterForm";
import { Scissors } from "lucide-react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const StylistRegister = () => {
  // Check if user is already logged in
  useAuthRedirect();
  
  return (
    <AuthLayout
      title="Specialist Registration"
      subtitle="Join our platform to connect with clients and grow your business"
      icon={<Scissors className="h-8 w-8 text-primary" />}
    >
      <StylistRegisterForm />
      <div className="px-4">
        <div className="flex items-center gap-2 my-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Or</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleSignInButton isStylist />
      </div>
    </AuthLayout>
  );
};

export default StylistRegister;
