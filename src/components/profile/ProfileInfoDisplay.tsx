
import React from "react";

interface ProfileInfoDisplayProps {
  fullName: string;
  email: string;
  phone: string;
}

const ProfileInfoDisplay = ({ fullName, email, phone }: ProfileInfoDisplayProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Full Name</label>
          <p className="font-medium">{fullName}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <p className="font-medium">{email}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Phone</label>
          <p className="font-medium">{phone}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoDisplay;
