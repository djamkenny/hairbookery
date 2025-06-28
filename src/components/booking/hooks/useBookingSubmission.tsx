
import { useState } from "react";
import { toast } from "sonner";

interface UseBookingSubmissionProps {
  currentUser: any;
  date: Date | undefined;
  service: string;
  stylist: string;
  time: string;
  notes: string;
  setStep: (step: number) => void;
  setDate: (date: Date | undefined) => void;
  setService: (service: string) => void;
  setStylist: (stylist: string) => void;
  setTime: (time: string) => void;
  setNotes: (notes: string) => void;
}

export const useBookingSubmission = ({
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
}: UseBookingSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    isSubmitting,
    handleSubmit,
    handlePaymentSuccess,
    handleGoBack
  };
};
