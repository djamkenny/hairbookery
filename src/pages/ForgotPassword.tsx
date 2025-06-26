
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { KeyRound } from "lucide-react";

const ForgotPassword = () => {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
      icon={<KeyRound className="h-8 w-8 text-primary" />}
    >
      <ForgotPasswordForm />
      
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

export default ForgotPassword;
