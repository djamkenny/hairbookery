
import { supabase } from "@/integrations/supabase/client";
import { Service } from "../types";
import { toast } from "sonner";

/**
 * Fetches all services for the authenticated stylist
 */
export const fetchServices = async (): Promise<Service[]> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to view services");
      return [];
    }

    // Fetch services from the database
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('stylist_id', user.id) // Only get services for this stylist
      .order('name');

    if (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
      return [];
    }

    return data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: `${service.duration}`,
      price: `${service.price}`,
      stylist_id: service.stylist_id,
      image_urls: service.image_urls || []
    }));
  } catch (error) {
    console.error("Error in fetchServices:", error);
    toast.error("An error occurred while fetching services");
    return [];
  }
};
