
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon, Scissors } from "lucide-react";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { calculateBookingFee } from "../utils/feeUtils";

interface PaymentConfirmationProps {
  selectedService: any;
  date: Date | undefined;
  time: string;
  handlePaymentSuccess: () => void;
  handleGoBack: () => void;
  isSubmitting: boolean;
  appointmentId?: string | null;
  formatPrice?: (price: number) => string;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  selectedService,
  date,
  time,
  handlePaymentSuccess,
  handleGoBack,
  isSubmitting,
  appointmentId,
  formatPrice
}) => {
  // Only collect the fee—the amount paid now is ONLY the fee!
  const basePrice = selectedService?.price || 0;
  const { fee: bookingFee } = calculateBookingFee(basePrice, 20);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Booking Fee Summary
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
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between items-center">
              <span>Service Price:</span>
              <span>
                {formatPrice
                  ? formatPrice(basePrice)
                  : `₵${basePrice?.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-amber-700">
                Booking Fee (20% to confirm):
              </span>
              <span className="text-amber-700">
                {formatPrice ? formatPrice(bookingFee) : `₵${bookingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold border-t pt-2">
              <span className="text-primary">Total to Pay Now:</span>
              <span className="text-primary">
                {formatPrice ? formatPrice(bookingFee) : `₵${bookingFee.toFixed(2)}`}
              </span>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-sm mt-4 text-yellow-800">
            <span className="font-semibold">Note:</span> Your booking will be confirmed when you pay the fee above. <br />
            <span>You will pay <strong>{formatPrice ? formatPrice(basePrice) : `₵${basePrice?.toFixed(2)}`}</strong> directly to the specialist at your appointment. This booking fee is a separate non-refundable fee charged by the platform.</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pay Booking Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to pay the <span className="font-medium">booking fee</span> for your appointment. Your appointment will only be created after successful payment.
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
                amount={bookingFee}
                description={`Booking Fee for ${selectedService?.name}`}
                serviceId={selectedService?.id}
                metadata={{
                  base_price: basePrice,
                  booking_fee: bookingFee,
                  fee_percentage: 20
                }}
                className="w-full"
                onPaymentSuccess={handlePaymentSuccess}
              >
                Pay Booking Fee
              </PaymentButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentConfirmation;
