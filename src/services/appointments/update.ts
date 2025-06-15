
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    
    // Process earnings when appointment is completed by calling edge function
    if (newStatus === "completed") {
      // Ensure the corresponding payment is marked as 'completed'.
      // This makes the earnings processing more robust and less dependent on webhook timing.
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('appointment_id', appointmentId);
      
      if (paymentError) {
        console.error("Error updating payment status to completed:", paymentError);
        // We'll still attempt to process earnings, but log this issue.
        toast.warning("Could not automatically update payment status, earnings might be delayed.");
      }

      console.log("Triggering earnings processing for completed appointment:", appointmentId);
      const { error: earningsError } = await supabase.functions.invoke('process-earnings', {
        body: { appointment_id: appointmentId }
      });

      if (earningsError) {
        // Log the error but don't block the UI flow. The user will be notified via toast.
        console.error("Error invoking process-earnings function:", earningsError);
        toast.error("An error occurred while processing earnings. The support team has been notified.");
      } else {
        toast.success("Appointment completed. Earnings are being processed.");
      }
    }
    
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
