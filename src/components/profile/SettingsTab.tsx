
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import DeleteAccountDialog from "./DeleteAccountDialog";

interface SettingsTabProps {
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (value: boolean) => void;
}

const SettingsTab = ({ 
  emailNotifications, 
  setEmailNotifications, 
  smsNotifications, 
  setSmsNotifications 
}: SettingsTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const toggleEmailNotifications = (checked: boolean) => {
    setEmailNotifications(checked);
    toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const toggleSmsNotifications = (checked: boolean) => {
    setSmsNotifications(checked);
    toast.success(`SMS notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Account Settings</h1>
      <p className="text-muted-foreground">
        Manage your account settings and preferences.
      </p>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive email notifications for appointments</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={toggleEmailNotifications} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive SMS reminders for appointments</p>
              </div>
              <Switch 
                checked={smsNotifications} 
                onCheckedChange={toggleSmsNotifications} 
              />
            </div>
            <div className="h-px bg-border my-2"></div>
            <div>
              <h3 className="font-medium mb-2">Change Password</h3>
              <Button variant="outline">Update Password</Button>
            </div>
            <div className="h-px bg-border my-2"></div>
            <div>
              <h3 className="font-medium mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="outline" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
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

export default SettingsTab;
