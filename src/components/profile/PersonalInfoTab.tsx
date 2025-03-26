
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon } from "lucide-react";
import ProfileInfoForm from "./ProfileInfoForm";
import ProfileInfoDisplay from "./ProfileInfoDisplay";
import ProfileAvatar from "./ProfileAvatar";

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
          <ProfileAvatar user={user} fullName={fullName} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoTab;
