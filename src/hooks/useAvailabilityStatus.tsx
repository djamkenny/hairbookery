
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityStatus {
  available: boolean;
  status: 'available' | 'full' | 'unavailable';
  reason?: string;
  appointments_count?: number;
  daily_limit?: number;
  slots_remaining?: number;
  stylist_available: boolean; // Overall stylist availability (not date-specific)
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

        // First check the stylist's basic availability setting (public-safe RPC)
        const { data: rpcData, error: profileError } = await supabase
          .rpc('get_public_stylists', { p_id: stylistId });
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }
        
        const profileData: any = Array.isArray(rpcData) ? rpcData[0] : null;

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        // If stylist has availability turned off, return unavailable immediately
        if (!profileData?.availability) {
          setAvailabilityStatus({
            available: false,
            status: 'unavailable',
            reason: 'Stylist is currently unavailable',
            stylist_available: false
          });
          return;
        }

        // If availability is on, check detailed availability via RPC
        const dateToCheck = checkDate ? checkDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase.rpc('check_stylist_availability', {
          stylist_uuid: stylistId,
          check_date: dateToCheck
        });

        if (error) throw error;
        
        // Properly type cast the response data and add stylist_available flag
        const availabilityData = data as unknown as AvailabilityStatus;
        setAvailabilityStatus({
          ...availabilityData,
          stylist_available: true // Stylist is available overall, just might be full for this date
        });
      } catch (err: any) {
        console.error("Error fetching availability status:", err);
        setError(err.message);
        setAvailabilityStatus({
          available: false,
          status: 'unavailable',
          reason: 'Unable to check availability',
          stylist_available: true // Assume stylist is available unless we know otherwise
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [stylistId, checkDate]);

  const refetch = async () => {
    if (stylistId) {
      try {
        setLoading(true);
        
        // First check the stylist's basic availability setting (public-safe RPC)
        const { data: rpcData, error: profileError } = await supabase
          .rpc('get_public_stylists', { p_id: stylistId });

        if (profileError) throw profileError;
        const profileData: any = Array.isArray(rpcData) ? rpcData[0] : null;

        if (profileError) throw profileError;

        // If stylist has availability turned off, return unavailable immediately
        if (!profileData?.availability) {
          setAvailabilityStatus({
            available: false,
            status: 'unavailable',
            reason: 'Stylist is currently unavailable',
            stylist_available: false
          });
          return;
        }

        // If availability is on, check detailed availability via RPC
        const dateToCheck = checkDate ? checkDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase.rpc('check_stylist_availability', {
          stylist_uuid: stylistId,
          check_date: dateToCheck
        });

        if (error) throw error;
        const availabilityData = data as unknown as AvailabilityStatus;
        setAvailabilityStatus({
          ...availabilityData,
          stylist_available: true // Stylist is available overall, just might be full for this date
        });
      } catch (err: any) {
        setError(err.message);
        setAvailabilityStatus({
          available: false,
          status: 'unavailable',
          reason: 'Unable to check availability',
          stylist_available: true // Assume stylist is available unless we know otherwise
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return { availabilityStatus, loading, error, refetch };
};
