
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailConfirmationError, setEmailConfirmationError] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const metadata = session.user.user_metadata || {};
        if (metadata.is_stylist) {
          navigate("/stylist-dashboard");
        } else {
          navigate("/profile");
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Confirmation email has been resent. Please check your inbox.");
      setEmailConfirmationError(false);
    } catch (error: any) {
      console.error("Error resending confirmation:", error);
      toast.error(error.message || "Failed to resend confirmation email.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container max-w-md px-4">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to manage your bookings</p>
          </div>
          
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
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                    <p className="font-medium mb-1">Email not confirmed</p>
                    <p className="mb-2">Please check your email inbox for a confirmation link.</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={handleResendConfirmation}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          <span>Resending...</span>
                        </div>
                      ) : (
                        "Resend confirmation email"
                      )}
                    </Button>
                  </div>
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
