
import { supabase } from "@/integrations/supabase/client";

export interface StylistAnalytics {
  totalEarnings: number;
  averageEarnings: number;
  topStylists: Array<{
    name: string;
    earnings: number;
    bookings: number;
  }>;
}

export const stylistAnalyticsService = {
  async getStylistAnalytics(): Promise<StylistAnalytics> {
    try {
      console.log('Fetching comprehensive stylist analytics...');
      
      // Get all earnings
      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select('stylist_id, net_amount, gross_amount');

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
        throw earningsError;
      }

      // Get all stylists
      const { data: stylists, error: stylistsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_stylist', true);

      if (stylistsError) {
        console.error('Error fetching stylists:', stylistsError);
      }

      // Get appointment counts per stylist
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('stylist_id, status')
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments for stylist analytics:', appointmentsError);
      }

      console.log('Stylist analytics data:');
      console.log('- Earnings records:', earnings?.length || 0);
      console.log('- Stylists found:', stylists?.length || 0);
      console.log('- Completed appointments:', appointments?.length || 0);

      // Calculate total earnings (convert from cents)
      const totalEarnings = earnings?.reduce((sum, e) => sum + ((e.net_amount || 0) / 100), 0) || 0;
      
      // Group data by stylist
      const stylistMap = new Map();
      
      // Initialize with stylist info
      stylists?.forEach(stylist => {
        stylistMap.set(stylist.id, {
          name: stylist.full_name || 'Unknown Stylist',
          earnings: 0,
          bookings: 0
        });
      });

      // Add earnings data
      earnings?.forEach(earning => {
        const stylistId = earning.stylist_id;
        const netAmount = (earning.net_amount || 0) / 100;
        
        if (stylistMap.has(stylistId)) {
          stylistMap.get(stylistId).earnings += netAmount;
        }
      });

      // Add booking counts
      appointments?.forEach(appointment => {
        const stylistData = stylistMap.get(appointment.stylist_id);
        if (stylistData) {
          stylistData.bookings += 1;
        }
      });

      const topStylists = Array.from(stylistMap.values())
        .filter(stylist => stylist.earnings > 0 || stylist.bookings > 0)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 5);

      const activeStylistsCount = topStylists.length;
      const averageEarnings = activeStylistsCount > 0 
        ? totalEarnings / activeStylistsCount 
        : 0;

      const result = {
        totalEarnings,
        averageEarnings,
        topStylists
      };

      console.log('Stylist Analytics Result:', result);
      return result;
    } catch (error) {
      console.error('Error in getStylistAnalytics:', error);
      return { totalEarnings: 0, averageEarnings: 0, topStylists: [] };
    }
  }
};
