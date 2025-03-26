
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [favoriteSylists, setFavoriteSylists] = useState<any[]>([]);
  
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
          
          // Fetch appointments from the database
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from('appointments')
            .select(`
              id,
              appointment_date,
              appointment_time,
              status,
              services:service_id(name),
              stylists:stylist_id(full_name)
            `)
            .eq('client_id', user.id);
          
          if (appointmentsError) {
            console.error("Error fetching appointments:", appointmentsError);
          } else if (appointmentsData) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            
            const formattedAppointments = appointmentsData.map(apt => ({
              id: apt.id,
              service: apt.services?.name || 'Service',
              stylist: apt.stylists?.full_name || 'Stylist',
              date: format(new Date(apt.appointment_date), 'MMMM dd, yyyy'),
              time: apt.appointment_time,
              status: apt.status
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
          
          // For favorites, we'd typically fetch from a favorites table
          // For now, we'll leave as an empty array
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
  
  const handleCancelAppointment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setUpcomingAppointments(prev => 
        prev.filter(appointment => appointment.id !== id)
      );
      
      setPastAppointments(prev => [
        ...prev,
        ...upcomingAppointments.filter(appointment => appointment.id === id)
          .map(appointment => ({ ...appointment, status: 'canceled' }))
      ]);
      
      toast.success(`Appointment has been canceled`);
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error("Failed to cancel appointment");
    }
  };
  
  const handleRescheduleAppointment = (id: number) => {
    // In a real app, this would navigate to a rescheduling form
    toast.info(`Redirecting to reschedule appointment #${id}`);
  };
  
  const removeFavoriteStylist = (id: number) => {
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
