
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
      // Get all profiles data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, is_stylist, created_at');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      const totalUsers = profiles?.length || 0;
      const totalClients = profiles?.filter(p => !p.is_stylist).length || 0;
      const totalStylists = profiles?.filter(p => p.is_stylist).length || 0;
      
      // Calculate new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const newUsersThisMonth = profiles?.filter(p => 
        new Date(p.created_at) >= thisMonth
      ).length || 0;

      return {
        totalUsers,
        totalClients,
        totalStylists,
        newUsersThisMonth
      };
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      return { totalUsers: 0, totalClients: 0, totalStylists: 0, newUsersThisMonth: 0 };
    }
  },

  async getBookingAnalytics(): Promise<BookingAnalytics> {
    try {
      // Get appointments with service pricing data
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id, 
          status, 
          created_at,
          service_id:services(price)
        `);

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

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

      // Calculate platform revenue (20% of completed bookings)
      const totalRevenue = appointments
        ?.filter(a => a.status === 'completed')
        .reduce((sum, appointment) => {
          const servicePrice = appointment.service_id?.price || 0;
          return sum + (servicePrice * 0.2); // 20% platform fee
        }, 0) || 0;

      return {
        totalBookings,
        completedBookings,
        pendingBookings,
        canceledBookings,
        totalRevenue,
        bookingsThisMonth
      };
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
      // Get stylist earnings data
      const { data: earnings, error: earningsError } = await supabase
        .from('specialist_earnings')
        .select('stylist_id, net_amount');

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
        throw earningsError;
      }

      // Get stylist profile data
      const { data: stylists, error: stylistsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_stylist', true);

      if (stylistsError) {
        console.error('Error fetching stylists:', stylistsError);
        throw stylistsError;
      }

      // Get appointment counts per stylist
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('stylist_id, status')
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      }

      const totalEarnings = earnings?.reduce((sum, e) => sum + e.net_amount, 0) || 0;
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

      // Add earnings data
      earnings?.forEach(earning => {
        const stylistData = stylistMap.get(earning.stylist_id);
        if (stylistData) {
          stylistData.earnings += earning.net_amount;
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

      return {
        totalEarnings,
        averageEarnings,
        topStylists
      };
    } catch (error) {
      console.error('Error in getStylistAnalytics:', error);
      return { totalEarnings: 0, averageEarnings: 0, topStylists: [] };
    }
  },

  async getServiceAnalytics(): Promise<ServiceAnalytics> {
    try {
      // Get all services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      // Get completed appointments with service data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('service_id, status')
        .eq('status', 'completed');

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      const totalServices = services?.length || 0;

      // Create service analytics map
      const serviceMap = new Map();
      services?.forEach(service => {
        serviceMap.set(service.id, {
          name: service.name,
          price: service.price,
          bookings: 0,
          revenue: 0
        });
      });

      // Count bookings and calculate revenue for each service
      appointments?.forEach(appointment => {
        const service = serviceMap.get(appointment.service_id);
        if (service) {
          service.bookings += 1;
          service.revenue += service.price * 0.2; // Platform fee (20%)
        }
      });

      const popularServices = Array.from(serviceMap.values())
        .filter(service => service.bookings > 0)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      return {
        totalServices,
        popularServices
      };
    } catch (error) {
      console.error('Error in getServiceAnalytics:', error);
      return { totalServices: 0, popularServices: [] };
    }
  }
};
