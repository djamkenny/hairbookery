import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
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

// Time slots available for booking
const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

interface ServiceSelectionProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  service: string;
  setService: (service: string) => void;
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
  services: any[];
  stylists: any[];
  selectedService: any;
  selectedStylist: any;
  currentUser: any;
  formatPrice: (price: number) => string;
  formatDuration: (minutes: number) => string;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  date,
  setDate,
  service,
  setService,
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
  services,
  stylists,
  selectedService,
  selectedStylist,
  currentUser,
  formatPrice,
  formatDuration,
}) => {
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
              placeholder="Add any special requests or notes for your specialist"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <BookingSummary 
        selectedService={selectedService}
        selectedStylist={selectedStylist}
        date={date}
        time={time}
        formatPrice={formatPrice}
        formatDuration={formatDuration}
      />
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !currentUser || !date || !service || !stylist || !time || !name || !phone}
      >
        {isSubmitting ? (
          <div className="loading-dots">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        ) : (
          <span className="flex items-center">
            Continue
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

// Import ChevronRight separately to avoid TypeScript errors
import { ChevronRight } from "lucide-react";

// Import the BookingSummary component
import BookingSummary from "./BookingSummary";

export default ServiceSelection;
