
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useLoyaltyPoints = () => {
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLoyaltyPoints();
  }, []);

  const fetchLoyaltyPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Use the database function to get total points
      const { data, error } = await supabase
        .rpc('get_user_loyalty_points', { user_uuid: user.id });

      if (error) {
        console.error('Error fetching loyalty points:', error);
        return;
      }

      setLoyaltyPoints(data || 0);
    } catch (error) {
      console.error('Error in fetchLoyaltyPoints:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loyaltyPoints,
    loading,
    refreshLoyaltyPoints: fetchLoyaltyPoints
  };
};
