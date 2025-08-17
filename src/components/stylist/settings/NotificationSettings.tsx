import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
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
          const metadata = user.user_metadata || {};
          setEmailNotifications(metadata.email_notifications !== false);
          setSmsNotifications(metadata.sms_notifications === true);
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
        toast.error("Failed to load notification settings");
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive appointment notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base font-medium">
                Email notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive appointment updates via email
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications" className="text-base font-medium">
                SMS notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive appointment updates via SMS (when phone number is provided)
              </p>
            </div>
            <Switch 
              id="sms-notifications" 
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
              disabled={loading}
            />
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

export default NotificationSettings;