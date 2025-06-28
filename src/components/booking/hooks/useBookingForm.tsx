
import { useBookingData } from "./useBookingData";
import { useBookingFormState } from "./useBookingFormState";
import { useBookingSubmission } from "./useBookingSubmission";

export const useBookingForm = () => {
  const { loading, allServices, stylists, currentUser, preSelectedStylistId } = useBookingData();
  
  const {
    date,
    setDate,
    service,
    setService,
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
    service,
    stylist,
    time,
    notes,
    setStep,
    setDate,
    setService,
    setStylist,
    setTime,
    setNotes
  });

  // Derived state
  const selectedStylist = stylists.find(s => s.id === stylist);
  
  // Filter services based on selected stylist
  const services = stylist 
    ? allServices.filter(s => s.stylist_id === stylist)
    : allServices;
  
  const selectedService = services.find(s => s.id === service);

  return {
    // Form state
    date,
    setDate,
    service,
    setService,
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
    services, // This now returns filtered services based on selected stylist
    stylists,
    currentUser,
    
    // Derived state
    selectedService,
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
