import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "updating" | "done" | "error">("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const isStylistParam = params.get("is_stylist") === "1";

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login", { replace: true });
          return;
        }

        const currentIsStylist = Boolean(session.user.user_metadata?.is_stylist);

        if (isStylistParam && !currentIsStylist) {
          setStatus("updating");
          const { error } = await supabase.auth.updateUser({ data: { is_stylist: true } });
          if (error) throw error;
        }

        setStatus("done");
        navigate(isStylistParam || currentIsStylist ? "/stylist-dashboard" : "/profile", { replace: true });
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setMessage(err?.message || "Authentication failed");
        setStatus("error");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold">Completing sign-in...</h1>
        <p className="text-muted-foreground text-sm">
          {status === "updating" ? "Applying account role..." : status === "error" ? message : "Please wait"}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
