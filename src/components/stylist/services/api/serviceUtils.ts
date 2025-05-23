
import { supabase } from "@/integrations/supabase/client";
import { ServiceFormValues } from "../ServiceForm";

/**
 * Validates the service form data and extracts numeric values
 */
export const validateFormData = (formData: ServiceFormValues): {
  valid: boolean;
  priceValue?: number;
  durationValue?: number;
  error?: string;
} => {
  // Extract numeric price and duration values
  const priceStr = formData.price.replace(/[^0-9.]/g, '');
  const durationStr = formData.duration.replace(/[^0-9]/g, '');
  
  // Ensure valid numeric values
  const priceValue = priceStr ? parseFloat(priceStr) : 0;
  const durationValue = durationStr ? parseInt(durationStr) : 0;
  
  if (isNaN(priceValue) || priceValue <= 0) {
    return { valid: false, error: "Please enter a valid price" };
  }
  
  if (isNaN(durationValue) || durationValue <= 0) {
    return { valid: false, error: "Please enter a valid duration" };
  }

  return { valid: true, priceValue, durationValue };
};

/**
 * Validates that the user has a stylist profile
 */
export const validateStylistProfile = async (userId: string): Promise<{
  valid: boolean;
  error?: string;
}> => {
  try {
    // Log the user ID we're checking
    console.log("Validating stylist profile for user ID:", userId);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_stylist')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return { 
        valid: false, 
        error: "Could not validate stylist profile" 
      };
    }

    console.log("Profile data retrieved:", profileData);

    if (!profileData || !profileData.is_stylist) {
      return { 
        valid: false, 
        error: "Only stylists can add services" 
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating stylist profile:", error);
    return { 
      valid: false, 
      error: "Error validating stylist profile" 
    };
  }
};
