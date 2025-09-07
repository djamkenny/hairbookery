
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookingFormData } from "./types";

interface UseBookingFormStateProps {
  currentUser: any;
  preSelectedStylistId: string | null;
  allServices: any[];
  stylists: any[];
}

export const useBookingFormState = ({ 
  currentUser, 
  preSelectedStylistId, 
  allServices, 
  stylists 
}: UseBookingFormStateProps) => {
  const [searchParams] = useSearchParams();
  const preSelectedDate = searchParams.get('date');
  const preSelectedTime = searchParams.get('time');
  const [date, setDate] = useState<Date | undefined>(preSelectedDate ? new Date(preSelectedDate) : undefined);
  const [services, setServices] = useState<string[]>([]);
  const [stylist, setStylist] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);

  // Initialize form with user data and URL parameters
  useEffect(() => {
    if (currentUser) {
      // Get user profile to prefill form
      const fetchUserProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', currentUser.id)
          .single();
          
        if (profile) {
          setName(profile.full_name || '');
          setEmail(profile.email || currentUser.email || '');
          setPhone(profile.phone || '');
        } else {
          setEmail(currentUser.email || '');
        }
      };
      
      fetchUserProfile();
    } else {
      // Allow guest users to fill out the form
      // Form will remain empty for them to fill
    }
  }, [currentUser]);

  // Handle pre-selection and similar booking data
  useEffect(() => {
    if (preSelectedStylistId && stylists.length > 0) {
      setStylist(preSelectedStylistId);
    }

    // Handle pre-selected date and time from URL
    if (preSelectedDate) {
      setDate(new Date(preSelectedDate));
    }

    if (preSelectedTime) {
      setTime(preSelectedTime);
    }

    // Check for similar booking data from localStorage
    const similarBookingData = localStorage.getItem('similarBooking');
    if (similarBookingData) {
      try {
        const bookingData = JSON.parse(similarBookingData);
        
        // Only pre-fill if no stylist was pre-selected from URL
        if (!preSelectedStylistId) {
          // Find and pre-select service if it matches
          const matchingService = allServices?.find(s => s.name === bookingData.service);
          if (matchingService) {
            setServices([matchingService.id]);
          }
          
          // Find and pre-select stylist if it matches
          const matchingStylist = stylists?.find(s => s.full_name === bookingData.stylist);
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
  }, [preSelectedStylistId, allServices, stylists]);

  // Reset service selection when stylist changes
  useEffect(() => {
    if (stylist && services.length > 0) {
      const validServices = services.filter(serviceId => {
        const service = allServices.find(s => s.id === serviceId);
        return service && service.stylist_id === stylist;
      });
      if (validServices.length !== services.length) {
        setServices(validServices);
      }
    }
  }, [stylist, services, allServices]);

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
    step,
    setStep
  };
};
