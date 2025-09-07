import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, CalendarIcon, Clock, User, CreditCard, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useBookingPayment } from "@/hooks/useBookingPayment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceType } from "@/components/stylist/services/types";

interface ProfileBookingFormProps {
  stylistId: string;
  serviceCategories: Array<{
    name: string;
    serviceTypes: ServiceType[];
  }>;
  selectedServiceTypes: string[];
  onServiceToggle: (serviceTypeId: string) => void;
}

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const ProfileBookingForm: React.FC<ProfileBookingFormProps> = ({
  stylistId,
  serviceCategories,
  selectedServiceTypes,
  onServiceToggle
}) => {
  const { user } = useAuth();
  const { initiatePayment } = useBookingPayment();
  
  const [step, setStep] = useState(1); // 1: Services, 2: Date/Time, 3: Confirm, 4: Payment
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailableSlots = async () => {
      setLoading(true);
      try {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('stylist_id', stylistId)
          .eq('appointment_date', format(selectedDate, 'yyyy-MM-dd'))
          .neq('status', 'canceled');

        if (error) throw error;

        const bookedTimes = appointments?.map(apt => apt.appointment_time) || [];
        const available = timeSlots.filter(slot => !bookedTimes.includes(slot));
        setAvailableSlots(available);
      } catch (error) {
        console.error('Error fetching availability:', error);
        toast.error('Failed to load available times');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, stylistId]);

  const selectedServices = selectedServiceTypes.map(serviceTypeId => 
    serviceCategories
      .flatMap(cat => cat.serviceTypes)
      .find(st => st.id === serviceTypeId)
  ).filter(Boolean) as ServiceType[];

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  // Calculate booking payment based on totalPrice
  const bookingPayment = totalPrice < 100 ? Math.round(totalPrice * 0.1) : 10;

  const canProceedToDateStep = selectedServiceTypes.length > 0;
  const canProceedToConfirm = canProceedToDateStep && selectedDate && selectedTime;

  const handleBookingSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to book an appointment');
      return;
    }

    if (!canProceedToConfirm) {
      toast.error('Please complete all booking details');
      return;
    }

    setSubmitting(true);
    try {
      // Use bookingPayment instead of totalPrice
      const serviceTypeIds = selectedServiceTypes;
      if (serviceTypeIds.length === 0) {
        throw new Error('No valid services selected');
      }
      const result = await initiatePayment({
        serviceTypeIds,
        stylistId,
        appointmentDate: format(selectedDate!, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        notes,
        totalAmount: bookingPayment
      });
      
      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Payment initiation failed');
      }
      
      toast.success('Redirecting to payment...');
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Category Selection */}
            {!activeCategory ? (
              <div>
                <h4 className="font-medium mb-2">Select Service Category</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {serviceCategories.map((category) => (
                    <Button
                      key={category.name}
                      variant="outline"
                      onClick={() => setActiveCategory(category.name)}
                      className="capitalize"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-4"
                  onClick={() => setActiveCategory(null)}
                >
                  ← Back to Categories
                </Button>
                <h5 className="font-medium mb-2">Available Services in {activeCategory}</h5>
                <div className="space-y-2">
                  {serviceCategories
                    .find(cat => cat.name === activeCategory)
                    ?.serviceTypes.map(serviceType => (
                      <div
                        key={serviceType.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          selectedServiceTypes.includes(serviceType.id)
                            ? "border-primary bg-primary/10"
                            : "border-muted"
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{serviceType.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            GHS {serviceType.price} • {serviceType.duration} min
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedServiceTypes.includes(serviceType.id) ? "default" : "outline"}
                          onClick={() => onServiceToggle(serviceType.id)}
                        >
                          {selectedServiceTypes.includes(serviceType.id) ? "Selected" : "Select"}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Selected Services Summary */}
            {selectedServiceTypes.length > 0 && (
              <div className="p-4 bg-primary/5 rounded-lg mt-4">
                <h4 className="font-medium mb-2">Selected Services ({selectedServiceTypes.length})</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedServices.map(service => (
                    <Badge key={service.id} className="capitalize">
                      {service.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Total Duration: {totalDuration} minutes</span>
                  <span className="font-semibold">Total: GHS {totalPrice}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Choose Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => 
                      date < new Date() || 
                      date.getDay() === 0 // Sunday closed
                    }
                    className="rounded-md border"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Choose Time
                    {selectedDate && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({format(selectedDate, "MMM do")})
                      </span>
                    )}
                  </Label>
                  {!selectedDate ? (
                    <p className="text-muted-foreground text-center py-8">
                      Select a date first
                    </p>
                  ) : loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No available times for this date
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedTime(time)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedDate && selectedTime && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">
                    Appointment scheduled for {format(selectedDate, "EEEE, MMMM do")} at {selectedTime}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
              
              {/* Booking Summary */}
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Appointment Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Date:</strong> {selectedDate && format(selectedDate, "EEEE, MMMM do, yyyy")}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Duration:</strong> {totalDuration} minutes</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Selected Services</h4>
                  <div className="space-y-2">
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex justify-between items-center">
                        <span>{service.name}</span>
                        <span className="font-medium">GHS {service.price}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>GHS {totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-base font-medium">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or notes for your appointment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book Appointment
        </CardTitle>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  step > stepNum ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canProceedToDateStep) ||
                (step === 2 && !canProceedToConfirm)
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleBookingSubmit}
              disabled={!canProceedToConfirm || submitting}
              className="min-w-[120px]"
            >
              {submitting ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay GHS {bookingPayment}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileBookingForm;