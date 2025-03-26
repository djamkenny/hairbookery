
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
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

// Sample data
const services = [
  { id: 1, name: "Haircut & Styling", price: "$45" },
  { id: 2, name: "Hair Coloring", price: "$75" },
  { id: 3, name: "Balayage", price: "$120" },
  { id: 4, name: "Blowout & Styling", price: "$35" },
  { id: 5, name: "Deep Conditioning", price: "$30" },
  { id: 6, name: "Hair Extensions", price: "$200" },
];

const stylists = [
  { id: 1, name: "Sophia Rodriguez" },
  { id: 2, name: "Alex Chen" },
  { id: 3, name: "Emma Johnson" },
  { id: 4, name: "Marcus Williams" },
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const BookingForm = () => {
  const [searchParams] = useSearchParams();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!date || !service || !stylist || !time || !name || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Appointment booked successfully! We'll send you a confirmation email shortly.");
      
      // Reset form
      setDate(undefined);
      setService("");
      setStylist("");
      setTime("");
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Select Service</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((svc) => (
                  <SelectItem key={svc.id} value={svc.id.toString()}>
                    {svc.name} - {svc.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stylist">Select Stylist</Label>
            <Select value={stylist} onValueChange={setStylist}>
              <SelectTrigger id="stylist">
                <SelectValue placeholder="Choose a stylist" />
              </SelectTrigger>
              <SelectContent>
                {stylists.map((sty) => (
                  <SelectItem key={sty.id} value={sty.id.toString()}>
                    {sty.name}
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
              {service && (
                <span className="text-primary font-medium">
                  {services.find(s => s.id.toString() === service)?.price}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Service</p>
                <p className="font-medium">
                  {service ? services.find(s => s.id.toString() === service)?.name : "Not selected"}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Stylist</p>
                <p className="font-medium">
                  {stylist ? stylists.find(s => s.id.toString() === stylist)?.name : "Not selected"}
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
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
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
