
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { usePayment } from "@/components/payment/PaymentProvider";
import { toast } from "sonner";

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

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Ensure amount is in cents and meets minimum requirement
      const amountInCents = Math.round(amount * 100);
      console.log("Payment amount:", { original: amount, inCents: amountInCents });
      
      if (amountInCents < 50) {
        throw new Error("Payment amount must be at least $0.50");
      }
      
      const result = await createPayment(amountInCents, "Appointment Payment");
      
      if (result?.url) {
        // Open checkout in new tab (similar to your Flask setup)
        window.open(result.url, '_blank');
        
        // Simulate success for demo - in real app, you'd wait for webhook or redirect
        setTimeout(() => {
          onSuccess();
          toast.success("Payment initiated successfully!");
        }, 2000);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Convert cents back to dollars for display
  const displayAmount = (amount / 100).toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-lg font-bold">${displayAmount}</span>
          </div>
        </div>
        
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
            disabled={processing || isSubmitting || amount < 0.50}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
