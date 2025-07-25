import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
  appointmentCount: number;
}

interface AvailabilityCalendarProps {
  specialistId: string;
  onDateTimeSelect?: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  compact?: boolean;
}

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  specialistId,
  onDateTimeSelect,
  selectedDate,
  selectedTime,
  compact = false
}) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [specialistProfile, setSpecialistProfile] = useState<any>(null);

  // Fetch specialist profile for daily limits
  useEffect(() => {
    const fetchSpecialistProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_appointment_limit')
        .eq('id', specialistId)
        .single();

      if (!error && data) {
        setSpecialistProfile(data);
      }
    };

    fetchSpecialistProfile();
  }, [specialistId]);

  // Fetch appointments for the selected date
  useEffect(() => {
    if (!date) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const startDate = startOfDay(date);
        const endDate = endOfDay(date);

        // Get all appointments for this specialist on the selected date
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('appointment_time, status')
          .eq('stylist_id', specialistId)
          .eq('appointment_date', format(date, 'yyyy-MM-dd'))
          .neq('status', 'canceled');

        if (error) {
          console.error('Error fetching appointments:', error);
          toast.error('Failed to load availability');
          return;
        }

        // Count appointments per time slot
        const slotCounts: Record<string, number> = {};
        appointments?.forEach(apt => {
          slotCounts[apt.appointment_time] = (slotCounts[apt.appointment_time] || 0) + 1;
        });

        // Calculate availability for each time slot
        const dailyLimit = specialistProfile?.daily_appointment_limit || 5;
        const slots: TimeSlot[] = timeSlots.map(time => ({
          time,
          appointmentCount: slotCounts[time] || 0,
          available: (slotCounts[time] || 0) < dailyLimit
        }));

        setAvailableSlots(slots);

      } catch (error) {
        console.error('Error fetching availability:', error);
        toast.error('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [date, specialistId, specialistProfile]);

  // Fetch dates with any bookings for calendar highlighting
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('appointment_date')
          .eq('stylist_id', specialistId)
          .neq('status', 'canceled')
          .gte('appointment_date', format(new Date(), 'yyyy-MM-dd'));

        if (!error && appointments) {
          const dates = appointments.map(apt => new Date(apt.appointment_date));
          setBookedDates(dates);
        }
      } catch (error) {
        console.error('Error fetching booked dates:', error);
      }
    };

    fetchBookedDates();
  }, [specialistId]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleTimeSelect = (time: string) => {
    if (date && onDateTimeSelect) {
      onDateTimeSelect(date, time);
    }
  };

  const isDateBooked = (checkDate: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, checkDate));
  };

  const isDateFullyBooked = async (checkDate: Date) => {
    // This would require checking all time slots for the date
    // For now, we'll just highlight dates with any bookings
    return false;
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Quick Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {date ? format(date, "EEEE, MMMM do") : "Select a date"}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.slice(0, 6).map((slot) => (
                <Button
                  key={slot.time}
                  variant={slot.available ? "outline" : "secondary"}
                  size="sm"
                  disabled={!slot.available}
                  className={cn(
                    "text-xs",
                    !slot.available && "opacity-50"
                  )}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
            {availableSlots.some(slot => !slot.available) && (
              <p className="text-xs text-muted-foreground">
                Some slots are fully booked
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => 
              date < new Date() || 
              date.getDay() === 0 // Sunday closed
            }
            modifiers={{
              booked: bookedDates
            }}
            modifiersStyles={{
              booked: { 
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))'
              }
            }}
            className="w-full"
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-primary/10 border border-primary rounded"></div>
              <span className="text-muted-foreground">Has bookings</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span className="text-muted-foreground">Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Times
            {date && (
              <span className="text-sm font-normal text-muted-foreground">
                {format(date, "MMM do")}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!date ? (
            <p className="text-muted-foreground text-center py-8">
              Select a date to view available times
            </p>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={
                    selectedTime === slot.time 
                      ? "default" 
                      : slot.available 
                        ? "outline" 
                        : "secondary"
                  }
                  className={cn(
                    "w-full justify-between",
                    !slot.available && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {slot.time}
                  </span>
                  <div className="flex items-center gap-2">
                    {slot.appointmentCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {slot.appointmentCount}
                      </Badge>
                    )}
                    <Badge 
                      variant={slot.available ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {slot.available ? "Available" : "Booked"}
                    </Badge>
                  </div>
                </Button>
              ))}
              
              {date && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Daily appointment limit: {specialistProfile?.daily_appointment_limit || 5}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityCalendar;