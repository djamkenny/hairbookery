
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");

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
          setAvatarUrl(metadata.avatar_url || null);
          setLocation(metadata.location || "");
          
          // Fetch data from profiles table
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('full_name, phone, avatar_url, location')
              .eq('id', user.id)
              .single();
              
            if (error) {
              console.error("Error fetching profile data:", error);
            } else if (profile) {
              // Use profile data if available (it might be more up-to-date)
              if (profile.full_name) setFullName(profile.full_name);
              if (profile.phone) setPhone(profile.phone);
              if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
              if (profile.location) setLocation(profile.location);
            }
          } catch (error) {
            console.error("Error in profile fetch:", error);
          }
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

  // This function will update all profile states with fresh data
  const refreshUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        const metadata = user.user_metadata || {};
        setFullName(metadata.full_name || "");
        setPhone(metadata.phone || "");
        setAvatarUrl(metadata.avatar_url || null);
        setLocation(metadata.location || "");
        
        // Also fetch from profiles table
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, phone, avatar_url, location')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error("Error refreshing profile data:", error);
          } else if (profile) {
            if (profile.full_name) setFullName(profile.full_name);
            if (profile.phone) setPhone(profile.phone);
            if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
            if (profile.location) setLocation(profile.location);
          }
        } catch (error) {
          console.error("Error in profile refresh:", error);
        }
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  return {
    loading,
    user,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    avatarUrl,
    setAvatarUrl,
    location,
    setLocation,
    refreshUserProfile
  };
};
