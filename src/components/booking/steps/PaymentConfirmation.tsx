
import React from "react";
import { format } from "date-fns";
import PaymentForm from "../PaymentForm";
import { formatPrice } from "../utils/formatUtils";

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
  // Ensure price is treated as dollars, not cents
  const servicePrice = selectedService ? parseFloat(selectedService.price) : 0;
  console.log("Service price for payment:", { raw: selectedService?.price, parsed: servicePrice });

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
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium">
              {selectedService ? formatPrice(selectedService.price) : "-"}
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
        amount={servicePrice}
        onSuccess={handlePaymentSuccess}
        onCancel={handleGoBack}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PaymentConfirmation;
