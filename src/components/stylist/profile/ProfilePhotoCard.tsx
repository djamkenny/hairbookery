
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

interface ProfilePhotoCardProps {
  user: any;
  fullName: string;
  avatarUrl: string | null;
  onAvatarUpdate: (newAvatarUrl: string) => Promise<void>;
}

const ProfilePhotoCard = ({
  user,
  fullName,
  avatarUrl,
  onAvatarUpdate
}: ProfilePhotoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileAvatar 
          user={user}
          fullName={fullName}
          avatarUrl={avatarUrl} 
          onAvatarUpdate={onAvatarUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default ProfilePhotoCard;
