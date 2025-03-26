
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
}

const PersonalInfoTab = ({ 
  user, 
  fullName, 
  setFullName, 
  email, 
  phone, 
  setPhone 
}: PersonalInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh user data when avatar is updated
  const handleAvatarUpdate = async (avatarUrl: string) => {
    // Trigger a refresh by incrementing the refreshTrigger state
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch the latest user data when refreshTrigger changes
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        if (updatedUser && updatedUser.user_metadata) {
          // Update any relevant state with the fresh user data
          if (updatedUser.user_metadata.full_name) {
            setFullName(updatedUser.user_metadata.full_name);
          }
          if (updatedUser.user_metadata.phone) {
            setPhone(updatedUser.user_metadata.phone);
          }
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };

    if (refreshTrigger > 0) {
      refreshUserData();
    }
  }, [refreshTrigger, setFullName, setPhone]);

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
            onAvatarUpdate={handleAvatarUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoTab;
