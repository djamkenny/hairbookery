
import { supabase } from "@/integrations/supabase/client";

export interface ServiceAnalytics {
  totalServices: number;
  popularServices: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export const serviceAnalyticsService = {
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
