
import { supabase } from "@/integrations/supabase/client";
import { ServiceFormValues } from "../ServiceForm";
import { toast } from "sonner";
import { validateFormData } from "./serviceUtils";

/**
 * Updates an existing service for the authenticated stylist
 */
export const updateService = async (serviceId: string, formData: ServiceFormValues): Promise<boolean> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to update services");
      return false;
    }
    
    // Extract and validate numeric values
    const result = validateFormData(formData);
    if (!result.valid) {
      toast.error(result.error || "Invalid form data");
      return false;
    }

    const { priceValue, durationValue } = result;
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
