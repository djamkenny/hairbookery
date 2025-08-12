import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

const Auth0SignUpButton: React.FC<{ label?: string }> = ({ label = "Sign up with Auth0" }) => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  return (
    <Button
      type="button"
      className="w-full"
      disabled={isLoading || isAuthenticated}
      onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })}
    >
      {label}
    </Button>
  );
};

export default Auth0SignUpButton;
