
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
        stylist_id: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding service:", error);
      
      // Additional logging for RLS debugging
      await logRlsError(error);
      
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

/**
 * Logs detailed information for RLS policy errors
 */
async function logRlsError(error: any) {
  if (error.code === '42501') {
    console.error("RLS policy error details:", {
      message: error.message,
      hint: error.hint,
      details: error.details
    });
    
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
