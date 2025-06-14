
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
    // Try to fetch earnings data for actual revenue calculation
    let earnings: any[] = [];
    try {
      const { data: earningsData, error: earningsError } = await supabase
        .rpc('get_stylist_earnings', { stylist_uuid: stylistId });

      if (earningsError) {
        console.log("RPC function not available yet, using fallback method");
        // Fallback: try to query the table directly using any to bypass type checking
        try {
          const { data: fallbackEarnings, error: fallbackError } = await (supabase as any)
            .from('specialist_earnings')
            .select('*')
            .eq('stylist_id', stylistId)
            .order('created_at', { ascending: false });
          
          if (fallbackError) {
            console.log("Specialist earnings table not available yet");
            earnings = [];
          } else {
            earnings = fallbackEarnings || [];
          }
        } catch (fallbackErr) {
          console.log("Direct table query failed, proceeding without earnings data");
          earnings = [];
        }
      } else {
        earnings = earningsData || [];
      }
    } catch (err) {
      console.log("Earnings data not available yet, proceeding with basic analytics");
      earnings = [];
    }

    // Fetch appointments with service details for booking counts
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        service_id,
        appointment_date,
        status,
        services:service_id(name)
      `)
      .eq('stylist_id', stylistId)
      .is('canceled_at', null);

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
    
    // Calculate total actual revenue from earnings (in pesewas, convert to cedis)
    const totalRevenue = earnings.reduce((sum: number, earning: any) => 
      sum + (earning.net_amount || 0), 0) / 100;

    // Process appointments for booking counts
    appointments.forEach(appointment => {
      const service = appointment.services;
      if (!service) return;

      const serviceName = service.name;
      const appointmentDate = new Date(appointment.appointment_date);
      const monthKey = appointmentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Update service booking counts
      if (serviceStatsMap.has(serviceName)) {
        const existing = serviceStatsMap.get(serviceName)!;
        existing.bookingCount += 1;
      } else {
        serviceStatsMap.set(serviceName, {
          serviceName,
          bookingCount: 1,
          totalRevenue: 0 // Will be calculated from earnings below
        });
      }

      // Update monthly booking counts
      if (monthlyStatsMap.has(monthKey)) {
        const existing = monthlyStatsMap.get(monthKey)!;
        existing.bookings += 1;
      } else {
        monthlyStatsMap.set(monthKey, {
          month: monthKey,
          bookings: 1,
          revenue: 0 // Will be calculated from earnings below
        });
      }
    });

    // Calculate actual revenue per service and month from earnings
    if (earnings && earnings.length > 0) {
      earnings.forEach((earning: any) => {
        if (!earning.appointment_id) return;

        // Find the appointment to get service and date info
        const appointment = appointments.find(apt => apt.id === earning.appointment_id);
        if (!appointment || !appointment.services) return;

        const serviceName = appointment.services.name;
        const earnedAmount = (earning.net_amount || 0) / 100; // Convert to cedis
        const appointmentDate = new Date(appointment.appointment_date);
        const monthKey = appointmentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // Add to service revenue
        if (serviceStatsMap.has(serviceName)) {
          const existing = serviceStatsMap.get(serviceName)!;
          existing.totalRevenue += earnedAmount;
        }

        // Add to monthly revenue
        if (monthlyStatsMap.has(monthKey)) {
          const existing = monthlyStatsMap.get(monthKey)!;
          existing.revenue += earnedAmount;
        }
      });
    }

    // Convert maps to arrays and sort
    const serviceStats = Array.from(serviceStatsMap.values())
      .sort((a, b) => b.bookingCount - a.bookingCount);

    const monthlyStats = Array.from(monthlyStatsMap.values())
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    return {
      serviceStats,
      monthlyStats,
      totalBookings: appointments.length,
      totalRevenue // This is now actual earnings in cedis
    };
  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    throw error;
  }
};
