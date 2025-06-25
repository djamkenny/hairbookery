
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Appointment } from "@/types/appointment";

export const useAppointments = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingDialogData, setRatingDialogData] = useState<{
    specialistId: string;
    specialistName: string;
    serviceName: string;
  } | null>(null);
  
  // Function to fetch appointments
  const fetchAppointments = async (userId: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      console.log("Fetching appointments for client:", userId);
      
      // First fetch the appointments data
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          services:service_id(name),
          stylist_id,
          order_id,
          notes
        `)
        .eq('client_id', userId)
        .is('canceled_at', null);
      
      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        return;
      }
      
      console.log("Raw client appointments data:", appointmentsData);
      
      if (!appointmentsData || appointmentsData.length === 0) {
        console.log("No appointments found for client");
        setUpcomingAppointments([]);
        setPastAppointments([]);
        setLoading(false);
        return;
      }
      
      // Get all stylist IDs to fetch their names in a separate query
      const stylistIds = appointmentsData
        .map(apt => apt.stylist_id)
        .filter(Boolean);
      
      // Only fetch stylist profiles if we have stylist IDs
      let stylistProfiles: Record<string, string> = {};
      
      if (stylistIds.length > 0) {
        const { data: stylistsData, error: stylistsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', stylistIds);
        
        if (stylistsError) {
          console.error("Error fetching specialists:", stylistsError);
        } else if (stylistsData) {
          console.log("Stylist profiles:", stylistsData);
          // Create a map of specialist IDs to names
          stylistProfiles = stylistsData.reduce((acc, profile) => {
            acc[profile.id] = profile.full_name || 'Specialist';
            return acc;
          }, {} as Record<string, string>);
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const formattedAppointments = appointmentsData.map(apt => ({
        id: apt.id,
        client: userId, // Add missing required field
        service: apt.services?.name || 'Service',
        stylist: stylistProfiles[apt.stylist_id] || 'Specialist',
        date: format(new Date(apt.appointment_date), 'MMMM dd, yyyy'),
        time: apt.appointment_time,
        status: apt.status,
        client_id: userId,
        order_id: apt.order_id || undefined
      }));
      
      console.log("Formatted client appointments:", formattedAppointments);
      
      // Split into upcoming and past appointments
      const upcoming = formattedAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate >= today && apt.status !== 'completed' && apt.status !== 'canceled';
      });
      
      const past = formattedAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate < today || apt.status === 'completed' || apt.status === 'canceled';
      });
      
      console.log("Upcoming appointments:", upcoming);
      console.log("Past appointments:", past);
      
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (error) {
      console.error("Error in fetchAppointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments(userId);
      
      // Set up real-time subscription for appointment updates
      const channel = supabase
        .channel('client_appointments')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'appointments',
            filter: `client_id=eq.${userId}`
          }, 
          (payload) => {
            console.log("Client appointment changed:", payload);
            
            // Show rating dialog when appointment is completed
            if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
              // Fetch stylist and service details for the rating dialog
              const fetchRatingDialogData = async () => {
                const { data: stylistData } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', payload.new.stylist_id)
                  .single();
                
                const { data: serviceData } = await supabase
                  .from('services')
                  .select('name')
                  .eq('id', payload.new.service_id)
                  .single();
                
                if (stylistData && serviceData) {
                  setRatingDialogData({
                    specialistId: payload.new.stylist_id,
                    specialistName: stylistData.full_name || 'Specialist',
                    serviceName: serviceData.name || 'Service'
                  });
                  setShowRatingDialog(true);
                }
              };
              
              fetchRatingDialogData();
            }
            
            // Refetch appointments when there's a change
            fetchAppointments(userId);
            
            // Show toast notification based on the type of change
            if (payload.eventType === 'UPDATE') {
              const newStatus = payload.new.status;
              const orderId = payload.new.order_id;
              
              if (newStatus === 'confirmed') {
                toast.success(
                  orderId 
                    ? `Your appointment has been confirmed. Order ID: ${orderId}`
                    : 'Your appointment has been confirmed'
                );
              } else if (newStatus === 'completed') {
                toast.success('Your appointment has been marked as completed');
              } else if (newStatus === 'canceled') {
                toast.error('Your appointment has been canceled');
              }
            } else if (payload.eventType === 'INSERT') {
              toast.success('New appointment created');
            }
          }
        )
        .subscribe();
      
      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);
  
  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // The local state will be updated via real-time subscription
      toast.success(`Appointment has been canceled`);
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error("Failed to cancel appointment");
    }
  };
  
  const handleRescheduleAppointment = (id: string) => {
    // In a real app, this would navigate to a rescheduling form
    toast.info(`Redirecting to reschedule appointment #${id}`);
  };

  const closeRatingDialog = () => {
    setShowRatingDialog(false);
    setRatingDialogData(null);
  };

  return {
    loading,
    upcomingAppointments,
    pastAppointments,
    handleCancelAppointment,
    handleRescheduleAppointment,
    showRatingDialog,
    ratingDialogData,
    closeRatingDialog
  };
};
