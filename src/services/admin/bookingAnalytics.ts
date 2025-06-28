
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
      console.log('Fetching comprehensive booking analytics...');
      
      // Get all appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, status, created_at');

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Get all completed payments for revenue calculation
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .eq('status', 'completed');

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      // Get revenue tracking data
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue_tracking')
        .select('booking_fee, total_revenue');

      if (revenueError) {
        console.error('Error fetching revenue data:', revenueError);
      }

      // Get earnings data for platform fees
      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select('platform_fee, gross_amount');

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      }

      console.log('=== BOOKING ANALYTICS DEBUG ===');
      console.log('Appointments found:', appointments?.length || 0);
      console.log('Completed payments found:', payments?.length || 0);
      console.log('Revenue records found:', revenueData?.length || 0);
      console.log('Earnings records found:', earnings?.length || 0);

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

      console.log('Revenue calculation breakdown:');
      console.log('- From booking fees:', revenueFromBookingFees);
      console.log('- From platform fees:', revenueFromPlatformFees);
      console.log('- From payments (15%):', revenueFromPayments);
      console.log('- Total platform revenue:', totalRevenue);

      // Calculate bookings this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const bookingsThisMonth = appointments?.filter(a => 
        new Date(a.created_at) >= thisMonth
      ).length || 0;

      const result = {
        totalBookings,
        completedBookings,
        pendingBookings,
        canceledBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        bookingsThisMonth
      };

      console.log('Final Booking Analytics Result:', result);
      return result;
    } catch (error) {
      console.error('Error in getBookingAnalytics:', error);
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
