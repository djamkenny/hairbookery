import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

interface WorkingHours {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const AvailabilitySettings = () => {
  const [dailyAppointmentLimit, setDailyAppointmentLimit] = useState(10);
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
  ]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error getting user:", userError);
          return;
        }

        if (user) {
          setUser(user);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('availability, daily_appointment_limit')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error loading profile:", profileError);
            toast.error("Failed to load settings");
          } else if (profileData) {
            setAvailabilityEnabled(profileData.availability !== false);
            setDailyAppointmentLimit(profileData.daily_appointment_limit || 10);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load settings");
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          availability: availabilityEnabled,
          daily_appointment_limit: dailyAppointmentLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
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
            Availability Settings
          </CardTitle>
          <CardDescription>
            Control your availability and appointment limits
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
              checked={availabilityEnabled}
              onCheckedChange={setAvailabilityEnabled}
              disabled={loading}
            />
          </div>
          
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
              className="w-full max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Maximum appointments per day (currently used by booking system)
            </p>
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