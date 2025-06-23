import { useState, useEffect } from "react";
import { fetchStylistRevenueSummary, RevenueSummary } from "@/services/revenueService";
import { supabase } from "@/integrations/supabase/client";

export const useStylistRevenue = (stylistId: string | undefined) => {
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary>({
    total_revenue: 0,
    total_bookings: 0,
    total_service_revenue: 0,
    avg_booking_value: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = async () => {
    if (!stylistId) return;

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching revenue for stylist:", stylistId);
      const summary = await fetchStylistRevenueSummary(stylistId);
      console.log("Revenue summary:", summary);
      setRevenueSummary(summary);
    } catch (err: any) {
      console.error("Error fetching revenue:", err);
      setError(err.message || "Failed to fetch revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [stylistId]);

  // Set up real-time subscription for revenue updates
  useEffect(() => {
    if (!stylistId) return;

    const channel = supabase
      .channel('revenue_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'revenue_tracking',
          filter: `stylist_id=eq.${stylistId}`
        }, 
        () => {
          console.log("Revenue data changed, refreshing...");
          fetchRevenue();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `stylist_id=eq.${stylistId}`
        }, 
        () => {
          console.log("Appointment data changed, refreshing revenue...");
          fetchRevenue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stylistId]);

  return {
    revenueSummary,
    loading,
    error,
    refetch: fetchRevenue
  };
};
