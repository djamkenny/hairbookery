
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon, Scissors } from "lucide-react";
import { PaymentButton } from "@/components/payment/PaymentButton";

interface PaymentConfirmationProps {
  selectedService: any;
  date: Date | undefined;
  time: string;
  handlePaymentSuccess: () => void;
  handleGoBack: () => void;
  isSubmitting: boolean;
  appointmentId?: string | null;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  selectedService,
  date,
  time,
  handlePaymentSuccess,
  handleGoBack,
  isSubmitting
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Scissors className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{selectedService?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedService?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <p>{date?.toLocaleDateString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <p>{time}</p>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold">
                GH₵{selectedService?.price?.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to proceed with payment for your appointment. Your appointment will only be created after successful payment.
          </p>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Go Back
            </Button>
            
            <div className="flex-1">
              <PaymentButton
                amount={selectedService?.price || 0}
                description={`Appointment: ${selectedService?.name}`}
                serviceId={selectedService?.id}
                className="w-full"
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentConfirmation;
