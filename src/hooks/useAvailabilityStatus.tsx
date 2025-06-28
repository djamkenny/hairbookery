
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityStatus {
  available: boolean;
  status: 'available' | 'full' | 'unavailable';
  reason?: string;
  appointments_count?: number;
  daily_limit?: number;
  slots_remaining?: number;
}

export const useAvailabilityStatus = (stylistId: string | undefined, checkDate?: Date) => {
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stylistId) {
      setLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const dateToCheck = checkDate ? checkDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase.rpc('check_stylist_availability', {
          stylist_uuid: stylistId,
          check_date: dateToCheck
        });

        if (error) throw error;
        
        // Properly type cast the response data
        setAvailabilityStatus(data as unknown as AvailabilityStatus);
      } catch (err: any) {
        console.error("Error fetching availability status:", err);
        setError(err.message);
        setAvailabilityStatus({
          available: false,
          status: 'unavailable',
          reason: 'Unable to check availability'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [stylistId, checkDate]);

  return { availabilityStatus, loading, error, refetch: () => {
    if (stylistId) {
      const fetchAvailability = async () => {
        try {
          setLoading(true);
          const dateToCheck = checkDate ? checkDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          const { data, error } = await supabase.rpc('check_stylist_availability', {
            stylist_uuid: stylistId,
            check_date: dateToCheck
          });

          if (error) throw error;
          setAvailabilityStatus(data as unknown as AvailabilityStatus);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAvailability();
    }
  }};
};
