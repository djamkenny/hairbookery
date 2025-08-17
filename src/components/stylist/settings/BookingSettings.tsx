import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, DollarSign, Settings } from "lucide-react";

interface BookingPreferences {
  mode: "auto" | "manual";
  requireDeposit: boolean;
  depositAmount: number;
  depositType: "fixed" | "percentage";
  allowSameDayBooking: boolean;
  minimumNotice: number;
  cancellationPolicy: string;
  reschedulePolicy: string;
  autoConfirmation: boolean;
  bufferTime: number;
  maxAdvanceBooking: number;
  instantBooking: boolean;
}

const BookingSettings = () => {
  const [preferences, setPreferences] = useState<BookingPreferences>({
    mode: "auto",
    requireDeposit: false,
    depositAmount: 50,
    depositType: "fixed",
    allowSameDayBooking: true,
    minimumNotice: 2,
    cancellationPolicy: "24",
    reschedulePolicy: "12",
    autoConfirmation: true,
    bufferTime: 15,
    maxAdvanceBooking: 60,
    instantBooking: true,
  });
  const [customPolicies, setCustomPolicies] = useState({
    cancellation: "",
    reschedule: "",
    noShow: "",
  });
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
          console.log("Booking settings - User loaded:", user.id);
          
          const metadata = user.user_metadata || {};
          console.log("User metadata for booking:", metadata);
          if (metadata.booking_preferences) {
            console.log("Loading booking preferences:", metadata.booking_preferences);
            setPreferences({ ...preferences, ...metadata.booking_preferences });
          }
          if (metadata.custom_policies) {
            console.log("Loading custom policies:", metadata.custom_policies);
            setCustomPolicies({ ...customPolicies, ...metadata.custom_policies });
          }
        }
      } catch (error) {
        console.error("Error loading booking settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const updatePreference = (key: keyof BookingPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateCustomPolicy = (key: keyof typeof customPolicies, value: string) => {
    setCustomPolicies(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          booking_preferences: preferences,
          custom_policies: customPolicies,
          booking_mode: preferences.mode // Keep legacy field for compatibility
        }
      });
      
      if (error) throw error;
      
      toast.success("Booking preferences updated successfully");
    } catch (error: any) {
      console.error("Error updating booking settings:", error);
      toast.error("Failed to update booking preferences: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Booking Mode
          </CardTitle>
          <CardDescription>
            Choose how client booking requests are handled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={preferences.mode} 
            onValueChange={(value: "auto" | "manual") => updatePreference('mode', value)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="auto" id="auto" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="auto" className="text-base font-medium">
                  Automatic Approval
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Bookings are automatically confirmed if you're available. Faster for clients.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value="manual" id="manual" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="manual" className="text-base font-medium">
                  Manual Approval
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and approve each booking request manually. More control for you.
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment & Deposits
          </CardTitle>
          <CardDescription>
            Configure deposit requirements and payment policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Require deposit</Label>
              <p className="text-sm text-muted-foreground">
                Require clients to pay a deposit when booking
              </p>
            </div>
            <Switch
              checked={preferences.requireDeposit}
              onCheckedChange={(checked) => updatePreference('requireDeposit', checked)}
            />
          </div>

          {preferences.requireDeposit && (
            <div className="space-y-4 ml-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deposit type</Label>
                  <Select
                    value={preferences.depositType}
                    onValueChange={(value: "fixed" | "percentage") => updatePreference('depositType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                      <SelectItem value="percentage">Percentage of total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>
                    {preferences.depositType === 'fixed' ? 'Amount (GHS)' : 'Percentage (%)'}
                  </Label>
                  <Input
                    type="number"
                    value={preferences.depositAmount}
                    onChange={(e) => updatePreference('depositAmount', parseFloat(e.target.value) || 0)}
                    min="0"
                    max={preferences.depositType === 'percentage' ? 100 : undefined}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Booking Windows & Timing
          </CardTitle>
          <CardDescription>
            Set timing restrictions for bookings and cancellations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Minimum booking notice</Label>
              <Select
                value={preferences.minimumNotice.toString()}
                onValueChange={(value) => updatePreference('minimumNotice', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No minimum</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Minimum time before appointment that clients can book
              </p>
            </div>

            <div className="space-y-3">
              <Label>Maximum advance booking</Label>
              <Select
                value={preferences.maxAdvanceBooking.toString()}
                onValueChange={(value) => updatePreference('maxAdvanceBooking', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How far in advance clients can book
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Allow same-day booking</Label>
              <p className="text-sm text-muted-foreground">
                Let clients book appointments for today
              </p>
            </div>
            <Switch
              checked={preferences.allowSameDayBooking}
              onCheckedChange={(checked) => updatePreference('allowSameDayBooking', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cancellation & Rescheduling
          </CardTitle>
          <CardDescription>
            Define your policies for cancellations and rescheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Cancellation notice required</Label>
              <Select
                value={preferences.cancellationPolicy}
                onValueChange={(value) => updatePreference('cancellationPolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Reschedule notice required</Label>
              <Select
                value={preferences.reschedulePolicy}
                onValueChange={(value) => updatePreference('reschedulePolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Custom cancellation policy</Label>
              <Textarea
                placeholder="Describe your cancellation policy in detail..."
                value={customPolicies.cancellation}
                onChange={(e) => updateCustomPolicy('cancellation', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Custom rescheduling policy</Label>
              <Textarea
                placeholder="Describe your rescheduling policy..."
                value={customPolicies.reschedule}
                onChange={(e) => updateCustomPolicy('reschedule', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>No-show policy</Label>
              <Textarea
                placeholder="Describe what happens when clients don't show up..."
                value={customPolicies.noShow}
                onChange={(e) => updateCustomPolicy('noShow', e.target.value)}
                className="min-h-[80px]"
              />
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

export default BookingSettings;