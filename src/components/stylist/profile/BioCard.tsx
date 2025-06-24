
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BioCardProps {
  isEditing: boolean;
  bio: string;
  setBio: (bio: string) => void;
  className?: string;
}

const BioCard = ({
  isEditing,
  bio,
  setBio,
  className
}: BioCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bio</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-sm font-medium">
              Professional Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[120px] resize-none"
              placeholder="Tell clients about yourself, your skills, and your styling philosophy"
            />
            <p className="text-xs text-muted-foreground">
              Share your experience, specialties, and what makes you unique as a stylist
            </p>
          </div>
        ) : (
          <div className="min-h-[60px] flex items-start">
            {bio ? (
              <div className="w-full">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
                  {bio}
                </p>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <p className="text-sm">
                  No bio provided yet. Add a professional bio to tell clients about yourself.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BioCard;
