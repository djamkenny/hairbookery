import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DeleteAccountDialog from "../../profile/DeleteAccountDialog";
import { Shield, Key, Eye, EyeOff, Smartphone, Mail, AlertTriangle } from "lucide-react";

interface SecurityPreferences {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  profileVisibility: "public" | "private" | "clients_only";
  showLastSeen: boolean;
  allowDataExport: boolean;
  marketingEmails: boolean;
}

const SecuritySettings = () => {
  const [preferences, setPreferences] = useState<SecurityPreferences>({
    twoFactorEnabled: false,
    loginNotifications: true,
    profileVisibility: "public",
    showLastSeen: true,
    allowDataExport: true,
    marketingEmails: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loginSessions, setLoginSessions] = useState<any[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          const metadata = user.user_metadata || {};
          if (metadata.security_preferences) {
            setPreferences({ ...preferences, ...metadata.security_preferences });
          }
        }
      } catch (error) {
        console.error("Error loading security settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const updatePreference = (key: keyof SecurityPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          security_preferences: preferences
        }
      });
      
      if (error) throw error;
      
      toast.success("Security preferences updated successfully");
    } catch (error: any) {
      console.error("Error updating security settings:", error);
      toast.error("Failed to update security preferences: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) throw error;
      
      setPasswords({ current: "", new: "", confirm: "" });
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "Your profile is visible to everyone and appears in search results";
      case "clients_only":
        return "Only your existing clients can view your full profile";
      case "private":
        return "Your profile is hidden from public view";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password & Authentication
          </CardTitle>
          <CardDescription>
            Manage your account password and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-medium">Change Password</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleChangePassword} disabled={loading} size="sm">
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSendPasswordReset}
                disabled={loading}
                size="sm"
              >
                Send Reset Email
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={preferences.twoFactorEnabled ? "default" : "secondary"}>
                  {preferences.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={preferences.twoFactorEnabled}
                  onCheckedChange={(checked) => updatePreference('twoFactorEnabled', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Login notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={preferences.loginNotifications}
              onCheckedChange={(checked) => updatePreference('loginNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy & Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Profile visibility</Label>
            <div className="space-y-3">
              {["public", "clients_only", "private"].map((visibility) => (
                <div
                  key={visibility}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    preferences.profileVisibility === visibility
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => updatePreference('profileVisibility', visibility as any)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        preferences.profileVisibility === visibility
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    />
                    <div>
                      <div className="font-medium capitalize">
                        {visibility.replace('_', ' ')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getVisibilityDescription(visibility)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show last seen</Label>
              <p className="text-sm text-muted-foreground">
                Let clients see when you were last active
              </p>
            </div>
            <Switch
              checked={preferences.showLastSeen}
              onCheckedChange={(checked) => updatePreference('showLastSeen', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Marketing emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive promotional emails about new features and offers
              </p>
            </div>
            <Switch
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => updatePreference('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data & Export
          </CardTitle>
          <CardDescription>
            Manage your data and account deletion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Allow data export</Label>
              <p className="text-sm text-muted-foreground">
                Enable downloading your data for backup or transfer
              </p>
            </div>
            <Switch
              checked={preferences.allowDataExport}
              onCheckedChange={(checked) => updatePreference('allowDataExport', checked)}
            />
          </div>

          {preferences.allowDataExport && (
            <div className="ml-4 p-4 bg-muted/50 rounded-lg">
              <Button variant="outline" size="sm">
                Export My Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Download a copy of all your data in JSON format
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All your data,
                appointments, and client information will be permanently removed.
              </p>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <DeleteAccountDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
};

export default SecuritySettings;