
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
      console.log('Fetching all users...');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_stylist, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Users fetched:', profiles?.length || 0);

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
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          order_id,
          appointment_date,
          appointment_time,
          status,
          created_at,
          client:profiles!appointments_client_id_fkey(full_name),
          stylist:profiles!appointments_stylist_id_fkey(full_name),
          service:services!appointments_service_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log('Appointments fetched:', appointments?.length || 0);

      return appointments?.map(appointment => ({
        id: appointment.id,
        order_id: appointment.order_id || 'N/A',
        client_name: appointment.client?.full_name || 'Unknown',
        stylist_name: appointment.stylist?.full_name || 'Unknown',
        service_name: appointment.service?.name || 'Unknown',
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
      
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          created_at,
          user:profiles!payments_user_id_fkey(full_name),
          service:services!payments_service_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      console.log('Payments fetched:', payments?.length || 0);

      return payments?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        user_name: payment.user?.full_name || 'Unknown',
        service_name: payment.service?.name || 'Unknown',
        created_at: payment.created_at
      })) || [];
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return [];
    }
  }
};
