import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Globe, Palette, Clock } from "lucide-react";

interface GeneralPreferences {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: "12" | "24";
  theme: "light" | "dark" | "system";
  dashboardLayout: "compact" | "comfortable";
  autoRefresh: boolean;
  soundNotifications: boolean;
  defaultView: "calendar" | "list";
  weekStartsOn: "sunday" | "monday";
  compactMode: boolean;
}

const PreferencesSettings = () => {
  const [preferences, setPreferences] = useState<GeneralPreferences>({
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: "GHS",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12",
    theme: "system",
    dashboardLayout: "comfortable",
    autoRefresh: true,
    soundNotifications: true,
    defaultView: "calendar",
    weekStartsOn: "monday",
    compactMode: false,
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
          console.log("General preferences - User loaded:", user.id);
          
          const metadata = user.user_metadata || {};
          console.log("User metadata for general preferences:", metadata);
          if (metadata.general_preferences) {
            console.log("Loading general preferences:", metadata.general_preferences);
            setPreferences({ ...preferences, ...metadata.general_preferences });
          } else {
            console.log("No general preferences found, using defaults");
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };
    
    loadSettings();
  }, []);

  const updatePreference = (key: keyof GeneralPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          general_preferences: preferences
        }
      });
      
      if (error) throw error;
      
      toast.success("Preferences updated successfully");
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const timezones = [
    "Africa/Accra",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Set your preferred language, timezone, and regional formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => updatePreference('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="tw">Twi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => updatePreference('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Currency</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => updatePreference('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => updatePreference('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Time format</Label>
              <p className="text-sm text-muted-foreground">
                Choose between 12-hour and 24-hour time format
              </p>
            </div>
            <Select
              value={preferences.timeFormat}
              onValueChange={(value: "12" | "24") => updatePreference('timeFormat', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12-hour</SelectItem>
                <SelectItem value="24">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <Select
              value={preferences.theme}
              onValueChange={(value: "light" | "dark" | "system") => updatePreference('theme', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Dashboard layout</Label>
              <p className="text-sm text-muted-foreground">
                Choose between compact and comfortable spacing
              </p>
            </div>
            <Select
              value={preferences.dashboardLayout}
              onValueChange={(value: "compact" | "comfortable") => updatePreference('dashboardLayout', value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Compact mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and use smaller elements
              </p>
            </div>
            <Switch
              checked={preferences.compactMode}
              onCheckedChange={(checked) => updatePreference('compactMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Calendar & Schedule
          </CardTitle>
          <CardDescription>
            Configure calendar and scheduling preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Default view</Label>
              <p className="text-sm text-muted-foreground">
                Your preferred view for appointments
              </p>
            </div>
            <Select
              value={preferences.defaultView}
              onValueChange={(value: "calendar" | "list") => updatePreference('defaultView', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Week starts on</Label>
              <p className="text-sm text-muted-foreground">
                First day of the week in calendar views
              </p>
            </div>
            <Select
              value={preferences.weekStartsOn}
              onValueChange={(value: "sunday" | "monday") => updatePreference('weekStartsOn', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Preferences
          </CardTitle>
          <CardDescription>
            Configure system behavior and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto-refresh data</Label>
              <p className="text-sm text-muted-foreground">
                Automatically refresh appointment data every few minutes
              </p>
            </div>
            <Switch
              checked={preferences.autoRefresh}
              onCheckedChange={(checked) => updatePreference('autoRefresh', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Sound notifications</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for new bookings and important alerts
              </p>
            </div>
            <Switch
              checked={preferences.soundNotifications}
              onCheckedChange={(checked) => updatePreference('soundNotifications', checked)}
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

export default PreferencesSettings;