import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

const Auth0LoginButton: React.FC<{ label?: string }>= ({ label = "Continue with Auth0" }) => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  return (
    <Button
      type="button"
      className="w-full"
      disabled={isLoading || isAuthenticated}
      onClick={() => loginWithRedirect()}
    >
      {label}
    </Button>
  );
};

export default Auth0LoginButton;
