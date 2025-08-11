import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBookingData } from "./useBookingData";
import { useBookingFormState } from "./useBookingFormState";
import { useBookingSubmission } from "./useBookingSubmission";

export const useBookingForm = () => {
  const { loading, allServices, stylists, currentUser, preSelectedStylistId } = useBookingData();
  
  const {
    date,
    setDate,
    services,
    setServices,
    stylist,
    setStylist,
    time,
    setTime,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    notes,
    setNotes,
    step,
    setStep
  } = useBookingFormState({ currentUser, preSelectedStylistId, allServices, stylists });

  const { isSubmitting, handleSubmit, handlePaymentSuccess, handleGoBack } = useBookingSubmission({
    currentUser,
    date,
    services,
    stylist,
    time,
    notes,
    setStep,
    setDate,
    setServices,
    setStylist,
    setTime,
    setNotes
  });

  // Derived state
  const selectedStylist = stylists.find(s => s.id === stylist);
  
  // Filter services based on selected stylist
  const availableServices = stylist 
    ? allServices.filter(s => s.stylist_id === stylist)
    : allServices;
  
  // Load selected service TYPES (not base services)
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  useEffect(() => {
    const loadServiceTypes = async () => {
      if (!services || services.length === 0) {
        setSelectedServices([]);
        return;
      }
      const { data, error } = await supabase
        .from('service_types')
        .select('id, name, description, price, duration')
        .in('id', services);
      if (error) {
        console.error('Failed to load selected service types:', error);
        setSelectedServices([]);
        return;
      }
      setSelectedServices(data || []);
    };
    loadServiceTypes();
  }, [services]);

  return {
    // Form state
    date,
    setDate,
    services,
    setServices,
    stylist,
    setStylist,
    time,
    setTime,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    notes,
    setNotes,
    isSubmitting,
    
    // Data state
    loading,
    availableServices, // Services available for the selected stylist
    stylists,
    currentUser,
    
    // Derived state
    selectedServices, // Array of selected services
    selectedStylist,
    
    // Step state
    step,
    appointmentId: null, // Will be created after payment
    
    // Handlers
    handleSubmit,
    handlePaymentSuccess,
    handleGoBack
  };
};
