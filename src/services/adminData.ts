
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_stylist, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  },

  async getAllAppointments(): Promise<DetailedAppointment[]> {
    try {
      // First get all appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        return [];
      }

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

      // Combine data
      return appointments.map(appointment => ({
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
    } catch (error) {
      console.error('Error in getAllAppointments:', error);
      return [];
    }
  },

  async getAllPayments(): Promise<DetailedPayment[]> {
    try {
      // First get all payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        return [];
      }

      if (!payments || payments.length === 0) {
        return [];
      }

      // Get unique user IDs and service IDs
      const userIds = [...new Set(payments.map(p => p.user_id))].filter(Boolean);
      const serviceIds = [...new Set(payments.map(p => p.service_id))].filter(Boolean);

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

      // Combine data
      return payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        user_name: profilesMap.get(payment.user_id) || 'Unknown',
        service_name: servicesMap.get(payment.service_id) || 'Unknown',
        created_at: payment.created_at
      }));
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return [];
    }
  }
};
