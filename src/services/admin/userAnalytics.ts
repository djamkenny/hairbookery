
import { supabase } from "@/integrations/supabase/client";

export interface UserAnalytics {
  totalUsers: number;
  totalClients: number;
  totalStylists: number;
  newUsersThisMonth: number;
}

export const userAnalyticsService = {
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      console.log('Fetching comprehensive user analytics...');
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, is_stylist, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Also get auth users count for complete picture
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
      }

      console.log('Profiles found for analytics:', profiles?.length || 0);
      console.log('Auth users found:', authUsers?.users?.length || 0);

      // Get unique client IDs from appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('client_id');

      if (appointmentsError) {
        console.error('Error fetching appointments for client count:', appointmentsError);
      }

      const uniqueClientIds = new Set(appointments?.map(a => a.client_id) || []);
      console.log('Unique client IDs from appointments:', uniqueClientIds.size);

      // Use the higher count between profiles and auth users
      const totalUsers = Math.max(profiles?.length || 0, authUsers?.users?.length || 0);
      const totalStylists = profiles?.filter(p => p.is_stylist).length || 0;
      
      // Count actual clients (non-stylists from profiles + unique clients from appointments)
      const profileClients = profiles?.filter(p => !p.is_stylist).length || 0;
      const appointmentClients = uniqueClientIds.size;
      
      // Use the higher count as the total clients
      const totalClients = Math.max(profileClients, appointmentClients);

      // Calculate new users this month from both sources
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const newUsersFromProfiles = profiles?.filter(p => 
        new Date(p.created_at) >= thisMonth
      ).length || 0;

      const newUsersFromAuth = authUsers?.users?.filter(u => 
        new Date(u.created_at) >= thisMonth
      ).length || 0;

      const newUsersThisMonth = Math.max(newUsersFromProfiles, newUsersFromAuth);

      const result = {
        totalUsers,
        totalClients,
        totalStylists,
        newUsersThisMonth
      };

      console.log('User Analytics Result:', result);
      return result;
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      return { totalUsers: 0, totalClients: 0, totalStylists: 0, newUsersThisMonth: 0 };
    }
  }
};
