import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";

const SecuritySettings = ({ onRefresh }: { onRefresh?: () => Promise<void> }) => {
  const [profileVisible, setProfileVisible] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
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
          setProfileVisible(metadata.profile_visible !== false);
        }
      } catch (error) {
        console.error("Error loading security settings:", error);
        toast.error("Failed to load security settings");
      }
    };
    
    loadSettings();
  }, []);

  const handleSavePrivacy = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          profile_visible: profileVisible
        }
      });
      
      if (error) throw error;
      
      toast.success("Privacy settings updated successfully");
      
      // Refresh parent component
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setPasswordLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password: " + error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can see your profile and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profile-visible" className="text-base font-medium">
                Public profile
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Allow clients to discover and view your profile
              </p>
            </div>
            <Switch 
              id="profile-visible" 
              checked={profileVisible}
              onCheckedChange={setProfileVisible}
              disabled={loading}
            />
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <Button onClick={handleSavePrivacy} disabled={loading}>
            {loading ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for better security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="new-password" className="text-base font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={passwordLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirm-password" className="text-base font-medium">
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={passwordLoading}
            />
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <Button 
            onClick={handlePasswordChange} 
            disabled={passwordLoading || !newPassword || !confirmPassword}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SecuritySettings;