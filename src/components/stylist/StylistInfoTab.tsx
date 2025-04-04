
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PersonalInfoCard from "./profile/PersonalInfoCard";
import ProfessionalInfoCard from "./profile/ProfessionalInfoCard";
import LocationCard from "./profile/LocationCard";
import BioCard from "./profile/BioCard";
import ProfilePhotoCard from "./profile/ProfilePhotoCard";

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
  const [location, setLocation] = useState("");
  
  // Fetch the location from user metadata or profile when component mounts
  React.useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Try to get location from user metadata first
        let locationValue = user?.user_metadata?.location || "";
        
        // If not in metadata, try to get from profiles table
        if (!locationValue && user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('location')
              .eq('id', user.id)
              .single();
              
            if (error) {
              console.error("Error fetching location:", error);
            } else if (data && data.location) {
              locationValue = data.location;
            }
          } catch (error) {
            console.error("Error in location fetch:", error);
          }
        }
        
        setLocation(locationValue);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    
    if (user) {
      fetchLocation();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      console.log("Saving profile with location:", location);
      
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
      
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }
      
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
      
      if (userError) {
        console.error("User metadata update error:", userError);
        throw userError;
      }
      
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
        <PersonalInfoCard
          isEditing={isEditing}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          phone={phone}
          setPhone={setPhone}
        />
        
        <ProfessionalInfoCard
          isEditing={isEditing}
          specialty={specialty}
          setSpecialty={setSpecialty}
          experience={experience}
          setExperience={setExperience}
        />
        
        <LocationCard 
          isEditing={isEditing}
          location={location}
          setLocation={setLocation}
          className="md:col-span-2"
        />
        
        <BioCard
          isEditing={isEditing}
          bio={bio}
          setBio={setBio}
          className="md:col-span-2"
        />
        
        <ProfilePhotoCard
          user={user}
          fullName={fullName}
          avatarUrl={avatarUrl}
          onAvatarUpdate={handleAvatarUpdate}
          className="md:col-span-2"
        />
      </div>
    </div>
  );
};

export default StylistInfoTab;
