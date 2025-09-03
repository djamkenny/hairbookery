import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, Shirt, Sparkles, CheckCircle, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfessionServiceSelectorProps {
  onProfessionSelect: (profession: 'beauty' | 'laundry' | 'cleaning') => void;
  selectedProfession?: 'beauty' | 'laundry' | 'cleaning' | null;
}

export const ProfessionServiceSelector: React.FC<ProfessionServiceSelectorProps> = ({
  onProfessionSelect,
  selectedProfession
}) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfessionType = async (profession: 'beauty' | 'laundry' | 'cleaning') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = profession === 'laundry' 
        ? { is_laundry_specialist: true, is_stylist: false, is_cleaning_specialist: false }
        : profession === 'cleaning'
        ? { is_cleaning_specialist: true, is_stylist: false, is_laundry_specialist: false }
        : { is_stylist: true, is_laundry_specialist: false, is_cleaning_specialist: false };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      const specialistType = profession === 'laundry' ? 'Laundry Services Specialist' 
        : profession === 'cleaning' ? 'Cleaning Services Specialist' 
        : 'Beauty Specialist';
      
      toast.success(`Profile updated as ${specialistType}`);
      await fetchUserProfile();
      onProfessionSelect(profession);
    } catch (error: any) {
      console.error('Error updating profession:', error);
      toast.error('Failed to update profession type');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user already has a profession set, show the current selection
  const currentProfession = userProfile?.is_cleaning_specialist ? 'cleaning' :
                            userProfile?.is_laundry_specialist ? 'laundry' : 
                            userProfile?.is_stylist ? 'beauty' : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Service Type</h2>
        <p className="text-muted-foreground">
          Select the type of services you want to offer to set up your profile and dashboard
        </p>
        {currentProfession && (
          <Badge variant="secondary" className="mt-2">
            Current: {currentProfession === 'cleaning' ? 'Cleaning Services Specialist' : 
                     currentProfession === 'laundry' ? 'Laundry Services Specialist' : 'Beauty Specialist'}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Beauty Services */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${
            currentProfession === 'beauty' || selectedProfession === 'beauty' 
              ? 'border-primary bg-primary/5' 
              : 'hover:border-primary'
          }`}
          onClick={() => updateProfessionType('beauty')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4 relative">
              <Scissors className="w-8 h-8 text-white" />
              {currentProfession === 'beauty' && (
                <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-primary bg-background rounded-full" />
              )}
            </div>
            <CardTitle className="text-xl">Beauty & Hair Services</CardTitle>
            <CardDescription>
              Professional hair styling, beauty treatments, and grooming services
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Hair cutting, styling & coloring
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Braiding, extensions & protective styles
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Nail care & beauty treatments
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                In-person appointment booking
              </li>
            </ul>
            
            <Button 
              className="w-full" 
              variant={currentProfession === 'beauty' ? "default" : "outline"}
            >
              {currentProfession === 'beauty' ? 'Current Selection' : 'Choose Beauty Services'}
            </Button>
          </CardContent>
        </Card>

        {/* Laundry Services */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${
            currentProfession === 'laundry' || selectedProfession === 'laundry' 
              ? 'border-primary bg-primary/5' 
              : 'hover:border-primary'
          }`}
          onClick={() => updateProfessionType('laundry')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4 relative">
              <Shirt className="w-8 h-8 text-white" />
              {currentProfession === 'laundry' && (
                <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-primary bg-background rounded-full" />
              )}
            </div>
            <CardTitle className="text-xl">Laundry Services</CardTitle>
            <CardDescription>
              Professional laundry, dry cleaning with pickup and delivery
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Wash, dry & fold services
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Dry cleaning & pressing
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Pickup & delivery scheduling
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Order tracking & status updates
              </li>
            </ul>
            
            <Button 
              className="w-full" 
              variant={currentProfession === 'laundry' ? "default" : "outline"}
            >
              {currentProfession === 'laundry' ? 'Current Selection' : 'Choose Laundry Services'}
            </Button>
          </CardContent>
        </Card>

        {/* Cleaning Services */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${
            currentProfession === 'cleaning' || selectedProfession === 'cleaning' 
              ? 'border-primary bg-primary/5' 
              : 'hover:border-primary'
          }`}
          onClick={() => updateProfessionType('cleaning')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 relative">
              <Home className="w-8 h-8 text-white" />
              {currentProfession === 'cleaning' && (
                <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-primary bg-background rounded-full" />
              )}
            </div>
            <CardTitle className="text-xl">Cleaning Services</CardTitle>
            <CardDescription>
              Professional home and office cleaning with flexible scheduling
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Home & office cleaning
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Deep cleaning & post-construction
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Carpet & upholstery cleaning
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Flexible appointment scheduling
              </li>
            </ul>
            
            <Button 
              className="w-full" 
              variant={currentProfession === 'cleaning' ? "default" : "outline"}
            >
              {currentProfession === 'cleaning' ? 'Current Selection' : 'Choose Cleaning Services'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {currentProfession && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You can change your service type anytime by clicking on a different option above.
          </p>
        </div>
      )}
    </div>
  );
};