
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useBookingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedStylistId = searchParams.get("stylist");
  
  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [service, setService] = useState<string>("");
  const [stylist, setStylist] = useState<string>(preselectedStylistId || "");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Multi-step form state
  const [step, setStep] = useState(1);
  
  // Data state
  const [services, setServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Find selected service and stylist
  const selectedService = service 
    ? services.find(s => s.id === service) 
    : null;
    
  const selectedStylist = stylist 
    ? stylists.find(s => s.id === stylist) 
    : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user) {
          setEmail(user.email || "");
          
          // Try to get user's profile info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            setName(profileData.full_name || "");
            setPhone(profileData.phone || "");
          }
        }
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('price');
          
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
        // Fetch stylists (users with is_stylist = true)
        const { data: stylistsData, error: stylistsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_stylist', true);
          
        if (stylistsError) throw stylistsError;
        setStylists(stylistsData || []);
        
        // If a stylist was preselected but not found in the database, reset it
        if (preselectedStylistId && 
            stylistsData && 
            !stylistsData.some(s => s.id === preselectedStylistId)) {
          setStylist("");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load appointment data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [preselectedStylistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to book an appointment");
      navigate("/login");
      return;
    }
    
    if (!date || !service || !stylist || !time || !name || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // If on step 1, move to payment step
    if (step === 1) {
      setStep(2);
      return;
    }
  };

  const handlePaymentSuccess = async () => {
    setIsSubmitting(true);
    
    try {
      // Format the date for database
      const formattedDate = format(date!, "yyyy-MM-dd");
      
      // Insert the appointment into the database
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          client_id: currentUser.id,
          stylist_id: stylist,
          service_id: service,
          appointment_date: formattedDate,
          appointment_time: time,
          notes: notes || null
        }])
        .select();
      
      if (error) throw error;
      
      toast.success("Appointment booked successfully! We'll send you a confirmation email shortly.");
      
      // Reset form
      setDate(undefined);
      setService("");
      setStylist("");
      setTime("");
      setNotes("");
      setStep(1);
      
      // Redirect to dashboard after successful booking
      navigate("/profile");
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error(error.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    services,
    stylists,
    currentUser,
    
    // Derived state
    selectedService,
    selectedStylist,
    
    // Step state
    step,
    
    // Handlers
    handleSubmit,
    handlePaymentSuccess,
    handleGoBack
  };
};
