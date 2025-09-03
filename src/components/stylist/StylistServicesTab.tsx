
import React, { useState, useEffect } from "react";
import { BeautyServiceForm } from "./services/BeautyServiceForm";
import { LaundryServiceForm } from "./services/LaundryServiceForm";
import { CleaningServiceForm } from "./services/CleaningServiceForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const SpecialistServicesTab = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine current profession from profile
  const currentProfession = userProfile?.is_cleaning_specialist ? 'cleaning' :
                            userProfile?.is_laundry_specialist ? 'laundry' : 
                            userProfile?.is_stylist ? 'beauty' : null;

  // If no profession is set, show message to go to settings
  if (!currentProfession) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="h-5 w-5" />
              Service Type Required
            </CardTitle>
            <CardDescription>
              You need to select your service type before you can manage services
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please go to Settings → Service Type to choose whether you want to offer Beauty, Laundry, or Cleaning services.
            </p>
            <Button onClick={() => window.location.href = '/stylist/settings'}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show appropriate service form based on current profession */}
      {currentProfession === 'beauty' && (
        <BeautyServiceForm onServicesChange={fetchUserProfile} />
      )}
      
      {currentProfession === 'laundry' && (
        <LaundryServiceForm onServicesChange={fetchUserProfile} />
      )}
      
      {currentProfession === 'cleaning' && (
        <CleaningServiceForm onServicesChange={fetchUserProfile} />
      )}
    </div>
  );
};

export default SpecialistServicesTab;
