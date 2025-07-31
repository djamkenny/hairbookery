
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { usePayment } from "@/components/payment/PaymentProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { formatPrice } from "./utils/formatUtils";

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onCancel,
  isSubmitting 
}) => {
  const [processing, setProcessing] = useState(false);
  const { createPayment } = usePayment();
  const isMobile = useIsMobile();

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Convert GHS to pesewas (1 GHS = 100 pesewas)
      const amountInPesewas = Math.round(amount * 100);
      console.log("Payment amount:", { original: amount, inPesewas: amountInPesewas });

      if (amountInPesewas < 100) {
        throw new Error("Payment amount must be at least 1 GHS");
      }

      const result = await createPayment(amountInPesewas, "Appointment Payment");

      if (result?.url) {
        // Store payment verification data in localStorage for booking flow
        localStorage.setItem('bookingPaymentCallback', 'true');
        localStorage.setItem('bookingPaymentAmount', amountInPesewas.toString());
        
        // Get serviceIds from localStorage (stored during booking process)
        const serviceIds = localStorage.getItem('serviceIds');
        if (serviceIds) {
          const parsed = JSON.parse(serviceIds);
          const serviceId = Array.isArray(parsed) ? parsed[0] : parsed;
          localStorage.setItem('bookingServiceId', serviceId);
        }
        
        if (isMobile) {
          toast.success("Redirecting to payment page...");
          setTimeout(() => {
            window.location.href = result.url;
          }, 1000);
        } else {
          window.open(result.url, '_blank');
          setTimeout(() => {
            onSuccess();
            toast.success("Payment initiated successfully! Complete payment in the new tab.");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Display amount in GHS
  const displayAmount = formatPrice(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Complete Payment with Paystack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-lg font-bold">{displayAmount}</span>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <p className="font-medium text-blue-900 mb-1">Payment Methods Available:</p>
          <ul className="text-blue-700 space-y-1">
            <li>• Mobile Money (MTN, Vodafone, AirtelTigo)</li>
            <li>• Credit/Debit Cards (Visa, Mastercard, Verve)</li>
            <li>• Bank Transfer & USSD</li>
          </ul>
        </div>
        {isMobile && (
          <div className="bg-primary/10 p-3 rounded-lg text-sm">
            <p className="text-primary">
              📱 You'll be redirected to Paystack's secure mobile payment page
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={onCancel}
            disabled={processing || isSubmitting}
          >
            Back
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={processing || isSubmitting || amount < 1}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isMobile ? "Redirecting..." : "Processing..."}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with Paystack
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
