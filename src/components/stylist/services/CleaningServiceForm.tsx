import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CleaningServiceForm {
  name: string;
  description: string;
  basePrice: string;
  hourlyRate: string;
  duration: string;
  category: string;
}

interface CleaningServiceFormProps {
  onServicesChange?: () => void;
}

const CLEANING_SERVICE_TYPES = [
  {
    name: "Standard Home Cleaning",
    description: "Regular cleaning for homes and apartments",
    suggestedBasePrice: "80.00",
    suggestedHourlyRate: "25.00",
    duration: "3",
    category: "home"
  },
  {
    name: "Deep Cleaning",
    description: "Thorough cleaning including hard-to-reach areas",
    suggestedBasePrice: "150.00",
    suggestedHourlyRate: "35.00",
    duration: "5",
    category: "deep"
  },
  {
    name: "Office Cleaning",
    description: "Professional cleaning for office spaces",
    suggestedBasePrice: "60.00",
    suggestedHourlyRate: "30.00",
    duration: "2",
    category: "office"
  },
  {
    name: "Post-Construction Cleaning",
    description: "Specialized cleaning after construction or renovation",
    suggestedBasePrice: "200.00",
    suggestedHourlyRate: "40.00",
    duration: "6",
    category: "post_construction"
  },
  {
    name: "Carpet Cleaning",
    description: "Professional carpet and upholstery cleaning",
    suggestedBasePrice: "100.00",
    suggestedHourlyRate: "45.00",
    duration: "4",
    category: "carpet"
  }
];

export const CleaningServiceForm: React.FC<CleaningServiceFormProps> = ({ onServicesChange }) => {
  const [cleaningServices, setCleaningServices] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CleaningServiceForm>({
    name: "",
    description: "",
    basePrice: "",
    hourlyRate: "",
    duration: "",
    category: "",
  });
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newServiceArea, setNewServiceArea] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }
      
      // Fetch cleaning services for current specialist only
      const { data: servicesData } = await supabase
        .from('cleaning_services')
        .select('*')
        .eq('specialist_id', user.id)
        .order('name');
      
      setCleaningServices(servicesData || []);

      // Fetch user profile for service areas
      const { data: profile } = await supabase
        .from('profiles')
        .select('service_areas')
        .eq('id', user.id)
        .single();
      
      setServiceAreas(profile?.service_areas || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load cleaning services");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.basePrice || !formData.duration || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const basePriceValue = parseFloat(formData.basePrice);
    const hourlyRateValue = parseFloat(formData.hourlyRate || "0");
    const durationValue = parseInt(formData.duration);

    if (isNaN(basePriceValue) || basePriceValue <= 0) {
      toast.error("Please enter a valid base price");
      return;
    }

    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('cleaning_services')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            base_price: Math.round(basePriceValue * 100), // Convert to cents
            hourly_rate: Math.round(hourlyRateValue * 100),
            duration_hours: durationValue,
            service_category: formData.category,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Cleaning service updated successfully");
      } else {
        // Get current user for specialist_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("User not authenticated");
          return;
        }

        const { error } = await supabase
          .from('cleaning_services')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            base_price: Math.round(basePriceValue * 100),
            hourly_rate: Math.round(hourlyRateValue * 100),
            duration_hours: durationValue,
            service_category: formData.category,
            specialist_id: user.id,
          });
        
        if (error) throw error;
        toast.success("Cleaning service added successfully");
      }

      setFormData({
        name: "",
        description: "",
        basePrice: "",
        hourlyRate: "",
        duration: "",
        category: "",
      });
      setIsAdding(false);
      setEditingId(null);
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error saving cleaning service:", error);
      toast.error("Failed to save cleaning service");
    }
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || "",
      basePrice: (service.base_price / 100).toFixed(2),
      hourlyRate: (service.hourly_rate / 100).toFixed(2),
      duration: service.duration_hours.toString(),
      category: service.service_category,
    });
    setEditingId(service.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cleaning service?")) return;

    try {
      const { error } = await supabase
        .from('cleaning_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Cleaning service deleted successfully");
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error deleting cleaning service:", error);
      toast.error("Failed to delete cleaning service");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      hourlyRate: "",
      duration: "",
      category: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const addServiceArea = async () => {
    if (!newServiceArea.trim()) return;

    const updatedAreas = [...serviceAreas, newServiceArea.trim()];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ service_areas: updatedAreas })
        .eq('id', user.id);

      if (error) throw error;
      
      setServiceAreas(updatedAreas);
      setNewServiceArea("");
      toast.success("Service area added");
    } catch (error) {
      console.error("Error adding service area:", error);
      toast.error("Failed to add service area");
    }
  };

  const removeServiceArea = async (areaToRemove: string) => {
    const updatedAreas = serviceAreas.filter(area => area !== areaToRemove);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ service_areas: updatedAreas })
        .eq('id', user.id);

      if (error) throw error;
      
      setServiceAreas(updatedAreas);
      toast.success("Service area removed");
    } catch (error) {
      console.error("Error removing service area:", error);
      toast.error("Failed to remove service area");
    }
  };

  const loadPreset = (preset: typeof CLEANING_SERVICE_TYPES[0]) => {
    setFormData({
      name: preset.name,
      description: preset.description,
      basePrice: preset.suggestedBasePrice,
      hourlyRate: preset.suggestedHourlyRate,
      duration: preset.duration,
      category: preset.category,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Cleaning Services</h2>
          <p className="text-sm text-muted-foreground">Manage your cleaning services and pricing</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Cleaning Service
          </Button>
        )}
      </div>

      {/* Service Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Service Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter area name (e.g., East Legon, Osu)"
              value={newServiceArea}
              onChange={(e) => setNewServiceArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
            />
            <Button onClick={addServiceArea} variant="outline">
              Add
            </Button>
          </div>
          {serviceAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {serviceAreas.map((area, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeServiceArea(area)}
                >
                  {area} ✕
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Cleaning Service" : "Add Cleaning Service"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Home Cleaning"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Service Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Cleaning</SelectItem>
                      <SelectItem value="office">Office Cleaning</SelectItem>
                      <SelectItem value="deep">Deep Cleaning</SelectItem>
                      <SelectItem value="carpet">Carpet Cleaning</SelectItem>
                      <SelectItem value="post_construction">Post-Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price (GHS) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="80.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (GHS)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (Hours) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="3"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this service includes"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Update" : "Add"} Service
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {cleaningServices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No cleaning services yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first cleaning service to start accepting bookings
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Cleaning Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {cleaningServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-muted/20"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base">{service.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            GHS {(service.base_price / 100).toFixed(2)} base
                          </Badge>
                          {service.hourly_rate > 0 && (
                            <Badge variant="outline" className="text-xs">
                              GHS {(service.hourly_rate / 100).toFixed(2)}/hr
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {service.duration_hours}h
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {service.service_category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(service.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};