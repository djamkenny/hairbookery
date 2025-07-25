import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon, Scissors } from "lucide-react";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { calculateBookingFee } from "../utils/feeUtils";
import { format } from "date-fns";

interface MultiPaymentConfirmationProps {
  selectedServices: any[];
  selectedStylist: any;
  date: Date | undefined;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  onPaymentSuccess: () => void;
  onGoBack: () => void;
  formatPrice?: (price: number) => string;
  formatDuration?: (minutes: number) => string;
}

const MultiPaymentConfirmation: React.FC<MultiPaymentConfirmationProps> = ({
  selectedServices,
  selectedStylist,
  date,
  time,
  name,
  email,
  phone,
  notes,
  onPaymentSuccess,
  onGoBack,
  formatPrice = (price) => `GHS ${(price / 100).toFixed(2)}`,
  formatDuration = (minutes) => `${minutes} min`,
}) => {
  const totalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + Number(service.duration), 0);
  
  // Calculate booking fee (20% of total price)
  const { fee: bookingFee } = calculateBookingFee(totalPrice, 20);

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
          {selectedServices.map((service, index) => (
            <div key={service.id} className="flex items-center gap-3">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
          ))}
          
          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{selectedStylist?.full_name}</p>
              <p className="text-sm text-muted-foreground">{selectedStylist?.specialty}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{date ? format(date, "EEEE, MMMM do") : "Date not selected"}</p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(totalDuration)} total duration
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{time}</p>
              <p className="text-sm text-muted-foreground">Appointment time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between text-sm">
                <span>{service.name}</span>
                <span>{formatPrice(service.price)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-2 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Total Service Cost:</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-primary">
              <span className="font-medium">Booking Fee (Pay Now):</span>
              <span className="font-medium">{formatPrice(bookingFee)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Remaining (Pay at appointment):</span>
              <span>{formatPrice(totalPrice - bookingFee)}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Payment Notice:</strong> You're only paying the booking fee now. 
              The remaining balance will be paid directly to your specialist at the appointment.
            </p>
          </div>
        </CardContent>
      </Card>

      {notes && (
        <Card>
          <CardHeader>
            <CardTitle>Special Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={onGoBack}
          className="flex-1"
        >
          Back to Booking
        </Button>
        
        <div className="flex-1">
          <PaymentButton
            amount={bookingFee}
            description={`Booking fee for ${selectedServices.map(s => s.name).join(', ')} with ${selectedStylist?.full_name}`}
            metadata={{
              serviceIds: selectedServices.map(s => s.id),
              stylistId: selectedStylist?.id,
              appointmentDate: date ? format(date, "yyyy-MM-dd") : "",
              appointmentTime: time,
              clientName: name,
              clientEmail: email,
              clientPhone: phone,
              notes: notes,
            }}
            onPaymentSuccess={onPaymentSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default MultiPaymentConfirmation;