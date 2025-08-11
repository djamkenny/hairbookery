import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useBookingPayment } from "@/hooks/useBookingPayment";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface BookingPaymentButtonProps {
  services: any[];
  stylistId: string;
  appointmentDate: Date;
  appointmentTime: string;
  notes: string;
  totalAmount: number;
  onPaymentSuccess?: () => void;
}

export const BookingPaymentButton: React.FC<BookingPaymentButtonProps> = ({
  services,
  stylistId,
  appointmentDate,
  appointmentTime,
  notes,
  totalAmount,
  onPaymentSuccess
}) => {
  const { isProcessing, initiatePayment } = useBookingPayment();
  const isMobile = useIsMobile();

  const handlePayment = async () => {
    try {
      const result = await initiatePayment({
        serviceTypeIds: services.map(s => s.id),
        stylistId,
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        appointmentTime,
        notes,
        totalAmount
      });

      if (result.success && result.paymentUrl) {
        if (isMobile) {
          window.location.href = result.paymentUrl;
        } else {
          window.open(result.paymentUrl, '_blank');
        }
        onPaymentSuccess?.();
      } else {
        toast.error(result.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + error.message);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing || totalAmount <= 0}
      className="w-full"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay GH₵{totalAmount.toFixed(2)}
        </>
      )}
    </Button>
  );
};