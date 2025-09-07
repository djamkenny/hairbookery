
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EmailConfirmationAlert from "./EmailConfirmationAlert";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailConfirmationError, setEmailConfirmationError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    setEmailConfirmationError(false);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        
        // Handle different types of authentication errors
        if (error.message?.includes("Invalid login credentials") || error.message?.includes("invalid_credentials")) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message?.includes("Email not confirmed")) {
          setEmailConfirmationError(true);
          toast.error("Please confirm your email before logging in.");
        } else if (error.message?.includes("Too many requests")) {
          toast.error("Too many login attempts. Please wait a moment and try again.");
        } else if (error.message?.includes("User not found")) {
          toast.error("No account found with this email address. Please check your email or sign up for a new account.");
        } else {
          // Generic error message for other cases
          toast.error(error.message || "Login failed. Please try again.");
        }
        return;
      }
      
      if (data.user) {
        toast.success("Successfully logged in!");
        
        // Check if there's a redirect URL from the auth prompt
        const redirectTo = localStorage.getItem('auth_redirect_to');
        if (redirectTo) {
          localStorage.removeItem('auth_redirect_to');
          navigate(redirectTo);
          return;
        }
        
        // Redirect based on user role
        const metadata = data.user?.user_metadata || {};
        if (metadata.is_stylist) {
          navigate("/stylist-dashboard");
        } else {
          navigate("/profile");
        }
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {emailConfirmationError && (
        <EmailConfirmationAlert 
          email={email} 
          isSubmitting={isSubmitting} 
          setIsSubmitting={setIsSubmitting}
        />
      )}
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && !emailConfirmationError ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
