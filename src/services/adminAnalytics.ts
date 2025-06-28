
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
      console.log('Fetching user analytics...');
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, is_stylist, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles?.length || 0);

      const totalUsers = profiles?.length || 0;
      const totalStylists = profiles?.filter(p => p.is_stylist).length || 0;
      const totalClients = totalUsers - totalStylists;

      // Calculate new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const newUsersThisMonth = profiles?.filter(p => 
        new Date(p.created_at) >= thisMonth
      ).length || 0;

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
      console.log('Fetching booking analytics...');
      
      // Get all appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, status, created_at');

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Get platform revenue from specialist_earnings (platform fees)
      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select('platform_fee');

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      }

      console.log('Appointments fetched:', appointments?.length || 0);
      console.log('Earnings records:', earnings?.length || 0);

      const totalBookings = appointments?.length || 0;
      const completedBookings = appointments?.filter(a => a.status === 'completed').length || 0;
      const pendingBookings = appointments?.filter(a => a.status === 'pending').length || 0;
      const canceledBookings = appointments?.filter(a => a.status === 'canceled').length || 0;

      // Calculate total platform revenue from platform fees (convert from cents)
      const totalRevenue = earnings?.reduce((sum, earning) => {
        return sum + ((earning.platform_fee || 0) / 100);
      }, 0) || 0;

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

      console.log('Booking Analytics Result:', result);
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
      console.log('Fetching stylist analytics...');
      
      // Get all earnings with stylist info
      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select(`
          stylist_id,
          net_amount,
          profiles!inner(full_name)
        `);

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
        throw earningsError;
      }

      // Get appointment counts per stylist
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('stylist_id, status')
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      }

      console.log('Earnings with stylist info:', earnings?.length || 0);
      console.log('Completed appointments:', appointments?.length || 0);

      // Calculate total earnings (convert from cents)
      const totalEarnings = earnings?.reduce((sum, e) => sum + ((e.net_amount || 0) / 100), 0) || 0;
      
      // Group earnings by stylist
      const stylistMap = new Map();
      
      earnings?.forEach(earning => {
        const stylistId = earning.stylist_id;
        const stylistName = earning.profiles?.full_name || 'Unknown';
        const netAmount = (earning.net_amount || 0) / 100;
        
        if (!stylistMap.has(stylistId)) {
          stylistMap.set(stylistId, {
            name: stylistName,
            earnings: 0,
            bookings: 0
          });
        }
        
        stylistMap.get(stylistId).earnings += netAmount;
      });

      // Add booking counts
      appointments?.forEach(appointment => {
        const stylistData = stylistMap.get(appointment.stylist_id);
        if (stylistData) {
          stylistData.bookings += 1;
        }
      });

      const topStylists = Array.from(stylistMap.values())
        .filter(stylist => stylist.earnings > 0)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 5);

      const averageEarnings = topStylists.length > 0 
        ? totalEarnings / topStylists.length 
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
      console.log('Fetching service analytics...');
      
      // Get all services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      // Get completed appointments with service info
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          service_id,
          services!inner(name, price)
        `)
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      }

      console.log('Services fetched:', services?.length || 0);
      console.log('Completed appointments with services:', appointments?.length || 0);

      const totalServices = services?.length || 0;

      // Group appointments by service
      const serviceMap = new Map();
      
      appointments?.forEach(appointment => {
        const serviceName = appointment.services?.name || 'Unknown';
        const servicePrice = (appointment.services?.price || 0) / 100;
        
        if (!serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, {
            name: serviceName,
            bookings: 0,
            revenue: 0
          });
        }
        
        const serviceData = serviceMap.get(serviceName);
        serviceData.bookings += 1;
        serviceData.revenue += servicePrice * 0.15; // Platform fee (15%)
      });

      const popularServices = Array.from(serviceMap.values())
        .filter(service => service.bookings > 0)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

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
