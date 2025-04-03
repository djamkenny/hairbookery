
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
    refreshUserProfile
  };
};
