
import { supabase } from "@/integrations/supabase/client";
import { Service } from "../types";
import { ServiceFormValues } from "../ServiceForm";
import { toast } from "sonner";
import { validateFormData, validateStylistProfile } from "./serviceUtils";

/**
 * Adds a new service for the authenticated stylist
 */
export const addService = async (formData: ServiceFormValues): Promise<Service | null> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to add services");
      return null;
    }

    // Extract and validate numeric values
    const result = validateFormData(formData);
    if (!result.valid) {
      toast.error(result.error || "Invalid form data");
      return null;
    }

    const { priceValue, durationValue } = result;
    const userId = user.id;
    console.log("User ID for service creation:", userId);

    // First check permissions explicitly
    const { data: permissions } = await supabase.rpc('check_service_permissions') as { 
      data: { 
        canCreate: boolean; 
        canUpdate: boolean; 
        canDelete: boolean;
        user_id?: string;
        is_stylist?: boolean;
        error?: string;
      } | null 
    };
    
    console.log("Service permissions check result:", permissions);
    
    if (!permissions?.canCreate) {
      console.error("Permission check failed:", permissions?.error || "Unknown error");
      toast.error("You don't have permission to create services. Please ensure your account is set up as a stylist.");
      return null;
    }

    // Validate stylist profile
    const validationResult = await validateStylistProfile(userId);
    if (!validationResult.valid) {
      console.error(validationResult.error || "Profile validation failed");
      toast.error(validationResult.error || "Could not validate stylist profile");
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
        stylist_id: userId,
        image_urls: []
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding service:", error);
      
      // Additional logging for RLS debugging
      await logRlsError(error, userId);
      
      toast.error("Failed to add service: " + error.message);
      return null;
    }

    console.log("Service added successfully:", newService);

    return {
      id: newService.id,
      name: newService.name,
      description: newService.description,
      duration: `${newService.duration}`,
      price: `${newService.price}`,
      stylist_id: newService.stylist_id,
      image_urls: newService.image_urls || []
    };
  } catch (error: any) {
    console.error("Error in addService:", error);
    toast.error(`An error occurred while adding the service: ${error.message || "Unknown error"}`);
    return null;
  }
};

/**
 * Logs detailed information for RLS policy errors
 */
async function logRlsError(error: any, userId: string) {
  if (error.code === '42501') {
    console.error("RLS policy error details:", {
      message: error.message,
      hint: error.hint,
      details: error.details
    });
    
    // Get user profile information
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log("User profile data:", userProfile);
    
    // Try a direct query to check user permissions
    const { data: permissions } = await supabase.rpc('check_service_permissions') as { 
      data: { 
        canCreate: boolean; 
        canUpdate: boolean; 
        canDelete: boolean;
        user_id?: string;
        is_stylist?: boolean;
        error?: string;
      } | null 
    };
    console.log("User service permissions:", permissions);
  }
}
