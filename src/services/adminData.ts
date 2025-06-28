
import { supabase } from "@/integrations/supabase/client";

export interface DetailedUser {
  id: string;
  full_name: string;
  email: string;
  is_stylist: boolean;
  created_at: string;
  phone?: string;
  location?: string;
  specialty?: string;
  experience?: string;
  bio?: string;
  avatar_url?: string;
  availability?: boolean;
  availability_status?: string;
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
  notes?: string;
}

export interface DetailedPayment {
  id: string;
  amount: number;
  status: string;
  user_name: string;
  service_name: string;
  created_at: string;
  currency: string;
  description?: string;
}

export const adminDataService = {
  async getAllUsers(): Promise<DetailedUser[]> {
    try {
      console.log('Fetching ALL users from both profiles and auth.users...');
      
      // First, get all profiles (both stylists and clients)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data found:', profiles?.length || 0);
      console.log('Sample profiles:', profiles?.slice(0, 3) || []);

      // Also fetch from auth.users to get users who might not have profiles yet
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
      }

      console.log('Auth users found:', authUsers?.users?.length || 0);

      // Create a map of profile users
      const profileUserMap = new Map();
      const allUsers: DetailedUser[] = [];

      // Add all profiles first
      profiles?.forEach(profile => {
        profileUserMap.set(profile.id, true);
        allUsers.push({
          id: profile.id,
          full_name: profile.full_name || 'Unknown User',
          email: profile.email || 'No email',
          is_stylist: profile.is_stylist || false,
          created_at: profile.created_at,
          phone: profile.phone,
          location: profile.location,
          specialty: profile.specialty,
          experience: profile.experience,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          availability: profile.availability,
          availability_status: profile.availability_status
        });
      });

      // Add auth users that don't have profiles yet
      authUsers?.users?.forEach(authUser => {
        if (!profileUserMap.has(authUser.id)) {
          allUsers.push({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown User',
            email: authUser.email || 'No email',
            is_stylist: authUser.user_metadata?.is_stylist || false,
            created_at: authUser.created_at,
            phone: authUser.user_metadata?.phone,
            location: authUser.user_metadata?.location,
            specialty: authUser.user_metadata?.specialty,
            experience: authUser.user_metadata?.experience,
            bio: authUser.user_metadata?.bio,
            avatar_url: undefined,
            availability: undefined,
            availability_status: undefined
          });
        }
      });

      // Also check for users who have made appointments but don't have profiles
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('client_id');

      if (!appointmentsError && appointments) {
        const uniqueClientIds = [...new Set(appointments.map(a => a.client_id))];
        console.log('Unique client IDs from appointments:', uniqueClientIds.length);

        for (const clientId of uniqueClientIds) {
          // Check if this client is already in our list
          const existingUser = allUsers.find(user => user.id === clientId);
          if (!existingUser) {
            // Add as a client user
            allUsers.push({
              id: clientId,
              full_name: 'Client User',
              email: 'No email available',
              is_stylist: false,
              created_at: new Date().toISOString(),
              phone: undefined,
              location: undefined,
              specialty: undefined,
              experience: undefined,
              bio: undefined,
              avatar_url: undefined,
              availability: undefined,
              availability_status: undefined
            });
          }
        }
      }

      console.log('Total users combined:', allUsers.length);
      console.log('Stylists:', allUsers.filter(u => u.is_stylist).length);
      console.log('Clients:', allUsers.filter(u => !u.is_stylist).length);

      return allUsers;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  },

  async getAllAppointments(): Promise<DetailedAppointment[]> {
    try {
      console.log('Fetching all appointments with full details...');
      
      // Get appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      console.log('Raw appointments found:', appointments?.length || 0);

      if (!appointments || appointments.length === 0) {
        console.log('No appointments found in database');
        return [];
      }

      // Get all profiles for name lookup
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error fetching profiles for appointments:', profilesError);
      }

      // Get all services for name lookup
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name');

      if (servicesError) {
        console.error('Error fetching services for appointments:', servicesError);
      }

      // Create lookup maps
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile.full_name || 'Unknown');
      });

      const serviceMap = new Map();
      services?.forEach(service => {
        serviceMap.set(service.id, service.name || 'Unknown Service');
      });

      console.log('Profile lookup map size:', profileMap.size);
      console.log('Service lookup map size:', serviceMap.size);

      return appointments.map(appointment => ({
        id: appointment.id,
        order_id: appointment.order_id || `APT-${appointment.id.slice(0, 8)}`,
        client_name: profileMap.get(appointment.client_id) || 'Unknown Client',
        stylist_name: profileMap.get(appointment.stylist_id) || 'Unknown Stylist',
        service_name: serviceMap.get(appointment.service_id) || 'Unknown Service',
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        created_at: appointment.created_at,
        notes: appointment.notes
      }));
    } catch (error) {
      console.error('Error in getAllAppointments:', error);
      return [];
    }
  },

  async getAllPayments(): Promise<DetailedPayment[]> {
    try {
      console.log('Fetching all payments with full details...');
      
      // Get payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        throw paymentsError;
      }

      console.log('Raw payments found:', payments?.length || 0);

      if (!payments || payments.length === 0) {
        console.log('No payments found in database');
        return [];
      }

      // Get all profiles for name lookup
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error fetching profiles for payments:', profilesError);
      }

      // Get all services for name lookup
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name');

      if (servicesError) {
        console.error('Error fetching services for payments:', servicesError);
      }

      // Create lookup maps
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile.full_name || 'Unknown');
      });

      const serviceMap = new Map();
      services?.forEach(service => {
        serviceMap.set(service.id, service.name || 'Unknown Service');
      });

      console.log('Payment profile lookup map size:', profileMap.size);
      console.log('Payment service lookup map size:', serviceMap.size);

      return payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        user_name: profileMap.get(payment.user_id) || 'Unknown User',
        service_name: serviceMap.get(payment.service_id) || 'Unknown Service',
        created_at: payment.created_at,
        currency: payment.currency || 'GHS',
        description: payment.description
      }));
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return [];
    }
  },

  async getAllRevenue(): Promise<any[]> {
    try {
      console.log('Fetching all revenue tracking data...');
      
      const { data: revenue, error } = await supabase
        .from('revenue_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching revenue:', error);
        throw error;
      }

      console.log('Revenue records found:', revenue?.length || 0);
      return revenue || [];
    } catch (error) {
      console.error('Error in getAllRevenue:', error);
      return [];
    }
  },

  async getAllEarnings(): Promise<any[]> {
    try {
      console.log('Fetching all specialist earnings...');
      
      const { data: earnings, error } = await supabase
        .from('specialist_earnings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching earnings:', error);
        throw error;
      }

      console.log('Earnings records found:', earnings?.length || 0);
      return earnings || [];
    } catch (error) {
      console.error('Error in getAllEarnings:', error);
      return [];
    }
  }
};
