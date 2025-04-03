
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";

export const fetchStylistAppointments = async (): Promise<Appointment[]> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    // Fetch appointments where this stylist is assigned, along with service info
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services:service_id(name)
      `)
      .eq('stylist_id', user.id)
      .is('canceled_at', null);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get all unique client IDs from the appointments
    const clientIds = [...new Set(data.map(appointment => appointment.client_id))];
    
    // Fetch client profiles in a separate query
    const { data: clientProfiles, error: clientError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', clientIds);
      
    if (clientError) {
      console.error("Error fetching client profiles:", clientError);
    }
    
    // Create a map of client profiles by ID for easy lookup
    const clientProfileMap = (clientProfiles || []).reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {} as Record<string, any>);
    
    // Format the appointments data with client info from the map
    return data.map(appointment => {
      const clientProfile = clientProfileMap[appointment.client_id] || {};
      
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
        order_id: appointment.order_id || undefined
      };
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Helper function to generate a unique order ID with client name
const generateOrderId = (clientName: string): string => {
  // Format: HB-{clientInitials}-{randomLetters}-{timestamp}
  const clientInitials = clientName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
    .padEnd(2, 'X');
    
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetters = Array.from({ length: 3 }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
  
  const timestamp = new Date().getTime().toString().slice(-6);
  return `HB-${clientInitials}-${randomLetters}-${timestamp}`;
};

export const updateAppointmentStatus = async (
  appointmentId: string, 
  newStatus: string,
  clientId: string,
  appointmentInfo?: {
    service: string;
    date: string;
    time: string;
  }
): Promise<void> => {
  try {
    // Fetch client name for order ID generation
    let clientName = "Client";
    if (newStatus === "confirmed") {
      const { data: clientData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', clientId)
        .single();
        
      if (clientData && clientData.full_name) {
        clientName = clientData.full_name;
      }
    }
    
    const updateData: any = { status: newStatus };
    
    // Generate order ID when confirming appointment
    if (newStatus === "confirmed") {
      updateData.order_id = generateOrderId(clientName);
    }
    
    // Update appointment status
    const { error, data } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select('order_id');
    
    if (error) throw error;
    
    // Send notification to client if confirmed
    if (newStatus === "confirmed" && appointmentInfo) {
      const orderIdData = data && data[0] ? data[0] : null;
      const orderIdMessage = orderIdData && orderIdData.order_id ? 
        ` Your order ID is: ${orderIdData.order_id}. Please keep this for reference.` : '';
        
      const message = `Your appointment for ${appointmentInfo.service} on ${appointmentInfo.date} at ${appointmentInfo.time} has been confirmed.${orderIdMessage}`;
      
      // Create notification in the notifications table
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: clientId,
          message: message,
          type: 'appointment_confirmed',
          is_read: false,
          related_id: appointmentId
        }]);
        
      if (notificationError) {
        console.error("Error sending notification:", notificationError);
      }
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};
