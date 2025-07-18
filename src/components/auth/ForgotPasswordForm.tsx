
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the explicit site URL for password reset
      const redirectUrl = "https://hairbookery.lovable.app/reset-password";
      console.log("Sending password reset to:", email, "with redirect:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        throw error;
      }
      
      setEmailSent(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="animate-slide-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle>Email Sent!</CardTitle>
          <CardDescription>
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please check your email and click the link to reset your password. 
            The link will expire in 1 hour.
          </p>
          <p className="text-sm text-muted-foreground">
            Don't see the email? Check your spam folder or try again.
          </p>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setEmailSent(false);
              setEmail("");
            }}
          >
            Send Another Email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending reset link...</span>
              </div>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ForgotPasswordForm;
