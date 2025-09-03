
import { supabase } from "@/integrations/supabase/client";

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  canceledBookings: number;
  totalRevenue: number;
  bookingsThisMonth: number;
}

export const bookingAnalyticsService = {
  async getBookingAnalytics(): Promise<BookingAnalytics> {
    try {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, status, created_at');

      if (appointmentsError) {
        throw appointmentsError;
      }

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .eq('status', 'completed');

      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue_tracking')
        .select('booking_fee, total_revenue');

      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select('platform_fee, gross_amount');

      const totalBookings = appointments?.length || 0;
      const completedBookings = appointments?.filter(a => a.status === 'completed').length || 0;
      const pendingBookings = appointments?.filter(a => a.status === 'pending').length || 0;
      const canceledBookings = appointments?.filter(a => a.status === 'canceled').length || 0;

      // Calculate total platform revenue from multiple sources
      let totalRevenue = 0;

      // Add revenue from booking fees in revenue_tracking
      const revenueFromBookingFees = revenueData?.reduce((sum, record) => {
        return sum + (parseFloat(record.booking_fee?.toString() || '0'));
      }, 0) || 0;

      // Add platform fees from specialist_earnings (convert from cents)
      const revenueFromPlatformFees = earnings?.reduce((sum, earning) => {
        return sum + ((earning.platform_fee || 0) / 100);
      }, 0) || 0;

      // Add 15% of completed payments as estimated platform revenue (convert from cents)
      const revenueFromPayments = payments?.reduce((sum, payment) => {
        return sum + ((payment.amount || 0) * 0.15 / 100);
      }, 0) || 0;

      totalRevenue = revenueFromBookingFees + revenueFromPlatformFees + revenueFromPayments;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const bookingsThisMonth = appointments?.filter(a => 
        new Date(a.created_at) >= thisMonth
      ).length || 0;

      return {
        totalBookings,
        completedBookings,
        pendingBookings,
        canceledBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        bookingsThisMonth
      };
    } catch (error) {
      return { 
        totalBookings: 0, 
        completedBookings: 0, 
        pendingBookings: 0, 
        canceledBookings: 0, 
        totalRevenue: 0, 
        bookingsThisMonth: 0 
      };
    }
  }
};
