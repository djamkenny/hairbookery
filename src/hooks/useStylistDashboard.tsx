import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStylistDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  
  // Dashboard stats
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get the authenticated user
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (authUser) {
          setUser(authUser);
          setEmail(authUser.email || "");
          
          // Fetch profile data from profiles table first
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "row not found" error, which we can handle
            console.error("Error fetching profile data:", profileError);
            // Fall back to user metadata
            const metadata = authUser.user_metadata || {};
            setFullName(metadata.full_name || "");
            setPhone(metadata.phone || "");
            setSpecialty(metadata.specialty || "");
            setExperience(metadata.experience || "");
            setBio(metadata.bio || "");
            setAvatarUrl(metadata.avatar_url || null);
            setLocation(metadata.location || "");
          } else if (profileData) {
            // Update state with profile data (prioritize over metadata)
            setFullName(profileData.full_name || "");
            setPhone(profileData.phone || "");
            setSpecialty(profileData.specialty || "");
            setExperience(profileData.experience || "");
            setBio(profileData.bio || "");
            setAvatarUrl(profileData.avatar_url || null);
            setLocation(profileData.location || "");
          }
          
          // Fetch appointments data (beauty, laundry, and cleaning)
          try {
            const { data: appointmentsData, error: appointmentsError } = await supabase
              .from('appointments')
              .select('*');
              
            const { data: laundryData, error: laundryError } = await supabase
              .from('laundry_orders')
              .select('*');
              
            const { data: cleaningData, error: cleaningError } = await supabase
              .from('cleaning_orders')
              .select('*');
              
            if (appointmentsError) console.error("Error fetching appointments:", appointmentsError);
            if (laundryError) console.error("Error fetching laundry orders:", laundryError);
            if (cleaningError) console.error("Error fetching cleaning orders:", cleaningError);
              
            let totalUpcoming = 0;
            let totalCompleted = 0;
            let allClients = new Set();
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Process beauty appointments
            if (appointmentsData) {
              const stylistAppointments = appointmentsData.filter(apt => 
                apt.stylist_id === authUser.id && !apt.canceled_at
              );
              
              const upcoming = stylistAppointments.filter(apt => 
                new Date(apt.appointment_date) >= today && apt.status !== 'completed'
              );
              
              const completed = stylistAppointments.filter(apt => 
                apt.status === 'completed'
              );
              
              totalUpcoming += upcoming.length;
              totalCompleted += completed.length;
              stylistAppointments.forEach(apt => allClients.add(apt.client_id));
            }
            
            // Process laundry orders
            if (laundryData) {
              const specialistOrders = laundryData.filter(order => 
                order.specialist_id === authUser.id && order.status !== 'canceled'
              );
              
              const upcoming = specialistOrders.filter(order => 
                new Date(order.pickup_date) >= today && !['delivered', 'completed'].includes(order.status)
              );
              
              const completed = specialistOrders.filter(order => 
                ['delivered', 'completed'].includes(order.status)
              );
              
              totalUpcoming += upcoming.length;
              totalCompleted += completed.length;
              specialistOrders.forEach(order => allClients.add(order.client_id));
            }
            
            // Process cleaning orders
            if (cleaningData) {
              const specialistOrders = cleaningData.filter(order => 
                order.specialist_id === authUser.id && order.status !== 'canceled'
              );
              
              const upcoming = specialistOrders.filter(order => 
                new Date(order.service_date) >= today && order.status !== 'completed'
              );
              
              const completed = specialistOrders.filter(order => 
                order.status === 'completed'
              );
              
              totalUpcoming += upcoming.length;
              totalCompleted += completed.length;
              specialistOrders.forEach(order => allClients.add(order.client_id));
            }
            
            setUpcomingAppointments(totalUpcoming);
            setCompletedAppointments(totalCompleted);
            setTotalClients(allClients.size);
          } catch (err) {
            console.log("Error fetching appointment data:", err);
            // Keep default values
            setUpcomingAppointments(0);
            setCompletedAppointments(0);
            setTotalClients(0);
          }
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const refreshUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch fresh data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, phone, specialty, experience, bio, location, is_stylist, is_laundry_specialist, is_cleaning_specialist')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error refreshing profile data:", profileError);
          // Fall back to user metadata
          const metadata = user.user_metadata || {};
          setAvatarUrl(metadata.avatar_url || null);
        } else if (profileData) {
          setAvatarUrl(profileData.avatar_url || null);
          setFullName(profileData.full_name || "");
          setPhone(profileData.phone || "");
          setSpecialty(profileData.specialty || "");
          setExperience(profileData.experience || "");
          setBio(profileData.bio || "");
          setLocation(profileData.location || "");
        }
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  return {
    activeTab,
    setActiveTab,
    user,
    loading,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    specialty,
    setSpecialty,
    experience,
    setExperience,
    bio,
    setBio,
    avatarUrl,
    location,
    setLocation,
    upcomingAppointments,
    totalClients,
    completedAppointments,
    rating,
    refreshUserProfile
  };
};
