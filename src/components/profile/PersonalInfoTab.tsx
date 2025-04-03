
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon } from "lucide-react";
import ProfileInfoForm from "./ProfileInfoForm";
import ProfileInfoDisplay from "./ProfileInfoDisplay";
import ProfileAvatar from "./ProfileAvatar";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoTabProps {
  user: any;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  phone: string;
  setPhone: (phone: string) => void;
  avatarUrl: string | null;
  refreshUserProfile: () => Promise<void>;
}

const PersonalInfoTab = ({ 
  user, 
  fullName, 
  setFullName, 
  email, 
  phone, 
  setPhone,
  avatarUrl,
  refreshUserProfile
}: PersonalInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Function to refresh user data when avatar is updated
  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    // Call the refreshUserProfile function to update all user data
    await refreshUserProfile();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Personal Information</h1>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {isEditing ? (
            <ProfileInfoForm 
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              phone={phone}
              setPhone={setPhone}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileInfoDisplay 
              fullName={fullName}
              email={email}
              phone={phone}
            />
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileAvatar 
            user={user} 
            fullName={fullName} 
            avatarUrl={avatarUrl}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoTab;
