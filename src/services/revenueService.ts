
import { supabase } from "@/integrations/supabase/client";

export interface RevenueSummary {
  total_revenue: number;
  total_bookings: number;
  total_booking_fees: number;
  total_service_revenue: number;
  avg_booking_value: number;
}

export interface RevenueRecord {
  id: string;
  stylist_id: string;
  appointment_id: string | null;
  booking_fee: number;
  service_amount: number;
  total_revenue: number;
  revenue_date: string;
  created_at: string;
  updated_at: string;
}

export const fetchStylistRevenueSummary = async (stylistId: string): Promise<RevenueSummary> => {
  try {
    const { data, error } = await supabase.rpc('get_stylist_revenue_summary', {
      stylist_uuid: stylistId
    });

    if (error) {
      console.error("Error fetching revenue summary:", error);
      throw error;
    }

    // Return the first row since the function returns a single summary
    return data?.[0] || {
      total_revenue: 0,
      total_bookings: 0,
      total_booking_fees: 0,
      total_service_revenue: 0,
      avg_booking_value: 0
    };
  } catch (error) {
    console.error("Error in fetchStylistRevenueSummary:", error);
    throw error;
  }
};

export const fetchStylistRevenueRecords = async (stylistId: string): Promise<RevenueRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('revenue_tracking')
      .select('*')
      .eq('stylist_id', stylistId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching revenue records:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchStylistRevenueRecords:", error);
    throw error;
  }
};
