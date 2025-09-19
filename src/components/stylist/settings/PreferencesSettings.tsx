import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";

const PreferencesSettings = ({ onRefresh }: { onRefresh?: () => Promise<void> }) => {
  const [currency, setCurrency] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
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
          setCurrency(metadata.currency || "");
          setTimezone(metadata.timezone || "");
          setLanguage(metadata.language || "");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast.error("Failed to load preferences");
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
          currency,
          timezone,
          language
        }
      });
      
      if (error) throw error;
      
      toast.success("Preferences updated successfully");
      
      // Refresh parent component
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences: " + error.message);
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
            General Preferences
          </CardTitle>
          <CardDescription>
            Customize your dashboard experience and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="currency" className="text-base font-medium">
              Currency
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Used for displaying prices and earnings
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="timezone" className="text-base font-medium">
              Time Zone
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC - Coordinated Universal Time</SelectItem>
                <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                <SelectItem value="WAT">WAT - West Africa Time</SelectItem>
                <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Used for scheduling and appointment times
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="language" className="text-base font-medium">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="tw">Twi</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Interface language preference
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

export default PreferencesSettings;