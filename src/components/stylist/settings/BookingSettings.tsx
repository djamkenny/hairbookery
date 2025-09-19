import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";

const BookingSettings = ({ onRefresh }: { onRefresh?: () => Promise<void> }) => {
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [cancellationWindow, setCancellationWindow] = useState(24);
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
          setAutoConfirm(metadata.auto_confirm !== false);
          setCancellationWindow(metadata.cancellation_window || 24);
        }
      } catch (error) {
        console.error("Error loading booking settings:", error);
        toast.error("Failed to load booking settings");
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
          auto_confirm: autoConfirm,
          cancellation_window: cancellationWindow
        }
      });
      
      if (error) throw error;
      
      toast.success("Booking preferences updated successfully");
      
      // Refresh parent component
      if (onRefresh) {
        await onRefresh();
      }
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
            <Calendar className="h-5 w-5" />
            Booking Preferences
          </CardTitle>
          <CardDescription>
            Control how clients can book appointments with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-confirm" className="text-base font-medium">
                Auto-confirm bookings
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically confirm new bookings without manual approval
              </p>
            </div>
            <Switch 
              id="auto-confirm" 
              checked={autoConfirm}
              onCheckedChange={setAutoConfirm}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="cancellation-window" className="text-base font-medium">
              Cancellation window
            </Label>
            <Select 
              value={cancellationWindow.toString()} 
              onValueChange={(value) => setCancellationWindow(parseInt(value))}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Minimum time before appointment when cancellation is allowed
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

export default BookingSettings;