
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [favoriteSylists, setFavoriteSylists] = useState([]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setEmail(user.email || "");
          
          const metadata = user.user_metadata || {};
          setFullName(metadata.full_name || "");
          setPhone(metadata.phone || "");
          
          // In a real app, you would fetch appointments and favorites from your API
          // For now, leaving them as empty arrays for new users
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
  const handleCancelAppointment = (id: number) => {
    toast.success(`Appointment #${id} has been canceled`);
  };
  
  const handleRescheduleAppointment = (id: number) => {
    toast.info(`Redirecting to reschedule appointment #${id}`);
  };
  
  const removeFavoriteStylist = (id: number) => {
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
