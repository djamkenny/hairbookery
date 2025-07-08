
import { supabase } from '@/integrations/supabase/client';

export const adminDataService = {
  getDashboardOverview: async () => {
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total bookings count
      const { count: totalBookings } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('revenue_tracking')
        .select('total_revenue');
      
      const totalRevenue = revenueData?.reduce((sum, record) => sum + (record.total_revenue || 0), 0) || 0;

      // Get active stylists count
      const { count: activeStylists } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_stylist', true)
        .eq('availability', true);

      // Get recent activity (support tickets)
      const { data: recentTickets } = await supabase
        .from('support_tickets')
        .select('subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivity = recentTickets?.map(ticket => 
        `New support ticket: ${ticket.subject} (${ticket.status})`
      ) || [];

      return {
        totalUsers: totalUsers || 0,
        totalBookings: totalBookings || 0,
        totalRevenue: totalRevenue,
        activeStylists: activeStylists || 0,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return {
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeStylists: 0,
        recentActivity: []
      };
    }
  }
};
