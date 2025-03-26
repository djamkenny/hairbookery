
import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Login = () => {
  // Check if user is already logged in
  useAuthRedirect();

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to manage your bookings"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
