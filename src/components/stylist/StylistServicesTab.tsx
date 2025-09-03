
import React, { useState, useEffect } from "react";
import { ProfessionServiceSelector } from "./services/ProfessionServiceSelector";
import { BeautyServiceForm } from "./services/BeautyServiceForm";
import { LaundryServiceForm } from "./services/LaundryServiceForm";
import { CleaningServiceForm } from "./services/CleaningServiceForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SpecialistServicesTab = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState<'beauty' | 'laundry' | 'cleaning' | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);
      
      // Set profession based on profile
      if (profile?.is_cleaning_specialist) {
        setSelectedProfession('cleaning');
      } else if (profile?.is_laundry_specialist) {
        setSelectedProfession('laundry');
      } else if (profile?.is_stylist) {
        setSelectedProfession('beauty');
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionSelect = (profession: 'beauty' | 'laundry' | 'cleaning') => {
    setSelectedProfession(profession);
    fetchUserProfile(); // Refresh profile to get updated data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no profession is selected, show profession selector
  if (!selectedProfession) {
    return (
      <ProfessionServiceSelector 
        onProfessionSelect={handleProfessionSelect}
        selectedProfession={selectedProfession}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Show profession selector for changing */}
      <ProfessionServiceSelector 
        onProfessionSelect={handleProfessionSelect}
        selectedProfession={selectedProfession}
      />
      
      {/* Show appropriate service form */}
      {selectedProfession === 'beauty' && (
        <BeautyServiceForm onServicesChange={fetchUserProfile} />
      )}
      
      {selectedProfession === 'laundry' && (
        <LaundryServiceForm onServicesChange={fetchUserProfile} />
      )}
      
      {selectedProfession === 'cleaning' && (
        <CleaningServiceForm onServicesChange={fetchUserProfile} />
      )}
    </div>
  );
};

export default SpecialistServicesTab;
