
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
      
      <div className="text-center text-sm mt-4 space-y-2">
        <div>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
        <div>
          Are you an administrator?{" "}
          <Link to="/admin-login" className="text-primary hover:underline">
            Admin Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
