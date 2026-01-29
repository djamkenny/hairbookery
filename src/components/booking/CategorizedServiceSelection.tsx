import React, { useState, useEffect } from "react";
import { Scissors, Palette, Droplet, Grid, Plus, Star, User, Hand, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
// Remove the import since we'll use simple formatting

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: string;
  price: string;
  stylist_id: string;
  category: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  icon: string;
}

interface CategorizedServiceSelectionProps {
  stylistId: string;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  currentUser: any;
}

const iconMap = {
  scissors: Scissors,
  palette: Palette,
  droplet: Droplet,
  grid: Grid,
  plus: Plus,
  star: Star,
  user: User,
  hand: Hand,
};

export const CategorizedServiceSelection: React.FC<CategorizedServiceSelectionProps> = ({
  stylistId,
  selectedServices,
  onServicesChange,
  currentUser
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('service_categories')
          .select('*')
          .order('display_order');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch services for this stylist
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('stylist_id', stylistId)
          .order('name');
        
        if (servicesError) throw servicesError;
        const transformedServices = (servicesData || []).map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration.toString(),
          price: service.price.toString(),
          stylist_id: service.stylist_id,
          category: service.category || 'Hair Cutting & Styling'
        }));
        setServices(transformedServices);

        // Fetch user preferences if logged in
        if (currentUser) {
          const { data: preferencesData, error: preferencesError } = await supabase
            .from('user_service_preferences')
            .select('service_id')
            .eq('user_id', currentUser.id)
            .eq('stylist_id', stylistId);
          
          if (preferencesError) throw preferencesError;
          const preferredServices = preferencesData?.map(p => p.service_id) || [];
          setUserPreferences(preferredServices);
          
          // Auto-select user's previous preferences if none selected yet
          if (selectedServices.length === 0 && preferredServices.length > 0) {
            onServicesChange(preferredServices);
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    if (stylistId) {
      fetchData();
    }
  }, [stylistId, currentUser]);

  const savePreferences = async (newSelectedServices: string[]) => {
    if (!currentUser) return;

    try {
      // Clear existing preferences for this stylist
      await supabase
        .from('user_service_preferences')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('stylist_id', stylistId);

      // Insert new preferences
      if (newSelectedServices.length > 0) {
        const preferences = newSelectedServices.map((serviceId, index) => ({
          user_id: currentUser.id,
          service_id: serviceId,
          stylist_id: stylistId,
          preference_order: index,
          last_selected_at: new Date().toISOString()
        }));

        await supabase
          .from('user_service_preferences')
          .insert(preferences);
      }
      
      setUserPreferences(newSelectedServices);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Don't show error to user as this is a nice-to-have feature
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    const newSelected = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    onServicesChange(newSelected);
    savePreferences(newSelected);
  };

  const getServicesByCategory = (categoryName: string) => {
    return services.filter(service => service.category === categoryName);
  };

  const getSelectedServicesInCategory = (categoryName: string) => {
    const categoryServices = getServicesByCategory(categoryName);
    return categoryServices.filter(service => selectedServices.includes(service.id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Services</CardTitle>
        <CardDescription>
          Choose from the available service categories below
          {userPreferences.length > 0 && (
            <span className="block mt-1 text-sm text-primary">
              Your previous selections have been pre-loaded
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={categories.map(cat => cat.id)} className="space-y-2">
          {categories.map((category) => {
            const categoryServices = getServicesByCategory(category.name);
            const selectedInCategory = getSelectedServicesInCategory(category.name);
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Scissors;
            
            if (categoryServices.length === 0) return null;

            return (
              <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      </div>
                    </div>
                    {selectedInCategory.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedInCategory.length} selected
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <div className="grid gap-3">
                    {categoryServices.map((service) => {
                      const isSelected = selectedServices.includes(service.id);
                      const isPreferred = userPreferences.includes(service.id);
                      
                      return (
                        <div
                          key={service.id}
                          className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{service.name}</h4>
                                {isPreferred && !isSelected && (
                                  <Badge variant="outline" className="text-xs">
                                    Previously selected
                                  </Badge>
                                )}
                                {isSelected && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="font-medium text-primary">
                                  ₵{service.price}
                                </span>
                                <span className="text-muted-foreground">
                                  {service.duration} mins
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {selectedServices.length > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Selected Services Summary</h4>
            <div className="space-y-2">
              {selectedServices.map((serviceId) => {
                const service = services.find(s => s.id === serviceId);
                if (!service) return null;
                
                return (
                  <div key={serviceId} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span className="font-medium">₵{service.price}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span className="text-primary">
                ₵{selectedServices
                    .reduce((total, serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return total + (service ? parseFloat(service.price) : 0);
                    }, 0)
                    .toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};