
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReadOnlyProfileDisplay from "./profile/ReadOnlyProfileDisplay";

interface SpecialistInfoTabProps {
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

const SpecialistInfoTab = ({
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
}: SpecialistInfoTabProps) => {
  const [location, setLocation] = useState("");
  
  // Fetch the location from user metadata or profile when component mounts
  useEffect(() => {
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

  // Handle navigation to settings
  const handleEditProfile = () => {
    // Get the current tabs component and switch to settings
    const tabsList = document.querySelector('[role="tablist"]');
    const settingsTab = tabsList?.querySelector('[data-value="settings"]') as HTMLElement;
    if (settingsTab) {
      settingsTab.click();
    }
  };

  return (
    <ReadOnlyProfileDisplay
      user={user}
      fullName={fullName}
      email={email}
      phone={phone}
      specialty={specialty}
      experience={experience}
      bio={bio}
      avatarUrl={avatarUrl}
      location={location}
      onEditProfile={handleEditProfile}
    />
  );
};

export default SpecialistInfoTab;
