import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Scissors, Shirt, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ServiceTypeSettings = () => {
  const [currentSelection, setCurrentSelection] = useState<'beauty' | 'laundry' | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCurrentSelection = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_stylist, is_laundry_specialist')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          if (profile?.is_laundry_specialist) {
            setCurrentSelection('laundry');
          } else if (profile?.is_stylist) {
            setCurrentSelection('beauty');
          }
        }
      } catch (error: any) {
        console.error("Error fetching service type:", error);
        toast.error("Failed to load service type settings");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSelection();
  }, []);

  const handleSelectionChange = async (serviceType: 'beauty' | 'laundry') => {
    try {
      setSaving(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        const updateData = {
          is_stylist: serviceType === 'beauty',
          is_laundry_specialist: serviceType === 'laundry',
          availability: true, // Ensure availability remains enabled when switching service types
          availability_status: 'available', // Reset to available status
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (updateError) throw updateError;

        setCurrentSelection(serviceType);
        toast.success(`Service type updated to ${serviceType === 'beauty' ? 'Beauty & Hair Services' : 'Laundry Services'}`);
      }
    } catch (error: any) {
      console.error("Error updating service type:", error);
      toast.error("Failed to update service type: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Service Type Selection
          </CardTitle>
          <CardDescription>
            Choose the type of services you want to offer to your clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSelection && (
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">
                Current Selection: {currentSelection === 'beauty' ? 'Beauty & Hair Services' : 'Laundry Services'}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Beauty Services Card */}
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                currentSelection === 'beauty' && "border-primary bg-primary/5"
              )}
              onClick={() => !saving && handleSelectionChange('beauty')}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className={cn(
                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
                    currentSelection === 'beauty' ? "bg-primary text-primary-foreground" : "bg-pink-100 text-pink-600"
                  )}>
                    <Scissors className="h-8 w-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Beauty & Hair Services</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Professional hair styling, beauty treatments, and grooming services
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Hair cutting, styling & coloring
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Braiding, extensions & protective styles
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Nail care & beauty treatments
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      In-person appointment booking
                    </div>
                  </div>

                  {currentSelection === 'beauty' && (
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Current Selection
                    </div>
                  )}

                  {currentSelection !== 'beauty' && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled={saving}
                    >
                      {saving ? "Updating..." : "Choose Beauty Services"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cleaning Services Card */}
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                currentSelection === 'laundry' && "border-primary bg-primary/5"
              )}
              onClick={() => !saving && handleSelectionChange('laundry')}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className={cn(
                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
                    currentSelection === 'laundry' ? "bg-primary text-primary-foreground" : "bg-blue-100 text-blue-600"
                  )}>
                    <Shirt className="h-8 w-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Laundry Services</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Professional laundry, dry cleaning with pickup and delivery
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Wash, dry & fold services
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Dry cleaning & pressing
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Pickup & delivery scheduling
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Order tracking & status updates
                    </div>
                  </div>

                  {currentSelection === 'laundry' && (
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Current Selection
                    </div>
                  )}

                  {currentSelection !== 'laundry' && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled={saving}
                    >
                      {saving ? "Updating..." : "Choose Laundry Services"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Note:</strong> You can change your service type at any time. 
              Your existing services and bookings will be preserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceTypeSettings;