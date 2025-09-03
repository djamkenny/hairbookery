import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  total_price: number;
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

const addonServices = [
  { id: "laundry", label: "Laundry Service", price: 25 },
  { id: "dishwashing", label: "Dishwashing", price: 15 },
  { id: "window_cleaning", label: "Window Cleaning", price: 30 },
  { id: "fridge_cleaning", label: "Fridge/Oven Cleaning", price: 20 },
  { id: "carpet_cleaning", label: "Additional Carpet Cleaning", price: 40 }
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
  const [propertyType, setPropertyType] = useState("");
  const [numRooms, setNumRooms] = useState("");
  const [numBathrooms, setNumBathrooms] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
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

  // Calculate service cost breakdown
  const calculatePriceBreakdown = () => {
    const selectedService = availableServices.find(s => s.id === serviceType);
    const servicePrice = selectedService ? selectedService.total_price / 100 : 0; // Convert from cents to GHS
    
    // Add addon prices
    const addonPrice = selectedAddons.reduce((total, addonId) => {
      const addon = addonServices.find(a => a.id === addonId);
      return total + (addon?.price || 0);
    }, 0);
    
    const totalServiceCost = servicePrice + addonPrice;
    const { fee: bookingFee, total } = calculateBookingFee(totalServiceCost);
    
    return {
      serviceCost: totalServiceCost,
      bookingFee,
      total
    };
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to book a cleaning service');
      return;
    }

    if (!serviceType || !serviceDate || !serviceTime || !serviceAddress || !customerName || !customerPhone || !customerEmail) {
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
      selectedAddons,
      customerName,
      customerPhone,
      customerEmail,
      totalAmount: calculatePriceBreakdown().total,
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
    // Step 3 (Property Details) doesn't require any mandatory fields to proceed
    // Customer information validation will happen on form submission
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
              Please log in to book a cleaning service.
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
                           <span className="text-primary font-bold">{formatPrice(service.total_price / 100)}</span>
                         </div>
                        <p className="text-sm text-muted-foreground">{service.description || 'Professional cleaning service'}</p>
                        <div className="text-xs text-muted-foreground">
                          Duration: {service.duration_hours} hours
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

      {/* Step 3: Property Details & Add-ons */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Property Details
            </CardTitle>
            <CardDescription>
              Tell us about your property and any additional services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
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
                <Label htmlFor="squareFootage">Square Footage (approx.)</Label>
                <div className="relative">
                  <Square className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="squareFootage"
                    type="number"
                    placeholder="e.g., 1200"
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numRooms">Number of Rooms</Label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="numRooms"
                    type="number"
                    placeholder="e.g., 3"
                    value={numRooms}
                    onChange={(e) => setNumRooms(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numBathrooms">Number of Bathrooms</Label>
                <div className="relative">
                  <Bath className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="numBathrooms"
                    type="number"
                    placeholder="e.g., 2"
                    value={numBathrooms}
                    onChange={(e) => setNumBathrooms(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Add-on Services</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {addonServices.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={addon.id}
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={() => handleAddonToggle(addon.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={addon.id} className="font-medium">{addon.label}</Label>
                      <p className="text-sm text-primary font-semibold">+{formatPrice(addon.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Continue to Customer Information
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Customer Information & Summary */}
      {step === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service Type:</span>
                  <span className="font-semibold">{availableServices.find(s => s.id === serviceType)?.name || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Date:</span>
                  <span>{serviceDate ? format(serviceDate, "PPP") : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Time:</span>
                  <span>{serviceTime || "Not selected"}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between">
                    <span>Add-on Services:</span>
                    <span>{selectedAddons.length} selected</span>
                  </div>
                )}
                 <div className="border-t pt-2 space-y-2">
                   <div className="flex justify-between">
                     <span>Service Cost:</span>
                     <span>{formatPrice(calculatePriceBreakdown().serviceCost)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-muted-foreground">
                     <span>Booking Fee:</span>
                     <span>{formatPrice(calculatePriceBreakdown().bookingFee)}</span>
                   </div>
                   <div className="flex justify-between font-bold text-lg border-t pt-2">
                     <span>Total Price:</span>
                     <span className="text-primary">{formatPrice(calculatePriceBreakdown().total)}</span>
                   </div>
                 </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                 <Button 
                   onClick={handleSubmit} 
                   className="flex-1"
                   disabled={!customerName || !customerPhone || !customerEmail || isProcessing}
                 >
                   {isProcessing ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Processing Payment...
                     </>
                   ) : (
                     <>
                       <CreditCard className="mr-2 h-4 w-4" />
                       Pay {formatPrice(calculatePriceBreakdown().total)}
                     </>
                   )}
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};