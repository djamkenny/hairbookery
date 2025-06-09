
import { useState, useEffect } from "react";
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
  const [services, setServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Step state
  const [step, setStep] = useState(1);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  // Derived state
  const selectedService = services.find(s => s.id === service);
  const selectedStylist = stylists.find(s => s.id === stylist);

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
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');
          
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
        // Fetch stylists (users who are stylists)
        const { data: stylistsData, error: stylistsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_stylist', true);
          
        if (stylistsError) throw stylistsError;
        setStylists(stylistsData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      // Create appointment record
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: currentUser.id,
          service_id: service,
          stylist_id: stylist,
          appointment_date: date.toISOString().split('T')[0],
          appointment_time: time,
          notes: notes || null,
          status: 'pending'
        })
        .select()
        .single();
        
      if (appointmentError) throw appointmentError;
      
      console.log('Appointment created:', appointmentData);
      setAppointmentId(appointmentData.id);
      
      // Move to payment step
      setStep(2);
      toast.success('Appointment details saved! Please complete payment.');
      
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (!appointmentId) {
        toast.error('No appointment found');
        return;
      }
      
      // Update appointment status to confirmed after payment
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      toast.success('Appointment booked successfully!');
      
      // Reset form
      setDate(undefined);
      setService('');
      setStylist('');
      setTime('');
      setNotes('');
      setStep(1);
      setAppointmentId(null);
      
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error('Payment successful but failed to confirm appointment');
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
    appointmentId,
    
    // Handlers
    handleSubmit,
    handlePaymentSuccess,
    handleGoBack
  };
};
