
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
        throw error;
      }
      
      toast.success("Successfully logged in!");
      
      // Redirect based on user role
      const metadata = data.user?.user_metadata || {};
      if (metadata.is_stylist) {
        navigate("/stylist-dashboard");
      } else {
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message?.includes("Email not confirmed")) {
        setEmailConfirmationError(true);
        toast.error("Please confirm your email before logging in.");
      } else {
        toast.error(error.message || "Invalid email or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="animate-slide-up">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
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
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
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
          
          <div className="text-center text-sm mt-2 space-y-2">
            <div>
              Don't have a client account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register as Client
              </Link>
            </div>
            <div>
              Are you a hair stylist?{" "}
              <Link to="/stylist-register" className="text-primary hover:underline">
                Register as Stylist
              </Link>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
