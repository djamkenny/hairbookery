
import { useState, useEffect } from "react";
import { fetchStylistBookingAnalytics, ServiceBookingStats, MonthlyBookingData } from "@/services/analyticsService";
import { supabase } from "@/integrations/supabase/client";

export const useStylistAnalytics = () => {
  const [serviceStats, setServiceStats] = useState<ServiceBookingStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyBookingData[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const analytics = await fetchStylistBookingAnalytics(user.id);
      
      setServiceStats(analytics.serviceStats);
      setMonthlyStats(analytics.monthlyStats);
      setTotalBookings(analytics.totalBookings);
      setTotalRevenue(analytics.totalRevenue);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    serviceStats,
    monthlyStats,
    totalBookings,
    totalRevenue,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
