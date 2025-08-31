import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { LaundryServiceSelector } from "./LaundryServiceSelector";
import { useLaundryBooking } from "@/hooks/useLaundryBooking";
import { useAuth } from "@/hooks/useAuth";
import { LaundryBookingData } from "@/types/laundry";
import { formatPrice } from "@/components/booking/utils/formatUtils";
import { calculateBookingFee } from "@/components/booking/utils/feeUtils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Clock, Package, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
];

export const LaundryBookingForm: React.FC = () => {
  const { user } = useAuth();
  const { isProcessing, initiateLaundryPayment } = useLaundryBooking();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [deliveryTime, setDeliveryTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [itemsDescription, setItemsDescription] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [estimatedWeight, setEstimatedWeight] = useState([3]);
  const [sameAsPickup, setSameAsPickup] = useState(true);

  // Calculate estimated price based on selected service and weight
  const calculatePrice = () => {
    // Calculate base service price
    const basePrice = 15;
    const perKgPrice = 8;
    const servicePrice = Math.max(basePrice, perKgPrice * estimatedWeight[0]);
    
    // Calculate booking fee and total using the same logic as beauty services
    const { fee, total } = calculateBookingFee(servicePrice);
    
    return {
      servicePrice,
      bookingFee: fee,
      totalPrice: total
    };
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to place an order');
      return;
    }

    if (!selectedService || !pickupDate || !pickupTime || !pickupAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    const bookingData: LaundryBookingData = {
      serviceType: selectedService,
      pickupAddress,
      pickupInstructions,
      deliveryAddress: sameAsPickup ? pickupAddress : deliveryAddress,
      deliveryInstructions: sameAsPickup ? pickupInstructions : deliveryInstructions,
      pickupDate: format(pickupDate, 'yyyy-MM-dd'),
      pickupTime,
      deliveryDate: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : '',
      deliveryTime,
      itemsDescription,
      specialInstructions,
      estimatedWeight: estimatedWeight[0],
      totalAmount: calculatePrice().totalPrice,
    };

    const result = await initiateLaundryPayment(bookingData);
    
    if (result.success && result.paymentUrl) {
      window.location.href = result.paymentUrl;
    } else {
      toast.error(result.error || 'Failed to initiate payment');
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedService) {
      toast.error('Please select a laundry service');
      return;
    }
    if (step === 2 && (!pickupDate || !pickupTime || !pickupAddress)) {
      toast.error('Please fill in pickup details');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to place a laundry order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/login">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
              step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {num}
            </div>
            {num < 3 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                step > num ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Select Service & Weight
            </CardTitle>
            <CardDescription>
              Choose your preferred laundry service and estimate the weight of your items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Estimated Weight (kg)</Label>
              <div className="mt-2">
                <Slider
                  value={estimatedWeight}
                  onValueChange={setEstimatedWeight}
                  max={20}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>1kg</span>
                  <span className="font-semibold">{estimatedWeight[0]}kg</span>
                  <span>20kg</span>
                </div>
              </div>
            </div>

            <LaundryServiceSelector
              selectedService={selectedService}
              onServiceSelect={setSelectedService}
              estimatedWeight={estimatedWeight[0]}
            />

            <Button 
              onClick={nextStep} 
              className="w-full"
              disabled={!selectedService}
            >
              Continue to Pickup Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pickup & Delivery Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Pickup & Delivery Details
            </CardTitle>
            <CardDescription>
              Specify where and when we should pickup and deliver your items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pickup Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pickup Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Pickup Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !pickupDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, "PPP") : <span>Select pickup date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Pickup Time *</Label>
                  <Select value={pickupTime} onValueChange={setPickupTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-3.5 w-3.5" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address *</Label>
                <Textarea
                  id="pickupAddress"
                  placeholder="Enter full pickup address including landmarks"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupInstructions">Pickup Instructions</Label>
                <Textarea
                  id="pickupInstructions"
                  placeholder="Any special instructions for pickup (gate code, apartment number, etc.)"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Delivery Information</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameAsPickup"
                  checked={sameAsPickup}
                  onCheckedChange={(checked) => setSameAsPickup(checked === true)}
                />
                <Label htmlFor="sameAsPickup">
                  Deliver to same address as pickup
                </Label>
              </div>

              {!sameAsPickup && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">Delivery Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !deliveryDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {deliveryDate ? format(deliveryDate, "PPP") : <span>Select delivery date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={deliveryDate}
                            onSelect={setDeliveryDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Delivery Time</Label>
                      <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-3.5 w-3.5" />
                                {time}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Textarea
                      id="deliveryAddress"
                      placeholder="Enter full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                    <Textarea
                      id="deliveryInstructions"
                      placeholder="Any special instructions for delivery"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Continue to Summary
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Order Summary & Additional Details */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemsDescription">Items Description</Label>
                <Textarea
                  id="itemsDescription"
                  placeholder="Describe the items you're sending (e.g., 5 shirts, 3 trousers, bedsheets)"
                  value={itemsDescription}
                  onChange={(e) => setItemsDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Any special care instructions (delicate items, stain treatment, etc.)"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Estimated Weight:</span>
                  <span className="font-semibold">{estimatedWeight[0]}kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup Date:</span>
                  <span>{pickupDate ? format(pickupDate, "PPP") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup Time:</span>
                  <span>{pickupTime || "Not selected"}</span>
                </div>
                <div className="border-t pt-2 space-y-2">
                  <div className="flex justify-between">
                    <span>Service Cost:</span>
                    <span>{formatPrice(calculatePrice().servicePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Booking Fee:</span>
                    <span>{formatPrice(calculatePrice().bookingFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total to Pay Now:</span>
                    <span>{formatPrice(calculatePrice().bookingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Pay at Pickup:</span>
                    <span>{formatPrice(calculatePrice().servicePrice)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};