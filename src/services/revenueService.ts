
import { supabase } from "@/integrations/supabase/client";

export interface RevenueSummary {
  total_revenue: number;
  total_bookings: number;
  total_service_revenue: number;
  avg_booking_value: number;
}

export interface RevenueRecord {
  id: string;
  stylist_id: string;
  appointment_id: string | null;
  service_amount: number;
  revenue_date: string;
  created_at: string;
  updated_at: string;
}

export const fetchStylistRevenueSummary = async (stylistId: string): Promise<RevenueSummary> => {
  try {
    // First try to get revenue from revenue_tracking table
    const { data: revenueData, error: revenueError } = await supabase
      .from('revenue_tracking')
      .select('*')
      .eq('stylist_id', stylistId);

    if (revenueError) {
      console.error("Error fetching revenue data:", revenueError);
    }

    // If no revenue records exist, calculate from completed appointments
    if (!revenueData || revenueData.length === 0) {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          status,
          services:service_id(price)
        `)
        .eq('stylist_id', stylistId)
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        throw appointmentsError;
      }

      if (appointments && appointments.length > 0) {
        let totalServiceRevenue = 0;

        appointments.forEach(appointment => {
          if (appointment.services && appointment.services.price) {
            const servicePrice = Number(appointment.services.price);
            totalServiceRevenue += servicePrice; // Only service price, no booking fee
          }
        });

        return {
          total_revenue: totalServiceRevenue, // Only service revenue for stylists
          total_bookings: appointments.length,
          total_service_revenue: totalServiceRevenue,
          avg_booking_value: appointments.length > 0 ? totalServiceRevenue / appointments.length : 0
        };
      }
    } else {
      // Calculate from revenue_tracking table (only service amounts)
      const totalServiceRevenue = revenueData.reduce((sum, record) => sum + Number(record.service_amount), 0);

      return {
        total_revenue: totalServiceRevenue, // Only service revenue for stylists
        total_bookings: revenueData.length,
        total_service_revenue: totalServiceRevenue,
        avg_booking_value: revenueData.length > 0 ? totalServiceRevenue / revenueData.length : 0
      };
    }

    // Default empty response
    return {
      total_revenue: 0,
      total_bookings: 0,
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
      .select('id, stylist_id, appointment_id, service_amount, revenue_date, created_at, updated_at')
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
