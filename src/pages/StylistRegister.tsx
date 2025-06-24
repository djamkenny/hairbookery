
import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import StylistRegisterForm from "@/components/auth/StylistRegisterForm";
import { Scissors } from "lucide-react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

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
    </AuthLayout>
  );
};

export default StylistRegister;
