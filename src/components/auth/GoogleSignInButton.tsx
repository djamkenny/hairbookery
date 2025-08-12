import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface GoogleSignInButtonProps {
  label?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label = "Continue with Google" }) => {
  const handleGoogleLogin = async () => {
    const redirectTo = `${window.location.origin}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          // request basic email/profile scopes
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      // Optional: add a toast here if your app uses it
    }
  };

  return (
    <Button type="button" className="w-full" onClick={handleGoogleLogin}>
      {label}
    </Button>
  );
};

export default GoogleSignInButton;
