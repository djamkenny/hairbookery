import { supabase } from "@/integrations/supabase/client";

export interface UserAnalytics {
  totalUsers: number;
  totalClients: number;
  totalStylists: number;
  newUsersThisMonth: number;
}

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  canceledBookings: number;
  totalRevenue: number;
  bookingsThisMonth: number;
}

export interface StylistAnalytics {
  totalEarnings: number;
  averageEarnings: number;
  topStylists: Array<{
    name: string;
    earnings: number;
    bookings: number;
  }>;
}

export interface ServiceAnalytics {
  totalServices: number;
  popularServices: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export const adminAnalytics = {
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
  },

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
  },

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
  },

  async getServiceAnalytics(): Promise<ServiceAnalytics> {
    try {
      console.log('Fetching comprehensive service analytics...');
      
      // Get all services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      // Get completed appointments for service popularity
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('service_id, status')
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments for service analytics:', appointmentsError);
      }

      console.log('Service analytics data:');
      console.log('- Services found:', services?.length || 0);
      console.log('- Completed appointments for services:', appointments?.length || 0);

      const totalServices = services?.length || 0;

      // Group appointments by service
      const serviceMap = new Map();
      
      // Initialize with service info
      services?.forEach(service => {
        serviceMap.set(service.id, {
          name: service.name || 'Unknown Service',
          bookings: 0,
          revenue: 0,
          price: (service.price || 0) / 100
        });
      });

      // Count bookings and calculate revenue per service
      appointments?.forEach(appointment => {
        const serviceData = serviceMap.get(appointment.service_id);
        if (serviceData) {
          serviceData.bookings += 1;
          // Platform takes 15% of service price as revenue
          serviceData.revenue += serviceData.price * 0.15;
        }
      });

      const popularServices = Array.from(serviceMap.values())
        .filter(service => service.bookings > 0)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 10)
        .map(service => ({
          name: service.name,
          bookings: service.bookings,
          revenue: Math.round(service.revenue * 100) / 100
        }));

      const result = {
        totalServices,
        popularServices
      };

      console.log('Service Analytics Result:', result);
      return result;
    } catch (error) {
      console.error('Error in getServiceAnalytics:', error);
      return { totalServices: 0, popularServices: [] };
    }
  }
};
