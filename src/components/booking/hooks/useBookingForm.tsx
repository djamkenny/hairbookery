
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
  
  const selectedServices = services.map(serviceId => 
    allServices.find(s => s.id === serviceId)
  ).filter(Boolean);

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
