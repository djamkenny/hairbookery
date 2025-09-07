import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useAuthPrompt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAuth = useCallback((action: () => void, redirectTo?: string) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      // Save current state to localStorage for after auth
      if (redirectTo) {
        localStorage.setItem('auth_redirect_to', redirectTo);
      }
      navigate('/login');
    }
  }, [user, navigate]);

  const executePendingAction = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  return {
    requireAuth,
    executePendingAction,
    isAuthenticated: !!user,
    user
  };
};