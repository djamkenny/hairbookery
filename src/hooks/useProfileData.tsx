
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Appointment } from "@/types/appointment";

export const useProfileData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Initialize with empty arrays for new users
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [favoriteSylists, setFavoriteSylists] = useState<any[]>([]);
  
  // Function to fetch appointments
  const fetchAppointments = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch appointments from the database
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          services:service_id(name),
          profiles:stylist_id(full_name)
        `)
        .eq('client_id', userId);
      
      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        return;
      }
      
      if (appointmentsData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const formattedAppointments = appointmentsData.map(apt => ({
          id: apt.id,
          client: userId, // Add missing required field
          service: apt.services?.name || 'Service',
          stylist: apt.profiles?.full_name || 'Stylist',
          date: format(new Date(apt.appointment_date), 'MMMM dd, yyyy'),
          time: apt.appointment_time,
          status: apt.status,
          client_id: userId
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
      }
    } catch (error) {
      console.error("Error in fetchAppointments:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          setEmail(user.email || "");
          
          const metadata = user.user_metadata || {};
          setFullName(metadata.full_name || "");
          setPhone(metadata.phone || "");
          
          // Initial fetch of appointments
          await fetchAppointments(user.id);
          
          // Set up real-time subscription for appointment updates
          const channel = supabase
            .channel('public:appointments')
            .on('postgres_changes', 
              { 
                event: '*', 
                schema: 'public', 
                table: 'appointments',
                filter: `client_id=eq.${user.id}`
              }, 
              (payload) => {
                console.log("Appointment changed:", payload);
                // Refetch appointments when there's a change
                fetchAppointments(user.id);
                
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
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
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
  
  const removeFavoriteStylist = (id: string) => {
    // In a real app, this would remove the stylist from favorites in the database
    toast.success("Stylist removed from favorites");
  };

  return {
    activeTab,
    setActiveTab,
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications,
    loading,
    user,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    upcomingAppointments,
    pastAppointments,
    favoriteSylists,
    handleCancelAppointment,
    handleRescheduleAppointment,
    removeFavoriteStylist
  };
};
