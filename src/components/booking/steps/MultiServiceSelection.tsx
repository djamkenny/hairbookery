import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import MultiBookingSummary from "./MultiBookingSummary";

// Time slots available for booking
const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

interface TimeSlotAvailability {
  time: string;
  available: boolean;
  bookingCount: number;
}

interface MultiServiceSelectionProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  services: string[];
  setServices: (services: string[]) => void;
  stylist: string;
  setStylist: (stylist: string) => void;
  time: string;
  setTime: (time: string) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  loading: boolean;
  availableServices: any[];
  stylists: any[];
  selectedServices: any[];
  selectedStylist: any;
  currentUser: any;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
}

const MultiServiceSelection: React.FC<MultiServiceSelectionProps> = ({
  date,
  setDate,
  services,
  setServices,
  stylist,
  setStylist,
  time,
  setTime,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  notes,
  setNotes,
  handleSubmit,
  isSubmitting,
  loading,
  availableServices,
  stylists,
  selectedServices,
  selectedStylist,
  currentUser,
  formatPrice,
  formatDuration,
}) => {
  const [timeSlotAvailability, setTimeSlotAvailability] = useState<TimeSlotAvailability[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Fetch time slot availability when date and stylist change
  useEffect(() => {
    if (!date || !stylist) {
      setTimeSlotAvailability([]);
      return;
    }

    const fetchTimeSlotAvailability = async () => {
      setLoadingTimeSlots(true);
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Get existing appointments for this stylist on this date
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('appointment_time, status')
          .eq('stylist_id', stylist)
          .eq('appointment_date', formattedDate)
          .neq('status', 'canceled');

        if (error) {
          console.error('Error fetching appointments:', error);
          return;
        }

        // Get stylist's daily appointment limit
        const { data: stylistData } = await supabase
          .from('profiles')
          .select('daily_appointment_limit')
          .eq('id', stylist)
          .single();

        const dailyLimit = stylistData?.daily_appointment_limit || 5;

        // Count bookings per time slot
        const bookingCounts: Record<string, number> = {};
        appointments?.forEach(apt => {
          if (apt.appointment_time) {
            bookingCounts[apt.appointment_time] = (bookingCounts[apt.appointment_time] || 0) + 1;
          }
        });

        // Create availability data
        const availability = timeSlots.map(timeSlot => ({
          time: timeSlot,
          bookingCount: bookingCounts[timeSlot] || 0,
          available: (bookingCounts[timeSlot] || 0) < dailyLimit
        }));

        setTimeSlotAvailability(availability);
      } catch (error) {
        console.error('Error fetching time slot availability:', error);
        toast.error('Failed to load time slot availability');
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlotAvailability();
  }, [date, stylist]);
  const handleAddService = (serviceId: string) => {
    if (!services.includes(serviceId)) {
      setServices([...services, serviceId]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setServices(services.filter(id => id !== serviceId));
  };

  const unselectedServices = availableServices.filter(
    service => !services.includes(service.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stylist">Select Specialist</Label>
            <Select value={stylist} onValueChange={setStylist}>
              <SelectTrigger id="stylist" className={loading ? "animate-pulse" : ""}>
                <SelectValue placeholder="Choose a specialist" />
              </SelectTrigger>
              <SelectContent>
                {stylists.map((sty) => (
                  <SelectItem key={sty.id} value={sty.id}>
                    {sty.full_name || "Specialist"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Selected Services</Label>
            <div className="min-h-[100px] border rounded-md p-3 space-y-2">
              {selectedServices.length === 0 ? (
                <p className="text-muted-foreground text-sm">No services selected</p>
              ) : (
                selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between bg-primary/5 rounded-md p-2"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(service.price)} • {formatDuration(service.duration)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(service.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {unselectedServices.length > 0 && stylist && (
            <div className="space-y-2">
              <Label>Add More Services</Label>
              <Select onValueChange={handleAddService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose additional services" />
                </SelectTrigger>
                <SelectContent>
                  {unselectedServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
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
                <SelectTrigger id="time" className={loadingTimeSlots ? "animate-pulse" : ""}>
                  <SelectValue placeholder={loadingTimeSlots ? "Loading times..." : "Choose a time"} />
                </SelectTrigger>
                <SelectContent>
                  {timeSlotAvailability.length > 0 ? (
                    timeSlotAvailability.map((slot) => (
                      <SelectItem 
                        key={slot.time} 
                        value={slot.time}
                        disabled={!slot.available}
                        className={cn(
                          "flex items-center justify-between",
                          !slot.available && "opacity-50"
                        )}
                      >
                        <div className="flex items-center">
                          <Clock className="mr-2 h-3.5 w-3.5" />
                          <span>{slot.time}</span>
                        </div>
                        {slot.bookingCount > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({slot.bookingCount} booked)
                          </span>
                        )}
                        {!slot.available && (
                          <span className="text-xs text-destructive ml-2">
                            Full
                          </span>
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-3.5 w-3.5" />
                          <span>{slot}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {date && stylist && timeSlotAvailability.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {timeSlotAvailability.filter(slot => slot.available).length} of {timeSlots.length} slots available
                </p>
              )}
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
              placeholder="Add any special requests or notes for your specialist"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <MultiBookingSummary 
        selectedServices={selectedServices}
        selectedStylist={selectedStylist}
        date={date}
        time={time}
        formatPrice={formatPrice}
        formatDuration={formatDuration}
      />
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !currentUser || !date || !services.length || !stylist || !time || !name || !phone}
      >
        {isSubmitting ? (
          <div className="loading-dots">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        ) : (
          <span className="flex items-center">
            Continue to Payment
            <ChevronRight className="ml-2 h-4 w-4" />
          </span>
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

export default MultiServiceSelection;