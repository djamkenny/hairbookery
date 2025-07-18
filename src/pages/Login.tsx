
import React from "react";
import { Link } from "react-router-dom";
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
      
      <div className="text-center text-sm mt-4 space-y-2 px-4">
        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-1 space-y-1 sm:space-y-0">
          <span>Don't have an account?</span>
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-1 space-y-1 sm:space-y-0">
          <span>Are you an administrator?</span>
          <Link to="/admin-login" className="text-primary hover:underline font-medium">
            Admin Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
