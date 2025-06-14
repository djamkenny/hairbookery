
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
    // Fetch appointments with service details for this stylist
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        service_id,
        appointment_date,
        status,
        services:service_id(name, price)
      `)
      .eq('stylist_id', stylistId)
      .is('canceled_at', null);

    if (error) throw error;

    if (!appointments || appointments.length === 0) {
      return {
        serviceStats: [],
        monthlyStats: [],
        totalBookings: 0,
        totalRevenue: 0
      };
    }

    // Group by service and calculate stats
    const serviceStatsMap = new Map<string, ServiceBookingStats>();
    const monthlyStatsMap = new Map<string, MonthlyBookingData>();
    
    let totalRevenue = 0;

    appointments.forEach(appointment => {
      const service = appointment.services;
      if (!service) return;

      const serviceName = service.name;
      const price = Number(service.price) || 0;
      const appointmentDate = new Date(appointment.appointment_date);
      const monthKey = appointmentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Update service stats
      if (serviceStatsMap.has(serviceName)) {
        const existing = serviceStatsMap.get(serviceName)!;
        existing.bookingCount += 1;
        existing.totalRevenue += price;
      } else {
        serviceStatsMap.set(serviceName, {
          serviceName,
          bookingCount: 1,
          totalRevenue: price
        });
      }

      // Update monthly stats
      if (monthlyStatsMap.has(monthKey)) {
        const existing = monthlyStatsMap.get(monthKey)!;
        existing.bookings += 1;
        existing.revenue += price;
      } else {
        monthlyStatsMap.set(monthKey, {
          month: monthKey,
          bookings: 1,
          revenue: price
        });
      }

      totalRevenue += price;
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
      totalRevenue
    };
  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    throw error;
  }
};
