
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes a service for the authenticated stylist
 */
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
