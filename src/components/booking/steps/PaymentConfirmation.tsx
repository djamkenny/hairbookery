
import React from "react";
import { format } from "date-fns";
import PaymentForm from "../PaymentForm";

interface PaymentConfirmationProps {
  selectedService: any;
  date: Date | undefined;
  time: string;
  handlePaymentSuccess: () => void;
  handleGoBack: () => void;
  isSubmitting: boolean;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  selectedService,
  date,
  time,
  handlePaymentSuccess,
  handleGoBack,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Complete Your Booking</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Service</p>
            <p className="font-medium">
              {selectedService ? selectedService.name : "Not selected"}
            </p>
          </div>
          
          <div>
            <p className="text-muted-foreground">Date & Time</p>
            <p className="font-medium">
              {date ? `${format(date, "PPP")} at ${time}` : "Not selected"}
            </p>
          </div>
        </div>
      </div>
      
      <PaymentForm
        amount={selectedService ? selectedService.price : 0}
        onSuccess={handlePaymentSuccess}
        onCancel={handleGoBack}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PaymentConfirmation;
