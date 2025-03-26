
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Sample data for appointments
const upcomingAppointments = [
  {
    id: 1,
    service: "Haircut & Styling",
    stylist: "Sophia Rodriguez",
    date: "June 15, 2023",
    time: "10:00 AM",
    status: "confirmed"
  },
  {
    id: 2,
    service: "Hair Coloring",
    stylist: "Alex Chen",
    date: "July 2, 2023",
    time: "2:00 PM",
    status: "confirmed"
  }
];

const pastAppointments = [
  {
    id: 3,
    service: "Blowout & Styling",
    stylist: "Emma Johnson",
    date: "May 20, 2023",
    time: "1:00 PM",
    status: "completed"
  },
  {
    id: 4,
    service: "Deep Conditioning",
    stylist: "Marcus Williams",
    date: "April 10, 2023",
    time: "11:00 AM",
    status: "completed"
  }
];

const favoriteSylists = [
  {
    id: 1,
    name: "Sophia Rodriguez",
    specialty: "Hair Styling",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3"
  },
  {
    id: 2,
    name: "Alex Chen",
    specialty: "Hair Coloring",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3"
  }
];

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
