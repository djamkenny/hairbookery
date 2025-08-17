import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Plus, X } from "lucide-react";

interface WorkingHours {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const AvailabilitySettings = () => {
  const [availability, setAvailability] = useState(true);
  const [dailyAppointmentLimit, setDailyAppointmentLimit] = useState(10);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: "Monday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "Thursday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "Friday", enabled: true, startTime: "09:00", endTime: "17:00" },
    { day: "Saturday", enabled: false, startTime: "10:00", endTime: "16:00" },
    { day: "Sunday", enabled: false, startTime: "10:00", endTime: "16:00" },
  ]);
  const [breakDuration, setBreakDuration] = useState(30);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            setAvailability(profileData.availability !== false);
            setDailyAppointmentLimit(profileData.daily_appointment_limit || 10);
            
            const metadata = user.user_metadata || {};
            if (metadata.working_hours) {
              setWorkingHours(metadata.working_hours);
            }
            setBreakDuration(metadata.break_duration || 30);
            setAdvanceBookingDays(metadata.advance_booking_days || 30);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHours, value: any) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          availability: availability,
          daily_appointment_limit: dailyAppointmentLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Update user metadata with working hours and other settings
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          availability: availability,
          daily_appointment_limit: dailyAppointmentLimit,
          working_hours: workingHours,
          break_duration: breakDuration,
          advance_booking_days: advanceBookingDays
        }
      });
      
      if (userError) throw userError;
      
      toast.success("Availability settings updated successfully");
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            General Availability
          </CardTitle>
          <CardDescription>
            Control your overall availability and appointment limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="availability" className="text-base font-medium">
                Accept new bookings
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                When disabled, clients won't be able to book new appointments
              </p>
            </div>
            <Switch 
              id="availability" 
              checked={availability}
              onCheckedChange={setAvailability}
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="daily-limit" className="text-base font-medium">
                Daily appointment limit
              </Label>
              <Input
                id="daily-limit"
                type="number"
                min="1"
                max="50"
                value={dailyAppointmentLimit}
                onChange={(e) => setDailyAppointmentLimit(parseInt(e.target.value) || 1)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Maximum appointments per day
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="advance-booking" className="text-base font-medium">
                Advance booking window
              </Label>
              <Select 
                value={advanceBookingDays.toString()} 
                onValueChange={(value) => setAdvanceBookingDays(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="60">2 months</SelectItem>
                  <SelectItem value="90">3 months</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How far in advance clients can book
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>
            Set your working hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workingHours.map((day, index) => (
              <div key={day.day} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-20">
                  <Badge variant={day.enabled ? "default" : "secondary"}>
                    {day.day}
                  </Badge>
                </div>
                
                <Switch
                  checked={day.enabled}
                  onCheckedChange={(enabled) => handleWorkingHoursChange(index, 'enabled', enabled)}
                />
                
                {day.enabled && (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </>
                )}
                
                {!day.enabled && (
                  <span className="text-muted-foreground text-sm">Not available</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Settings</CardTitle>
          <CardDescription>
            Configure appointment-specific settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="break-duration" className="text-base font-medium">
                Break between appointments
              </Label>
              <Select 
                value={breakDuration.toString()} 
                onValueChange={(value) => setBreakDuration(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Buffer time between appointments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default AvailabilitySettings;