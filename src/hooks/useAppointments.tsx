
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Appointment } from "@/types/appointment";

export const useAppointments = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  
  // Function to fetch appointments
  const fetchAppointments = async (userId: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      
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
          order_id
        `)
        .eq('client_id', userId);
      
      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        return;
      }
      
      if (!appointmentsData || appointmentsData.length === 0) {
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
          console.error("Error fetching stylists:", stylistsError);
        } else if (stylistsData) {
          // Create a map of stylist IDs to names
          stylistProfiles = stylistsData.reduce((acc, stylist) => {
            acc[stylist.id] = stylist.full_name || 'Stylist';
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
        stylist: stylistProfiles[apt.stylist_id] || 'Stylist',
        date: format(new Date(apt.appointment_date), 'MMMM dd, yyyy'),
        time: apt.appointment_time,
        status: apt.status,
        client_id: userId,
        order_id: apt.order_id
      }));
      
      // Split into upcoming and past appointments
      const upcoming = formattedAppointments.filter(apt => 
        new Date(apt.date) >= today && apt.status !== 'completed' && apt.status !== 'canceled'
      );
      
      const past = formattedAppointments.filter(apt => 
        new Date(apt.date) < today || apt.status === 'completed' || apt.status === 'canceled'
      );
      
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
        .channel('public:appointments')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'appointments',
            filter: `client_id=eq.${userId}`
          }, 
          (payload) => {
            console.log("Appointment changed:", payload);
            // Refetch appointments when there's a change
            fetchAppointments(userId);
            
            // Show toast notification based on the type of change
            if (payload.eventType === 'UPDATE') {
              const newStatus = payload.new.status;
              if (newStatus === 'confirmed') {
                toast.success('An appointment has been confirmed by the stylist');
              } else if (newStatus === 'completed') {
                toast.success('An appointment has been marked as completed');
              } else if (newStatus === 'canceled') {
                toast.error('An appointment has been canceled');
              }
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

  return {
    loading,
    upcomingAppointments,
    pastAppointments,
    handleCancelAppointment,
    handleRescheduleAppointment
  };
};
