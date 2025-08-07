import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Star, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

interface CategoryServiceFlowProps {
  stylistId: string;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  currentUser: any;
}

const iconMap = {
  scissors: "✂️",
  palette: "🎨", 
  droplet: "💧",
  grid: "⚡",
  plus: "➕",
  star: "⭐",
  user: "👤",
  hand: "✋",
};

export const CategoryServiceFlow: React.FC<CategoryServiceFlowProps> = ({
  stylistId,
  selectedServices,
  onServicesChange,
  currentUser
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
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

  const getCategoryStats = (categoryName: string) => {
    const categoryServices = getServicesByCategory(categoryName);
    const prices = categoryServices.map(s => parseFloat(s.price));
    const durations = categoryServices.map(s => parseInt(s.duration));
    
    return {
      count: categoryServices.length,
      priceRange: prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices)
      } : null,
      durationRange: durations.length > 0 ? {
        min: Math.min(...durations),
        max: Math.max(...durations)
      } : null
    };
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

  // Category selection view
  if (!selectedCategory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Service Category</CardTitle>
          <CardDescription>
            Choose a category to view available services
            {userPreferences.length > 0 && (
              <span className="block mt-1 text-sm text-primary">
                ✨ You have saved preferences
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const categoryServices = getServicesByCategory(category.name);
              const stats = getCategoryStats(category.name);
              const selectedInCategory = categoryServices.filter(s => selectedServices.includes(s.id));
              
              if (categoryServices.length === 0) return null;

              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {iconMap[category.icon as keyof typeof iconMap] || "⭐"}
                          </span>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Services:</span>
                        <span className="font-medium">{stats.count}</span>
                      </div>
                      
                      {stats.priceRange && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Price range:</span>
                          <span className="font-medium text-primary">
                            ₵{stats.priceRange.min}
                            {stats.priceRange.min !== stats.priceRange.max && ` - ₵${stats.priceRange.max}`}
                          </span>
                        </div>
                      )}
                      
                      {stats.durationRange && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">
                            {stats.durationRange.min}
                            {stats.durationRange.min !== stats.durationRange.max && `-${stats.durationRange.max}`} mins
                          </span>
                        </div>
                      )}
                      
                      {selectedInCategory.length > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          {selectedInCategory.length} selected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Service selection within category
  const categoryServices = getServicesByCategory(selectedCategory.name);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">
                {iconMap[selectedCategory.icon as keyof typeof iconMap] || "⭐"}
              </span>
              {selectedCategory.name}
            </CardTitle>
            <CardDescription>{selectedCategory.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                    <div className="flex items-center gap-2 mb-2">
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
                      <p className="text-sm text-muted-foreground mb-3">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-primary" />
                        <span className="font-medium text-primary">₵{service.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{service.duration} mins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedServices.filter(id => categoryServices.some(s => s.id === id)).length} of {categoryServices.length} selected
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory(null)}
          >
            Back to Categories
          </Button>
        </div>

        {selectedServices.length > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Total Selected Services</h4>
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