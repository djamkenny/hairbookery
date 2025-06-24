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
      
      // Get all profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, is_stylist, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      console.log('Profiles found:', profiles?.length || 0);

      // Get all appointments to identify unique client users
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('client_id, created_at');

      if (appointmentsError) {
        console.error('Error fetching appointments for user analytics:', appointmentsError);
      }

      // Get unique client IDs from appointments (these are definitely clients)
      const uniqueClientIds = new Set(appointments?.map(apt => apt.client_id) || []);
      
      console.log('Unique client IDs from appointments:', uniqueClientIds.size);

      // Count users from profiles
      let totalStylists = 0;
      let profileClientIds = new Set<string>();
      let newUsersThisMonth = 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      if (profiles && profiles.length > 0) {
        totalStylists = profiles.filter(p => p.is_stylist).length;
        
        // Get client IDs from profiles (users who are not stylists)
        profiles.forEach(p => {
          if (!p.is_stylist) {
            profileClientIds.add(p.id);
          }
        });
        
        // Calculate new users this month
        newUsersThisMonth = profiles.filter(p => 
          new Date(p.created_at) >= thisMonth
        ).length;
      }

      // Combine client IDs from profiles and appointments for total unique clients
      const allClientIds = new Set([...profileClientIds, ...uniqueClientIds]);
      const totalClients = allClientIds.size;

      // Total users is the sum of all unique users (clients + stylists)
      // We use profiles count as base since it includes both, but add any missing clients from appointments
      const profileIds = new Set(profiles?.map(p => p.id) || []);
      const missingClientIds = Array.from(uniqueClientIds).filter(id => !profileIds.has(id));
      const totalUsers = (profiles?.length || 0) + missingClientIds.length;

      const result = {
        totalUsers,
        totalClients,
        totalStylists,
        newUsersThisMonth
      };

      console.log('Comprehensive User Analytics Result:', result);
      console.log('Profile clients:', profileClientIds.size);
      console.log('Appointment clients:', uniqueClientIds.size);
      console.log('Missing clients (no profile):', missingClientIds.length);
      
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
        .select('id, status, created_at, service_id');

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      }

      // Get all payments to calculate actual platform revenue
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, status, created_at');

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      console.log('Appointments found:', appointments?.length || 0);
      console.log('Payments found:', payments?.length || 0);

      const totalBookings = appointments?.length || 0;
      const completedBookings = appointments?.filter(a => a.status === 'completed').length || 0;
      const pendingBookings = appointments?.filter(a => a.status === 'pending').length || 0;
      const canceledBookings = appointments?.filter(a => a.status === 'canceled').length || 0;

      // Calculate bookings this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const bookingsThisMonth = appointments?.filter(a => 
        new Date(a.created_at) >= thisMonth
      ).length || 0;

      // Calculate platform revenue from completed payments (20% platform fee)
      const totalRevenue = payments
        ?.filter(p => p.status === 'completed')
        .reduce((sum, payment) => {
          // Platform fee is 20% of payment amount
          const platformFee = (payment.amount || 0) * 0.2;
          return sum + platformFee;
        }, 0) || 0;

      const result = {
        totalBookings,
        completedBookings,
        pendingBookings,
        canceledBookings,
        totalRevenue: Math.round(totalRevenue) / 100, // Convert from cents to GHS
        bookingsThisMonth
      };

      console.log('Comprehensive Booking Analytics Result:', result);
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
      
      // Get all earnings data
      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select('stylist_id, net_amount, gross_amount');

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      }

      // Get all stylist profiles
      const { data: stylists, error: stylistsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_stylist', true);

      if (stylistsError) {
        console.error('Error fetching stylists:', stylistsError);
      }

      // Get all completed appointments per stylist
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('stylist_id, status')
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments for stylist analytics:', appointmentsError);
      }

      console.log('Earnings found:', earnings?.length || 0);
      console.log('Stylists found:', stylists?.length || 0);
      console.log('Completed appointments found:', appointments?.length || 0);

      const totalEarnings = earnings?.reduce((sum, e) => sum + ((e.net_amount || 0) / 100), 0) || 0;
      const averageEarnings = earnings?.length ? totalEarnings / earnings.length : 0;

      // Create stylist performance map
      const stylistMap = new Map();
      
      // Initialize with stylist data
      stylists?.forEach(stylist => {
        stylistMap.set(stylist.id, {
          name: stylist.full_name || 'Unknown',
          earnings: 0,
          bookings: 0
        });
      });

      // Add earnings data (convert from cents to GHS)
      earnings?.forEach(earning => {
        const stylistData = stylistMap.get(earning.stylist_id);
        if (stylistData) {
          stylistData.earnings += (earning.net_amount || 0) / 100;
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

      const result = {
        totalEarnings,
        averageEarnings,
        topStylists
      };

      console.log('Comprehensive Stylist Analytics Result:', result);
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
      }

      // Get all completed appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('service_id, status')
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments for service analytics:', appointmentsError);
      }

      console.log('Services found:', services?.length || 0);
      console.log('Completed appointments for services found:', appointments?.length || 0);

      const totalServices = services?.length || 0;

      // Create service analytics map
      const serviceMap = new Map();
      services?.forEach(service => {
        serviceMap.set(service.id, {
          name: service.name,
          price: (service.price || 0) / 100, // Convert from cents to GHS
          bookings: 0,
          revenue: 0
        });
      });

      // Count bookings and calculate revenue for each service
      appointments?.forEach(appointment => {
        const service = serviceMap.get(appointment.service_id);
        if (service) {
          service.bookings += 1;
          service.revenue += (service.price * 0.2); // Platform fee (20%)
        }
      });

      const popularServices = Array.from(serviceMap.values())
        .filter(service => service.bookings > 0)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      const result = {
        totalServices,
        popularServices
      };

      console.log('Comprehensive Service Analytics Result:', result);
      return result;
    } catch (error) {
      console.error('Error in getServiceAnalytics:', error);
      return { totalServices: 0, popularServices: [] };
    }
  }
};
