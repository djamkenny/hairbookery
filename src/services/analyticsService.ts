
import { supabase } from "@/integrations/supabase/client";

export interface ServiceBookingStats {
  serviceName: string;
  bookingCount: number;
  totalRevenue: number;
  avgRating?: number;
}

export interface MonthlyBookingData {
  month: string;
  bookings: number;
  revenue: number;
}

export const fetchStylistBookingAnalytics = async (stylistId: string) => {
  try {
    // Get all completed appointments with their services through appointment_services
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        appointment_services(
          service_id,
          services(name, price)
        )
      `)
      .eq('stylist_id', stylistId)
      .eq('status', 'completed');

    if (appointmentsError) throw appointmentsError;

    if (!appointments || appointments.length === 0) {
      return {
        serviceStats: [],
        monthlyStats: [],
        totalBookings: 0,
        totalRevenue: 0
      };
    }

    // Create maps for aggregation
    const serviceStatsMap = new Map<string, ServiceBookingStats>();
    const monthlyStatsMap = new Map<string, MonthlyBookingData>();
    
    let totalRevenue = 0;
    let completedBookings = 0;

    // Process appointments for booking counts and revenue
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const monthKey = appointmentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Process all services for this appointment
      if (appointment.appointment_services && appointment.appointment_services.length > 0) {
        appointment.appointment_services.forEach(appointmentService => {
          const service = appointmentService.services;
          if (!service) return;

          const serviceName = service.name;
          const servicePrice = Number(service.price || 0);

          // Calculate revenue for completed appointments (only service price, no booking fee)
          const appointmentRevenue = servicePrice;
          totalRevenue += appointmentRevenue;

          // Update service booking counts and revenue
          if (serviceStatsMap.has(serviceName)) {
            const existing = serviceStatsMap.get(serviceName)!;
            existing.bookingCount += 1;
            existing.totalRevenue += appointmentRevenue;
          } else {
            serviceStatsMap.set(serviceName, {
              serviceName,
              bookingCount: 1,
              totalRevenue: appointmentRevenue
            });
          }
        });
      }

      // Count this appointment for monthly stats (one entry per appointment, not per service)
      completedBookings++;
      const appointmentTotalRevenue = appointment.appointment_services?.reduce((sum, as) => {
        return sum + Number(as.services?.price || 0);
      }, 0) || 0;

      // Update monthly booking counts and revenue
      if (monthlyStatsMap.has(monthKey)) {
        const existing = monthlyStatsMap.get(monthKey)!;
        existing.bookings += 1;
        existing.revenue += appointmentTotalRevenue;
      } else {
        monthlyStatsMap.set(monthKey, {
          month: monthKey,
          bookings: 1,
          revenue: appointmentTotalRevenue
        });
      }
    });

    // Convert maps to arrays and sort
    const serviceStats = Array.from(serviceStatsMap.values())
      .sort((a, b) => b.bookingCount - a.bookingCount);

    const monthlyStats = Array.from(monthlyStatsMap.values())
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    return {
      serviceStats,
      monthlyStats,
      totalBookings: appointments.length,
      totalRevenue // This is now only service revenue (no booking fees)
    };
  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    throw error;
  }
};
