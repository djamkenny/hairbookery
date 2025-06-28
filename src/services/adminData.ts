
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
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_stylist, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Profiles data:', profiles?.slice(0, 3) || []);
      console.log('Total users found:', profiles?.length || 0);

      return profiles?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unknown',
        email: profile.email || 'No email',
        is_stylist: profile.is_stylist || false,
        created_at: profile.created_at
      })) || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  },

  async getAllAppointments(): Promise<DetailedAppointment[]> {
    try {
      console.log('Fetching all appointments...');
      
      // First get appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, order_id, appointment_date, appointment_time, status, created_at, client_id, stylist_id, service_id')
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Get all related profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get all services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      }

      console.log('Raw appointments found:', appointments?.length || 0);

      // Create lookup maps
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile.full_name || 'Unknown');
      });

      const serviceMap = new Map();
      services?.forEach(service => {
        serviceMap.set(service.id, service.name || 'Unknown');
      });

      return appointments?.map(appointment => ({
        id: appointment.id,
        order_id: appointment.order_id || 'N/A',
        client_name: profileMap.get(appointment.client_id) || 'Unknown',
        stylist_name: profileMap.get(appointment.stylist_id) || 'Unknown',
        service_name: serviceMap.get(appointment.service_id) || 'Unknown',
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        created_at: appointment.created_at
      })) || [];
    } catch (error) {
      console.error('Error in getAllAppointments:', error);
      return [];
    }
  },

  async getAllPayments(): Promise<DetailedPayment[]> {
    try {
      console.log('Fetching all payments...');
      
      // First get payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, status, created_at, user_id, service_id')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        throw paymentsError;
      }

      // Get all related profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get all services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      }

      console.log('Raw payments found:', payments?.length || 0);

      // Create lookup maps
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile.full_name || 'Unknown');
      });

      const serviceMap = new Map();
      services?.forEach(service => {
        serviceMap.set(service.id, service.name || 'Unknown');
      });

      return payments?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        user_name: profileMap.get(payment.user_id) || 'Unknown',
        service_name: serviceMap.get(payment.service_id) || 'Unknown',
        created_at: payment.created_at
      })) || [];
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return [];
    }
  }
};
