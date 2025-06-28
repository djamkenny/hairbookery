
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBookingForm = () => {
  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [service, setService] = useState("");
  const [stylist, setStylist] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data state
  const [loading, setLoading] = useState(true);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Step state
  const [step, setStep] = useState(1);

  // Get URL parameters for pre-selection
  const [searchParams] = useSearchParams();
  const preSelectedStylistId = searchParams.get('stylist');

  // Derived state
  const selectedStylist = stylists.find(s => s.id === stylist);
  
  // Filter services based on selected stylist
  const services = stylist 
    ? allServices.filter(s => s.stylist_id === stylist)
    : allServices;
  
  const selectedService = services.find(s => s.id === service);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user) {
          // Get user profile to prefill form
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            setName(profile.full_name || '');
            setEmail(profile.email || user.email || '');
            setPhone(profile.phone || '');
          } else {
            setEmail(user.email || '');
          }
        }
        
        // Fetch all services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');
          
        if (servicesError) throw servicesError;
        setAllServices(servicesData || []);
        
        // Fetch stylists (users who are stylists)
        const { data: stylistsData, error: stylistsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_stylist', true);
          
        if (stylistsError) throw stylistsError;
        setStylists(stylistsData || []);

        // Pre-select stylist if provided in URL
        if (preSelectedStylistId && stylistsData) {
          const matchingStylist = stylistsData.find(s => s.id === preSelectedStylistId);
          if (matchingStylist) {
            setStylist(preSelectedStylistId);
            toast.success(`${matchingStylist.full_name} has been pre-selected for you!`);
          }
        }

        // Check for similar booking data from localStorage
        const similarBookingData = localStorage.getItem('similarBooking');
        if (similarBookingData) {
          try {
            const bookingData = JSON.parse(similarBookingData);
            
            // Only pre-fill if no stylist was pre-selected from URL
            if (!preSelectedStylistId) {
              // Find and pre-select service if it matches
              const matchingService = servicesData?.find(s => s.name === bookingData.service);
              if (matchingService) {
                setService(matchingService.id);
              }
              
              // Find and pre-select stylist if it matches
              const matchingStylist = stylistsData?.find(s => s.full_name === bookingData.stylist);
              if (matchingStylist) {
                setStylist(matchingStylist.id);
              }
            }
            
            // Set notes
            if (bookingData.notes) {
              setNotes(bookingData.notes);
            }
            
            // Clear the localStorage data
            localStorage.removeItem('similarBooking');
            
            if (!preSelectedStylistId) {
              toast.success("Pre-filled with similar appointment details!");
            }
          } catch (error) {
            console.error("Error parsing similar booking data:", error);
            localStorage.removeItem('similarBooking');
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [preSelectedStylistId]);

  // Reset service selection when stylist changes
  useEffect(() => {
    if (stylist && service) {
      const currentService = allServices.find(s => s.id === service);
      if (currentService && currentService.stylist_id !== stylist) {
        setService('');
      }
    }
  }, [stylist, service, allServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please sign in to book an appointment');
      return;
    }
    
    if (!date || !service || !stylist || !time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store booking details in localStorage for after payment
      localStorage.setItem('serviceId', service);
      localStorage.setItem('stylistId', stylist);
      localStorage.setItem('appointmentDate', date.toISOString().split('T')[0]);
      localStorage.setItem('appointmentTime', time);
      localStorage.setItem('appointmentNotes', notes || '');
      
      console.log('Booking details stored for payment completion');
      
      // Move to payment step
      setStep(2);
      toast.success('Appointment details saved! Please complete payment.');
      
    } catch (error: any) {
      console.error('Error preparing booking:', error);
      toast.error('Failed to prepare booking: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      toast.success('Payment completed! Your appointment has been booked.');
      
      // Reset form
      setDate(undefined);
      setService('');
      setStylist('');
      setTime('');
      setNotes('');
      setStep(1);
      
    } catch (error: any) {
      console.error('Error completing booking:', error);
      toast.error('Payment successful but there was an issue finalizing the appointment');
    }
  };

  const handleGoBack = () => {
    setStep(1);
  };

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
