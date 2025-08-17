import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Mail, MessageSquare, Calendar } from "lucide-react";

interface NotificationPreferences {
  email: {
    newBooking: boolean;
    cancelledBooking: boolean;
    rescheduleRequest: boolean;
    paymentReceived: boolean;
    weeklyReport: boolean;
    marketingUpdates: boolean;
  };
  sms: {
    newBooking: boolean;
    upcomingAppointment: boolean;
    cancelledBooking: boolean;
    paymentReceived: boolean;
  };
  push: {
    newBooking: boolean;
    upcomingAppointment: boolean;
    messages: boolean;
    reminders: boolean;
  };
  timing: {
    emailDigest: string;
    reminderTime: string;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: {
      newBooking: true,
      cancelledBooking: true,
      rescheduleRequest: true,
      paymentReceived: true,
      weeklyReport: true,
      marketingUpdates: false,
    },
    sms: {
      newBooking: true,
      upcomingAppointment: true,
      cancelledBooking: true,
      paymentReceived: false,
    },
    push: {
      newBooking: true,
      upcomingAppointment: true,
      messages: true,
      reminders: true,
    },
    timing: {
      emailDigest: "daily",
      reminderTime: "2_hours",
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
    },
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
          console.log("Notification settings - User loaded:", user.id);
          
          const metadata = user.user_metadata || {};
          console.log("User metadata for notifications:", metadata);
          if (metadata.notification_preferences) {
            console.log("Loading notification preferences:", metadata.notification_preferences);
            setNotifications({ ...notifications, ...metadata.notification_preferences });
          } else {
            console.log("No notification preferences found, using defaults");
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const updateNotificationSetting = (category: keyof NotificationPreferences, setting: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const updateTimingSetting = (setting: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        [setting]: value
      }
    }));
  };

  const updateQuietHours = (setting: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        quietHours: {
          ...prev.timing.quietHours,
          [setting]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          notification_preferences: notifications
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
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {getNotificationDescription(key, 'email')}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updateNotificationSetting('email', key, checked)}
                disabled={loading}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Get important updates via text message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications.sms).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {getNotificationDescription(key, 'sms')}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updateNotificationSetting('sms', key, checked)}
                disabled={loading}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Instant notifications in your browser or app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {getNotificationDescription(key, 'push')}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updateNotificationSetting('push', key, checked)}
                disabled={loading}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timing & Schedule
          </CardTitle>
          <CardDescription>
            Control when and how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Email digest frequency</Label>
              <Select
                value={notifications.timing.emailDigest}
                onValueChange={(value) => updateTimingSetting('emailDigest', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily digest</SelectItem>
                  <SelectItem value="weekly">Weekly digest</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Appointment reminders</Label>
              <Select
                value={notifications.timing.reminderTime}
                onValueChange={(value) => updateTimingSetting('reminderTime', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30_minutes">30 minutes before</SelectItem>
                  <SelectItem value="1_hour">1 hour before</SelectItem>
                  <SelectItem value="2_hours">2 hours before</SelectItem>
                  <SelectItem value="1_day">1 day before</SelectItem>
                  <SelectItem value="never">No reminders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Quiet hours</Label>
                <p className="text-sm text-muted-foreground">
                  Pause non-urgent notifications during these hours
                </p>
              </div>
              <Switch
                checked={notifications.timing.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
                disabled={loading}
              />
            </div>

            {notifications.timing.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-4">
                <div className="space-y-2">
                  <Label className="text-sm">Start time</Label>
                  <input
                    type="time"
                    value={notifications.timing.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">End time</Label>
                  <input
                    type="time"
                    value={notifications.timing.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  />
                </div>
              </div>
            )}
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

const getNotificationDescription = (key: string, type: string): string => {
  const descriptions: Record<string, Record<string, string>> = {
    email: {
      newBooking: "When a client books a new appointment",
      cancelledBooking: "When a client cancels their appointment",
      rescheduleRequest: "When a client requests to reschedule",
      paymentReceived: "When you receive a payment",
      weeklyReport: "Weekly summary of your performance",
      marketingUpdates: "Product updates and promotional content",
    },
    sms: {
      newBooking: "Instant alerts for new bookings",
      upcomingAppointment: "Reminders for upcoming appointments",
      cancelledBooking: "When appointments are cancelled",
      paymentReceived: "Payment confirmation alerts",
    },
    push: {
      newBooking: "Browser notifications for new bookings",
      upcomingAppointment: "Appointment reminder notifications",
      messages: "New messages from clients",
      reminders: "General reminders and alerts",
    },
  };

  return descriptions[type]?.[key] || "";
};

export default NotificationSettings;