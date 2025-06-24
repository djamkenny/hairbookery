
import { supabase } from "@/integrations/supabase/client";

export interface DetailedUser {
  id: string;
  full_name: string;
  email: string;
  is_stylist: boolean;
  created_at: string;
}

export interface DetailedAppointment {
  id: string;
  order_id: string;
  client_name: string;
  stylist_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

export interface DetailedPayment {
  id: string;
  amount: number;
  status: string;
  user_name: string;
  service_name: string;
  created_at: string;
}

export const adminDataService = {
  async getAllUsers(): Promise<DetailedUser[]> {
    try {
      console.log('Fetching all users from profiles table...');
      
      // First try to get from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_stylist, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching from profiles:', profilesError);
      }

      console.log('Profiles data:', profilesData);

      // Also try to get from auth.users via a different approach
      // Since we can't directly access auth.users, let's try to get more comprehensive data
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
      } else {
        console.log('Auth users data:', authData?.users?.length || 0, 'users found');
      }

      // Combine and deduplicate data
      const allUsers = new Map<string, DetailedUser>();

      // Add profile data
      if (profilesData) {
        profilesData.forEach(profile => {
          allUsers.set(profile.id, {
            id: profile.id,
            full_name: profile.full_name || 'Unknown',
            email: profile.email || 'No email',
            is_stylist: profile.is_stylist || false,
            created_at: profile.created_at
          });
        });
      }

      // Add auth users data if available and not already in profiles
      if (authData?.users) {
        authData.users.forEach(user => {
          if (!allUsers.has(user.id)) {
            allUsers.set(user.id, {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
              email: user.email || 'No email',
              is_stylist: user.user_metadata?.is_stylist || false,
              created_at: user.created_at
            });
          }
        });
      }

      const result = Array.from(allUsers.values());
      console.log('Total users found:', result.length);
      
      return result;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      
      // Fallback: try a simpler query
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('*');
          
        console.log('Fallback query result:', fallbackData?.length || 0, 'users');
        
        if (fallbackData) {
          return fallbackData.map(profile => ({
            id: profile.id,
            full_name: profile.full_name || 'Unknown',
            email: profile.email || 'No email',
            is_stylist: profile.is_stylist || false,
            created_at: profile.created_at
          }));
        }
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
      }
      
      return [];
    }
  },

  async getAllAppointments(): Promise<DetailedAppointment[]> {
    try {
      console.log('Fetching all appointments...');
      
      // First get all appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        return [];
      }

      console.log('Raw appointments found:', appointments?.length || 0);

      if (!appointments || appointments.length === 0) {
        return [];
      }

      // Get all unique user IDs from appointments
      const userIds = [...new Set([
        ...appointments.map(apt => apt.client_id),
        ...appointments.map(apt => apt.stylist_id)
      ])].filter(Boolean);

      // Get all unique service IDs
      const serviceIds = [...new Set(appointments.map(apt => apt.service_id))].filter(Boolean);

      console.log('Fetching profiles for user IDs:', userIds.length);
      console.log('Fetching services for service IDs:', serviceIds.length);

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name')
        .in('id', serviceIds);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      }

      // Create lookup maps
      const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      const servicesMap = new Map(services?.map(s => [s.id, s.name]) || []);

      console.log('Profiles map size:', profilesMap.size);
      console.log('Services map size:', servicesMap.size);

      // Combine data
      const result = appointments.map(appointment => ({
        id: appointment.id,
        order_id: appointment.order_id || 'N/A',
        client_name: profilesMap.get(appointment.client_id) || 'Unknown',
        stylist_name: profilesMap.get(appointment.stylist_id) || 'Unknown',
        service_name: servicesMap.get(appointment.service_id) || 'Unknown',
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        created_at: appointment.created_at
      }));

      console.log('Processed appointments:', result.length);
      return result;
    } catch (error) {
      console.error('Error in getAllAppointments:', error);
      return [];
    }
  },

  async getAllPayments(): Promise<DetailedPayment[]> {
    try {
      console.log('Fetching all payments...');
      
      // First get all payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        return [];
      }

      console.log('Raw payments found:', payments?.length || 0);

      if (!payments || payments.length === 0) {
        return [];
      }

      // Get unique user IDs and service IDs
      const userIds = [...new Set(payments.map(p => p.user_id))].filter(Boolean);
      const serviceIds = [...new Set(payments.map(p => p.service_id))].filter(Boolean);

      console.log('Fetching profiles for payment user IDs:', userIds.length);
      console.log('Fetching services for payment service IDs:', serviceIds.length);

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles for payments:', profilesError);
      }

      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name')
        .in('id', serviceIds);

      if (servicesError) {
        console.error('Error fetching services for payments:', servicesError);
      }

      // Create lookup maps
      const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      const servicesMap = new Map(services?.map(s => [s.id, s.name]) || []);

      console.log('Payment profiles map size:', profilesMap.size);
      console.log('Payment services map size:', servicesMap.size);

      // Combine data
      const result = payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        user_name: profilesMap.get(payment.user_id) || 'Unknown',
        service_name: servicesMap.get(payment.service_id) || 'Unknown',
        created_at: payment.created_at
      }));

      console.log('Processed payments:', result.length);
      return result;
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return [];
    }
  }
};
