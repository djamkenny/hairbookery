import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/components/booking/utils/formatUtils";
import { calculateBookingFee } from "@/components/booking/utils/feeUtils";
import { useCleaningBooking } from "@/hooks/useCleaningBooking";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Clock, Package, ChevronRight, Home, Users, Bath, Square, Loader2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
];

interface CleaningService {
  id: string;
  name: string;
  description: string;
  duration_hours: number;
  service_category: string;
}

interface CleaningBookingFormProps {
  specialistId?: string;
}

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "office", label: "Office" },
  { value: "commercial", label: "Commercial Space" }
];

export const CleaningBookingForm: React.FC<CleaningBookingFormProps> = ({ specialistId }) => {
  const { user } = useAuth();
  const { isProcessing, initiateCleaningPayment } = useCleaningBooking();
  const isMobile = useIsMobile();
  
  const [step, setStep] = useState(1);
  const [availableServices, setAvailableServices] = useState<CleaningService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceType, setServiceType] = useState("");
  const [serviceDate, setServiceDate] = useState<Date>();
  const [serviceTime, setServiceTime] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  
  // Property details
  const [propertyType, setPropertyType] = useState("");
  const [numRooms, setNumRooms] = useState("");
  const [numBathrooms, setNumBathrooms] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(3);

  useEffect(() => {
    fetchCleaningServices();
    // Initialize customer data from user profile
    if (user) {
      const initializeCustomerData = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            if (profile.full_name && !customerName) setCustomerName(profile.full_name);
            if (profile.email && !customerEmail) setCustomerEmail(profile.email);
            if (profile.phone && !customerPhone) setCustomerPhone(profile.phone);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      };
      
      initializeCustomerData();
    }
  }, [user]);

  const fetchCleaningServices = async () => {
    try {
      setLoadingServices(true);
      let query = supabase
        .from('cleaning_services')
        .select('*')
        .order('name');

      // If specialistId is provided, filter by that specialist
      if (specialistId) {
        query = query.eq('specialist_id', specialistId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cleaning services:', error);
        toast.error('Failed to load cleaning services');
        return;
      }

      setAvailableServices(data || []);
    } catch (error) {
      console.error('Error fetching cleaning services:', error);
      toast.error('Failed to load cleaning services');
    } finally {
      setLoadingServices(false);
    }
  };

  // Fixed booking fee of 5 GHS

  const handleSubmit = async () => {
    if (!user) {
      // Store booking data and redirect to login
      const bookingData = {
        serviceType,
        serviceDate: serviceDate ? format(serviceDate, 'yyyy-MM-dd') : '',
        serviceTime,
        serviceAddress,
        propertyType,
        numRooms,
        numBathrooms,
        squareFootage,
        specialInstructions,
        customerName,
        customerPhone,
        customerEmail,
        specialistId
      };
      
      // Store in sessionStorage for later use
      sessionStorage.setItem('pendingCleaningBooking', JSON.stringify(bookingData));
      
      // Redirect to login with return URL
      const currentUrl = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
      return;
    }

    if (!serviceType || !serviceDate || !serviceTime || !serviceAddress || !customerName || !customerPhone || !customerEmail || !propertyType || !numRooms) {
      toast.error('Please fill in all required fields');
      return;
    }

    const bookingData = {
      serviceType,
      serviceDate: format(serviceDate, 'yyyy-MM-dd'),
      serviceTime,
      serviceAddress,
      propertyType,
      numRooms: parseInt(numRooms) || undefined,
      numBathrooms: parseInt(numBathrooms) || undefined,
      squareFootage: parseInt(squareFootage) || undefined,
      specialInstructions,
      selectedAddons: [], // No addons in this simplified version
      customerName,
      customerPhone,
      customerEmail,
      totalAmount: 5, // Fixed booking fee
      specialistId
    };

    try {
      const result = await initiateCleaningPayment(bookingData);

      if (result.success && result.paymentUrl) {
        if (isMobile) {
          window.location.href = result.paymentUrl;
        } else {
          window.open(result.paymentUrl, '_blank');
        }
      } else {
        toast.error(result.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + error.message);
    }
  };

  const nextStep = () => {
    if (step === 1 && !serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (step === 2 && (!serviceDate || !serviceTime || !serviceAddress)) {
      toast.error('Please fill in service details');
      return;
    }
    if (step === 3 && (!propertyType || !numRooms)) {
      toast.error('Please fill in property details');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
              step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {num}
            </div>
            {num < 4 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                step > num ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Service Type Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Select Service Type
            </CardTitle>
            <CardDescription>
              Choose the type of cleaning service you need
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingServices ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading cleaning services...</p>
              </div>
            ) : availableServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No cleaning services available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableServices.map((service) => (
                  <Card 
                    key={service.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-2",
                      serviceType === service.id ? "border-primary bg-primary/5" : "hover:border-primary"
                    )}
                    onClick={() => setServiceType(service.id)}
                  >
                     <CardContent className="p-4">
                       <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{service.name}</h3>
                          </div>
                         <p className="text-sm text-muted-foreground">{service.description || 'Professional cleaning service'}</p>
                         <div className="text-xs text-muted-foreground italic">
                           Specialist will contact you for more details about the pricing
                         </div>
                       </div>
                     </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button 
              onClick={nextStep} 
              className="w-full"
              disabled={!serviceType}
            >
              Continue to Service Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Service Date, Time & Location */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Service Details
            </CardTitle>
            <CardDescription>
              When and where should we provide the service?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceDate">Service Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !serviceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {serviceDate ? format(serviceDate, "PPP") : <span>Select service date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={serviceDate}
                      onSelect={setServiceDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceTime">Service Time *</Label>
                <Select value={serviceTime} onValueChange={setServiceTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service time" />
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
              <Label htmlFor="serviceAddress">Service Address *</Label>
              <Textarea
                id="serviceAddress"
                placeholder="Enter the full address where cleaning will take place"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Continue to Property Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Property Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Property Details
            </CardTitle>
            <CardDescription>
              Tell us about your property for accurate pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numRooms">Number of Rooms *</Label>
                <Select value={numRooms} onValueChange={setNumRooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        <div className="flex items-center">
                          <Users className="mr-2 h-3.5 w-3.5" />
                          {num} Room{num > 1 ? 's' : ''}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numBathrooms">Number of Bathrooms</Label>
                <Select value={numBathrooms} onValueChange={setNumBathrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        <div className="flex items-center">
                          <Bath className="mr-2 h-3.5 w-3.5" />
                          {num} Bathroom{num > 1 ? 's' : ''}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="squareFootage">Square Footage (optional)</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  placeholder="e.g., 1200"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                />
              </div>
            </div>

            {/* Booking Fee */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Booking Fee (Pay now)</span>
                <span className="text-lg font-semibold text-primary">₵5</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Specialist will contact you for service pricing details
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Continue to Customer Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Customer Details & Confirmation */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Customer Information & Confirmation
            </CardTitle>
            <CardDescription>
              Your information and final booking details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  placeholder="Enter your phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="Enter your email address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special care instructions or notes (e.g., 'pet in the house', 'use eco-friendly products')"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <h4 className="font-semibold text-lg">Booking Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Service</p>
                  <p className="text-muted-foreground">{availableServices.find(s => s.id === serviceType)?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground">{serviceDate && format(serviceDate, "PPP")} at {serviceTime}</p>
                </div>
                <div>
                  <p className="font-medium">Property</p>
                  <p className="text-muted-foreground">{propertyType} • {numRooms} room{parseInt(numRooms) > 1 ? 's' : ''} • {numBathrooms || 1} bathroom{parseInt(numBathrooms || "1") > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="font-medium">Customer</p>
                  <p className="text-muted-foreground">{customerName}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Booking Fee (Pay Now)</span>
                  <span className="text-primary">₵5</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Specialist will contact you for service pricing details
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ₵5 & Book Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};