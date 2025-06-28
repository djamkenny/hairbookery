
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookingData } from "./types";

export const useBookingData = () => {
  const [loading, setLoading] = useState(true);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [searchParams] = useSearchParams();
  const preSelectedStylistId = searchParams.get('stylist');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        // Fetch all services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');
          
        if (servicesError) throw servicesError;
        setAllServices(servicesData || []);
        
        // Fetch stylists (users who are stylists)
        const { data: stylistsData, error: stylistsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_stylist', true);
          
        if (stylistsError) throw stylistsError;
        setStylists(stylistsData || []);

        // Pre-select stylist if provided in URL
        if (preSelectedStylistId && stylistsData) {
          const matchingStylist = stylistsData.find(s => s.id === preSelectedStylistId);
          if (matchingStylist) {
            toast.success(`${matchingStylist.full_name} has been pre-selected for you!`);
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [preSelectedStylistId]);

  return {
    loading,
    allServices,
    stylists,
    currentUser,
    preSelectedStylistId
  };
};
