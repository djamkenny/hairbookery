
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

  return {
    loading,
    user,
    fullName,
    setFullName,
    email,
    phone,
    setPhone
  };
};
