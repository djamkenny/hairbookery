import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface GoogleSignInButtonProps {
  label?: string;
  isStylist?: boolean;
  redirectPath?: string; // Optional custom redirect path
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label = "Continue with Google", isStylist = false, redirectPath }) => {
  const handleGoogleLogin = async () => {
    try {
      const origin = window.location.origin;
      const redirectTo = redirectPath
        ? `${origin}${redirectPath}`
        : `${origin}/auth/callback${isStylist ? "?is_stylist=1" : ""}`;

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
      }
    } catch (e) {
      console.error("Google sign-in unexpected error:", e);
    }
  };

  return (
    <Button type="button" className="w-full" onClick={handleGoogleLogin}>
      {label}
    </Button>
  );
};

export default GoogleSignInButton;
