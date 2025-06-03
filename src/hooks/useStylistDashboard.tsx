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
          
          // Fetch appointments data
          try {
            const { data: appointmentsData, error: appointmentsError } = await supabase
              .from('appointments')
              .select('*');
              
            if (appointmentsError) throw appointmentsError;
              
            if (appointmentsData) {
              // Filter for this stylist's appointments
              const stylistAppointments = appointmentsData.filter(apt => 
                apt.stylist_id === authUser.id && !apt.canceled_at
              );
              
              // Further filter for upcoming vs completed
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Start of today
              
              const upcoming = stylistAppointments.filter(apt => 
                new Date(apt.appointment_date) >= today && apt.status !== 'completed'
              );
              
              const completed = stylistAppointments.filter(apt => 
                apt.status === 'completed'
              );
              
              setUpcomingAppointments(upcoming.length);
              setCompletedAppointments(completed.length);
              
              // Count unique clients
              const uniqueClients = new Set(stylistAppointments.map(appointment => appointment.client_id));
              setTotalClients(uniqueClients.size);
            }
          } catch (err) {
            console.log("Error fetching appointments:", err);
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
          .select('avatar_url, full_name, phone, specialty, experience, bio, location')
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
