
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BioCardProps {
  isEditing: boolean;
  bio: string;
  setBio: (bio: string) => void;
}

const BioCard = ({
  isEditing,
  bio,
  setBio
}: BioCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bio</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-border rounded-md"
            placeholder="Tell clients about yourself, your skills, and your styling philosophy"
          />
        ) : (
          <p className="text-sm">{bio || "No bio provided yet."}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BioCard;
