
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
    console.log("Fetching revenue summary for stylist:", stylistId);
    
    // Use the database function for revenue summary
    const { data, error } = await supabase.rpc('get_stylist_revenue_summary', {
      stylist_uuid: stylistId
    });

    if (error) {
      console.error("Error calling revenue function:", error);
      throw error;
    }

    if (data && data.length > 0) {
      const summary = data[0];
      console.log("Revenue summary from function:", summary);
      return {
        total_revenue: Number(summary.total_revenue || 0),
        total_bookings: Number(summary.total_bookings || 0),
        total_service_revenue: Number(summary.total_service_revenue || 0),
        avg_booking_value: Number(summary.avg_booking_value || 0)
      };
    }

    // If no data from function, calculate from completed appointments as fallback
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_services(
          service_id,
          services(name, price)
        )
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
        if (appointment.appointment_services && appointment.appointment_services.length > 0) {
          appointment.appointment_services.forEach(appointmentService => {
            if (appointmentService.services && appointmentService.services.price) {
              const servicePrice = Number(appointmentService.services.price);
              totalServiceRevenue += servicePrice;
            }
          });
        }
      });

      return {
        total_revenue: totalServiceRevenue,
        total_bookings: appointments.length,
        total_service_revenue: totalServiceRevenue,
        avg_booking_value: appointments.length > 0 ? totalServiceRevenue / appointments.length : 0
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
