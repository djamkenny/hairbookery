
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, MapPinIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

interface StylistInfoTabProps {
  user: any;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  phone: string;
  setPhone: (phone: string) => void;
  specialty: string;
  setSpecialty: (specialty: string) => void;
  experience: string;
  setExperience: (experience: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  avatarUrl: string | null;
  refreshUserProfile: () => Promise<void>;
}

const StylistInfoTab = ({
  user,
  fullName,
  setFullName,
  email,
  phone,
  setPhone,
  specialty,
  setSpecialty,
  experience,
  setExperience,
  bio,
  setBio,
  avatarUrl,
  refreshUserProfile
}: StylistInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(user?.user_metadata?.location || "");

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Update profile data in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone,
          specialty,
          experience,
          bio,
          location,
          is_stylist: true,
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) throw profileError;
      
      // Also update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone,
          specialty,
          experience,
          bio,
          location,
          is_stylist: true
        }
      });
      
      if (userError) throw userError;
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar update
  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    await refreshUserProfile();
  };

  // Format the stylist information for display
  const formatExperience = (exp: string) => {
    if (!exp) return "Not specified";
    return isNaN(Number(exp)) ? exp : `${exp} years`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Stylist Profile</h2>
        {!isEditing ? (
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-md bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    placeholder="Your contact number"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p>{fullName || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p>{email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                  <p>{phone || "Not provided"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    placeholder="e.g. Hair Stylist, Colorist, Barber"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    placeholder="Years of experience or qualifications"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Specialty</h3>
                  <p>{specialty || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
                  <p>{formatExperience(experience)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Salon/Workshop Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="Enter your full salon/workshop address"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Please provide a complete address that clients can use with navigation apps or ride services
                </p>
              </div>
            ) : (
              <div>
                {location ? (
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>{location}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No location provided yet. Add your salon or workshop address.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
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
        
        <Card className="md:col-span-2">
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
    </div>
  );
};

export default StylistInfoTab;
