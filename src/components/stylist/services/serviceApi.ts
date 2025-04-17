
import { supabase } from "@/integrations/supabase/client";
import { Service } from "./types";
import { ServiceFormValues } from "./ServiceForm";
import { toast } from "sonner";

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
      duration: `${service.duration} min`,
      price: `$${service.price}`
    }));
  } catch (error) {
    console.error("Error in fetchServices:", error);
    toast.error("An error occurred while fetching services");
    return [];
  }
};

export const addService = async (formData: ServiceFormValues): Promise<Service | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to add services");
      return null;
    }

    // Extract numeric price and duration values
    const priceStr = formData.price.replace(/[^0-9.]/g, '');
    const durationStr = formData.duration.replace(/[^0-9]/g, '');
    
    // Ensure valid numeric values
    const priceValue = priceStr ? parseFloat(priceStr) : 0;
    const durationValue = durationStr ? parseInt(durationStr) : 0;
    
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return null;
    }
    
    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error("Please enter a valid duration");
      return null;
    }

    console.log("Submitting service:", {
      name: formData.name,
      description: formData.description,
      price: priceValue,
      duration: durationValue,
      stylist_id: user.id  // This is critical - we need to explicitly set the stylist_id
    });

    // Insert new service with the stylist_id attached
    const { data: newService, error } = await supabase
      .from('services')
      .insert({
        name: formData.name,
        description: formData.description || null,
        price: priceValue,
        duration: durationValue,
        stylist_id: user.id  // Make sure to set this to satisfy RLS policy
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service: " + error.message);
      return null;
    }

    console.log("Service added successfully:", newService);

    return {
      id: newService.id,
      name: newService.name,
      description: newService.description,
      duration: `${newService.duration} min`,
      price: `$${newService.price}`
    };
  } catch (error: any) {
    console.error("Error in addService:", error);
    toast.error(`An error occurred while adding the service: ${error.message || "Unknown error"}`);
    return null;
  }
};

export const updateService = async (serviceId: string, formData: ServiceFormValues): Promise<boolean> => {
  try {
    // Extract numeric price and duration values
    const priceStr = formData.price.replace(/[^0-9.]/g, '');
    const durationStr = formData.duration.replace(/[^0-9]/g, '');
    
    // Ensure valid numeric values
    const priceValue = priceStr ? parseFloat(priceStr) : 0;
    const durationValue = durationStr ? parseInt(durationStr) : 0;
    
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }
    
    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error("Please enter a valid duration");
      return false;
    }

    // Get user for stylist_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to update services");
      return false;
    }

    const { error } = await supabase
      .from('services')
      .update({
        name: formData.name,
        description: formData.description || null,
        price: priceValue,
        duration: durationValue,
        stylist_id: user.id
      })
      .eq('id', serviceId);
    
    if (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service: " + error.message);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in updateService:", error);
    toast.error(`An error occurred while updating the service: ${error.message || "Unknown error"}`);
    return false;
  }
};

export const deleteService = async (serviceId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    
    if (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service: " + error.message);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in deleteService:", error);
    toast.error(`An error occurred while deleting the service: ${error.message || "Unknown error"}`);
    return false;
  }
};
