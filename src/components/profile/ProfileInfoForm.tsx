
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileInfoFormProps {
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  phone: string;
  setPhone: (phone: string) => void;
  onCancel: () => void;
}

const ProfileInfoForm = ({
  fullName,
  setFullName,
  email,
  phone,
  setPhone,
  onCancel
}: ProfileInfoFormProps) => {
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          phone: phone,
        }
      });
      
      if (error) {
        throw error;
      }
      
      onCancel();
      toast.success("Profile information updated successfully");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
        />
        <p className="text-sm text-muted-foreground">
          Email cannot be changed. Contact support for assistance.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="pt-4 flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileInfoForm;
