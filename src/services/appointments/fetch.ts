import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";

export const fetchStylistAppointments = async (): Promise<Appointment[]> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return [];
    }
    
    console.log("Fetching appointments for stylist:", user.id);
    
    // Fetch appointments where this stylist is assigned, along with service info and payment info
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services:service_id(name),
        payments:appointment_id(amount)
      `)
      .eq('stylist_id', user.id)
      .is('canceled_at', null);
    
    if (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
    
    console.log("Raw appointments data:", data);
    
    if (!data || data.length === 0) {
      console.log("No appointments found for stylist");
      return [];
    }
    
    // Get all unique client IDs from the appointments
    const clientIds = [...new Set(data.map(appointment => appointment.client_id))];
    console.log("Client IDs to fetch:", clientIds);
    
    // Fetch client profiles in a separate query
    const { data: clientProfiles, error: clientError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', clientIds);
      
    if (clientError) {
      console.error("Error fetching client profiles:", clientError);
    }
    
    console.log("Client profiles:", clientProfiles);
    
    // Create a map of client profiles by ID for easy lookup
    const clientProfileMap = (clientProfiles || []).reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {} as Record<string, any>);
    
    // Format the appointments data with client info from the map
    const formattedAppointments = data.map(appointment => {
      const clientProfile = clientProfileMap[appointment.client_id] || {};

      // Fix: payments is an array, use the first item if exists
      let amount = 0;
      if (Array.isArray(appointment.payments) && appointment.payments.length > 0) {
        amount = appointment.payments[0]?.amount || 0;
      }

      return {
        id: appointment.id,
        client: clientProfile.full_name || 'Client',
        service: appointment.services?.name || 'Service',
        date: format(new Date(appointment.appointment_date), 'MMMM dd, yyyy'),
        time: appointment.appointment_time,
        status: appointment.status,
        clientEmail: clientProfile.email,
        clientPhone: clientProfile.phone,
        client_id: appointment.client_id,
        order_id: appointment.order_id || undefined,
        created_at: appointment.created_at,
        amount // <--- new field
      };
    });
    
    console.log("Formatted appointments:", formattedAppointments);
    return formattedAppointments;
  } catch (error) {
    console.error("Error in fetchStylistAppointments:", error);
    throw error;
  }
};
