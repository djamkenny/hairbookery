import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Settings, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Star,
  Edit
} from "lucide-react";
import { useLocationSharing } from "@/hooks/useLocationSharing";

interface ReadOnlyProfileDisplayProps {
  user: any;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  bio: string;
  avatarUrl: string | null;
  location: string;
  onEditProfile: () => void;
}

const ReadOnlyProfileDisplay: React.FC<ReadOnlyProfileDisplayProps> = ({
  user,
  fullName,
  email,
  phone,
  specialty,
  experience,
  bio,
  avatarUrl,
  location,
  onEditProfile
}) => {
  const { shareLocation } = useLocationSharing();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Profile</h2>
          <p className="text-muted-foreground">
            View your professional profile information
          </p>
        </div>
        <Button onClick={onEditProfile} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Edit in Settings
        </Button>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || ""} alt={fullName} />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(fullName || email || "U")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{fullName || "No name set"}</h3>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{phone}</span>
                  </div>
                )}
                {location && (
                  <div 
                    className="flex items-center gap-2 mt-1 cursor-pointer group/location hover:bg-accent/50 rounded-md p-2 -ml-2 transition-all duration-200"
                    onClick={() => shareLocation(location, fullName)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${location} in Google Maps`}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground group-hover/location:text-primary transition-colors" />
                    <span className="text-muted-foreground group-hover/location:text-primary group-hover/location:underline transition-all">
                      {location}
                    </span>
                    <span className="text-xs text-primary opacity-0 group-hover/location:opacity-100 transition-opacity ml-1">
                      View on Map
                    </span>
                  </div>
                )}
              </div>

              {/* Professional Info */}
              <div className="space-y-2">
                {specialty && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{specialty}</Badge>
                  </div>
                )}
                {experience && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{experience}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      {bio && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Edit className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">Want to update your profile?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All profile editing is now done through the Settings section for a unified experience.
              </p>
            </div>
            <Button onClick={onEditProfile} variant="outline">
              Go to Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadOnlyProfileDisplay;