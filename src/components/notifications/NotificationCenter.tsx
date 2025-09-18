import React from "react";
import { RatingNotificationHandler } from "./RatingNotificationHandler";
import { SpecialistNotificationHandler } from "./SpecialistNotificationHandler";
import { useAuth } from "@/hooks/useAuth";

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [isSpecialist, setIsSpecialist] = React.useState(false);

  React.useEffect(() => {
    const checkSpecialistStatus = async () => {
      if (!user) return;
      
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_stylist, is_laundry_specialist, is_cleaning_specialist")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsSpecialist(
          profile.is_stylist || 
          profile.is_laundry_specialist || 
          profile.is_cleaning_specialist
        );
      }
    };

    checkSpecialistStatus();
  }, [user]);

  return (
    <>
      <RatingNotificationHandler />
      {isSpecialist && <SpecialistNotificationHandler />}
    </>
  );
};