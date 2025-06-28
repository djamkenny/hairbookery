
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DeleteAccountDialog from "../profile/DeleteAccountDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const StylistSettingsTab = () => {
  const [availability, setAvailability] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [bookingMode, setBookingMode] = useState("auto");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();

  // Load user data and settings on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          // Load settings from user metadata or profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            // Load settings from profile if available
            const metadata = user.user_metadata || {};
            setAvailability(metadata.availability !== false); // default to true
            setEmailNotifications(metadata.email_notifications !== false);
            setSmsNotifications(metadata.sms_notifications !== false);
            setBookingMode(metadata.booking_mode || "auto");
          }
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };
    
    loadUserSettings();
  }, []);

  const handleSaveAvailability = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          availability: availability
        }
      });
      
      if (error) throw error;
      
      toast.success(`Your availability is now ${availability ? 'Active' : 'Inactive'}`);
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications
        }
      });
      
      if (error) throw error;
      
      toast.success("Notification preferences updated successfully");
    } catch (error: any) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notification preferences: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBookingMode = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          booking_mode: bookingMode
        }
      });
      
      if (error) throw error;
      
      toast.success(`Booking mode changed to: ${bookingMode === "auto" ? "Automatic" : "Manual"}`);
    } catch (error: any) {
      console.error("Error updating booking mode:", error);
      toast.error("Failed to update booking mode: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    // Redirect to password reset
    toast.info("Password reset email will be sent to your registered email address");
    
    supabase.auth.resetPasswordForEmail(user?.email || '', {
      redirectTo: `${window.location.origin}/reset-password`
    }).then(({ error }) => {
      if (error) {
        toast.error("Failed to send password reset email: " + error.message);
      } else {
        toast.success("Password reset email sent! Check your inbox.");
      }
    });
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <h1 className="text-2xl font-semibold">Settings</h1>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>
            Toggle your availability to control whether clients can book appointments with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="availability" className={`${isMobile ? 'text-sm' : 'text-base'} mr-2`}>Available for bookings</Label>
              <Switch 
                id="availability" 
                checked={availability}
                onCheckedChange={setAvailability}
                disabled={loading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {availability 
                ? "You're currently available for new bookings" 
                : "You're currently not available for new bookings"}
            </p>
            <Button 
              onClick={handleSaveAvailability}
              className="self-end"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications about bookings and client messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="max-w-[80%]">
                <Label htmlFor="email-notifications" className={`${isMobile ? 'text-sm' : 'text-base'}`}>Email Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive notifications via email
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="max-w-[80%]">
                <Label htmlFor="sms-notifications" className={`${isMobile ? 'text-sm' : 'text-base'}`}>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive notifications via text message
                </p>
              </div>
              <Switch 
                id="sms-notifications" 
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                disabled={loading}
              />
            </div>
            
            <Button 
              onClick={handleSaveNotifications}
              className="self-end"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Booking Settings</CardTitle>
          <CardDescription>
            Control how client bookings are handled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            <RadioGroup 
              value={bookingMode} 
              onValueChange={setBookingMode}
              className="flex flex-col space-y-3"
              disabled={loading}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="auto" id="auto" disabled={loading} />
                <div className="flex flex-col">
                  <Label htmlFor="auto" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>Automatic Approval</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    All booking requests are automatically approved if you're available
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="manual" id="manual" disabled={loading} />
                <div className="flex flex-col">
                  <Label htmlFor="manual" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>Manual Approval</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll need to manually approve all booking requests
                  </p>
                </div>
              </div>
            </RadioGroup>
            
            <Button 
              onClick={handleSaveBookingMode}
              className="self-end"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium mb-1`}>Change Password</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Send a password reset link to your email address
              </p>
              <Button 
                variant="outline" 
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "Sending..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium mb-1`}>Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="outline" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DeleteAccountDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
};

export default StylistSettingsTab;
