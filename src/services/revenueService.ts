
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
        let totalRevenue = 0;
        let totalBookingFees = 0;
        let totalServiceRevenue = 0;

        appointments.forEach(appointment => {
          if (appointment.services && appointment.services.price) {
            const servicePrice = Number(appointment.services.price);
            const bookingFee = servicePrice * 0.20; // 20% booking fee
            
            totalServiceRevenue += servicePrice;
            totalBookingFees += bookingFee;
            totalRevenue += servicePrice + bookingFee;
          }
        });

        return {
          total_revenue: totalRevenue,
          total_bookings: appointments.length,
          total_booking_fees: totalBookingFees,
          total_service_revenue: totalServiceRevenue,
          avg_booking_value: appointments.length > 0 ? totalRevenue / appointments.length : 0
        };
      }
    } else {
      // Calculate from revenue_tracking table
      const totalRevenue = revenueData.reduce((sum, record) => sum + Number(record.total_revenue), 0);
      const totalBookingFees = revenueData.reduce((sum, record) => sum + Number(record.booking_fee), 0);
      const totalServiceRevenue = revenueData.reduce((sum, record) => sum + Number(record.service_amount), 0);

      return {
        total_revenue: totalRevenue,
        total_bookings: revenueData.length,
        total_booking_fees: totalBookingFees,
        total_service_revenue: totalServiceRevenue,
        avg_booking_value: revenueData.length > 0 ? totalRevenue / revenueData.length : 0
      };
    }

    // Default empty response
    return {
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
