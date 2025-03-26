
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmailConfirmationAlertProps {
  email: string;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmailConfirmationAlert = ({ 
  email, 
  isSubmitting, 
  setIsSubmitting 
}: EmailConfirmationAlertProps) => {

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
    } catch (error: any) {
      console.error("Error resending confirmation:", error);
      toast.error(error.message || "Failed to resend confirmation email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};

export default EmailConfirmationAlert;
