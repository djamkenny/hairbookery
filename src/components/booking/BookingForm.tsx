
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Time slots available for booking
const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

export const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedStylistId = searchParams.get("stylist");
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [service, setService] = useState<string>("");
  const [stylist, setStylist] = useState<string>(preselectedStylistId || "");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // New state for services and stylists from the database
  const [services, setServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user) {
          setEmail(user.email || "");
          
          // Try to get user's profile info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            setName(profileData.full_name || "");
            setPhone(profileData.phone || "");
          }
        }
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('price');
          
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
        // Fetch stylists (users with is_stylist = true)
        const { data: stylistsData, error: stylistsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_stylist', true);
          
        if (stylistsError) throw stylistsError;
        setStylists(stylistsData || []);
        
        // If a stylist was preselected but not found in the database, reset it
        if (preselectedStylistId && 
            stylistsData && 
            !stylistsData.some(s => s.id === preselectedStylistId)) {
          setStylist("");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load appointment data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [preselectedStylistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to book an appointment");
      navigate("/login");
      return;
    }
    
    if (!date || !service || !stylist || !time || !name || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the date for database
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Insert the appointment into the database
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          client_id: currentUser.id,
          stylist_id: stylist,
          service_id: service,
          appointment_date: formattedDate,
          appointment_time: time,
          notes: notes || null
        }])
        .select();
      
      if (error) throw error;
      
      toast.success("Appointment booked successfully! We'll send you a confirmation email shortly.");
      
      // Reset form
      setDate(undefined);
      setService("");
      setStylist("");
      setTime("");
      setNotes("");
      
      // Redirect to dashboard after successful booking
      navigate("/profile");
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error(error.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price to display as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  // Format duration to display as hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };

  // Find selected service
  const selectedService = service 
    ? services.find(s => s.id === service) 
    : null;
    
  // Find selected stylist
  const selectedStylist = stylist 
    ? stylists.find(s => s.id === stylist) 
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Select Service</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger id="service" className={loading ? "animate-pulse" : ""}>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((svc) => (
                  <SelectItem key={svc.id} value={svc.id}>
                    {svc.name} - {formatPrice(svc.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stylist">Select Stylist</Label>
            <Select value={stylist} onValueChange={setStylist}>
              <SelectTrigger id="stylist" className={loading ? "animate-pulse" : ""}>
                <SelectValue placeholder="Choose a stylist" />
              </SelectTrigger>
              <SelectContent>
                {stylists.map((sty) => (
                  <SelectItem key={sty.id} value={sty.id}>
                    {sty.full_name || "Stylist"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => 
                    date < new Date() || 
                    date.getDay() === 0 // Sunday closed
                  }
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-3.5 w-3.5" />
                      <span>{slot}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={currentUser !== null} // Disable if user is logged in
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests or Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any special requests or notes for your stylist"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Booking Summary</h3>
              {selectedService && (
                <span className="text-primary font-medium">
                  {formatPrice(selectedService.price)}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Service</p>
                <p className="font-medium">
                  {selectedService ? selectedService.name : "Not selected"}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Stylist</p>
                <p className="font-medium">
                  {selectedStylist ? selectedStylist.full_name : "Not selected"}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {date ? format(date, "PPP") : "Not selected"}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">
                  {time || "Not selected"}
                </p>
              </div>
              
              {selectedService && (
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {formatDuration(selectedService.duration)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !currentUser}
      >
        {isSubmitting ? (
          <div className="loading-dots">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        ) : (
          "Confirm Booking"
        )}
      </Button>
      
      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-center">
          <p className="text-yellow-800 text-sm">
            You need to <a href="/login" className="text-primary font-medium hover:underline">log in</a> to book an appointment
          </p>
        </div>
      )}
      
      <p className="text-center text-sm text-muted-foreground">
        By booking an appointment, you agree to our{" "}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
};

export default BookingForm;
