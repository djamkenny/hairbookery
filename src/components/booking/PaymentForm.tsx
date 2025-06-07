
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
      
      if (amount <= 0) {
        throw new Error("Invalid amount");
      }
      
      const result = await createPayment(amount, "Appointment Payment");
      
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
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-lg font-bold">${(amount / 100).toFixed(2)}</span>
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
            disabled={processing || isSubmitting || amount <= 0}
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
