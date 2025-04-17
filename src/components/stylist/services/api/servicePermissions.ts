
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks the service-related permissions for the current user
 */
export const checkServicePermissions = async (): Promise<{canCreate: boolean, canUpdate: boolean, canDelete: boolean}> => {
  try {
    const { data, error } = await supabase.rpc('check_service_permissions') as {
      data: {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        user_id?: string;
        is_stylist?: boolean;
        error?: string;
      } | null;
      error: any;
    };
    
    if (error) {
      console.error("Error checking permissions:", error);
      return { canCreate: false, canUpdate: false, canDelete: false };
    }
    
    return data ? { 
      canCreate: data.canCreate, 
      canUpdate: data.canUpdate, 
      canDelete: data.canDelete 
    } : { 
      canCreate: false, 
      canUpdate: false, 
      canDelete: false 
    };
  } catch (error) {
    console.error("Error in checkServicePermissions:", error);
    return { canCreate: false, canUpdate: false, canDelete: false };
  }
};
