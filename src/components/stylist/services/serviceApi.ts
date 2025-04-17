
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
    // Get the authenticated user
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

    const userId = user.id;
    console.log("User ID for service creation:", userId);

    // Try using a different approach - first fetch the user's profile to confirm identity
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_stylist')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Profile validation error:", profileError);
      toast.error("Could not validate stylist profile");
      return null;
    }

    if (!profileData.is_stylist) {
      console.error("User is not a stylist");
      toast.error("Only stylists can add services");
      return null;
    }

    console.log("Confirmed stylist status, proceeding with service creation");

    // Insert new service with explicit columns
    const { data: newService, error } = await supabase
      .from('services')
      .insert({
        name: formData.name,
        description: formData.description || null,
        price: priceValue,
        duration: durationValue,
        stylist_id: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding service:", error);
      
      // Additional logging for RLS debugging
      if (error.code === '42501') {
        console.error("RLS policy error details:", {
          message: error.message,
          hint: error.hint,
          details: error.details
        });
        
        // Try a direct query to check user permissions
        const { data: permissions } = await supabase.rpc('check_service_permissions');
        console.log("User service permissions:", permissions);
      }
      
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
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to update services");
      return false;
    }
    
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

    const userId = user.id;
    console.log("Updating service with ID:", serviceId, "for stylist:", userId);

    // First verify we have permission to update this service
    const { data: serviceCheck, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .eq('stylist_id', userId)
      .single();
      
    if (checkError) {
      console.error("Service permission check error:", checkError);
      toast.error("You don't have permission to update this service");
      return false;
    }

    const { error } = await supabase
      .from('services')
      .update({
        name: formData.name,
        description: formData.description || null,
        price: priceValue,
        duration: durationValue
      })
      .eq('id', serviceId)
      .eq('stylist_id', userId);  // Add this constraint for extra safety
    
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
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to delete services");
      return false;
    }
    
    const userId = user.id;
    console.log("Deleting service with ID:", serviceId, "for stylist:", userId);

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('stylist_id', userId);  // Add this constraint for extra safety
    
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

// Helper function to check service permissions
// This needs to be created in Supabase
export const checkServicePermissions = async (): Promise<{canCreate: boolean, canUpdate: boolean, canDelete: boolean}> => {
  try {
    const { data, error } = await supabase.rpc('check_service_permissions');
    
    if (error) {
      console.error("Error checking permissions:", error);
      return { canCreate: false, canUpdate: false, canDelete: false };
    }
    
    return data || { canCreate: false, canUpdate: false, canDelete: false };
  } catch (error) {
    console.error("Error in checkServicePermissions:", error);
    return { canCreate: false, canUpdate: false, canDelete: false };
  }
};
