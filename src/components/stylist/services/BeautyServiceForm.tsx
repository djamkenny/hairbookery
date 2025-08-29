import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { ServiceType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceTypeForm {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

interface BeautyServiceFormProps {
  onServicesChange?: () => void;
}

const BEAUTY_CATEGORIES = [
  { name: "Hair Services", examples: ["Haircut", "Hair Styling", "Hair Coloring", "Blowout"] },
  { name: "Nail Services", examples: ["Manicure", "Pedicure", "Nail Art", "Gel Polish"] },
  { name: "Facial & Skincare", examples: ["Facial Treatment", "Deep Cleansing", "Anti-aging"] },
  { name: "Braiding & Extensions", examples: ["Box Braids", "Cornrows", "Hair Extensions", "Twists"] },
  { name: "Spa Services", examples: ["Massage", "Body Treatment", "Relaxation Package"] }
];

export const BeautyServiceForm: React.FC<BeautyServiceFormProps> = ({ onServicesChange }) => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceTypeForm>({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  });
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch stylist's services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('stylist_id', user.id)
        .order('name');
      
      setServices(servicesData || []);

      // Fetch service types for this stylist
      const serviceIds = (servicesData || []).map(s => s.id);
      if (serviceIds.length > 0) {
        const { data: serviceTypesData } = await supabase
          .from('service_types')
          .select(`*, services!inner(name, category, stylist_id)`)
          .in('service_id', serviceIds)
          .order('name');
        
        setServiceTypes(serviceTypesData || []);
      } else {
        setServiceTypes([]);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const createBaseServiceIfNeeded = async (category: string): Promise<string> => {
    const existingService = services.find(s => s.category === category && s.is_base_service);
    if (existingService) return existingService.id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('services')
      .insert({
        name: category,
        description: `Base service for ${category} category`,
        category: category,
        price: 0,
        duration: 0,
        is_base_service: true,
        stylist_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setServices(prev => [...prev, data]);
    return data.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price || (!durationHours && !durationMinutes) || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const priceValue = parseFloat(formData.price);
    const durationValue = durationHours * 60 + durationMinutes;

    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('service_types')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price: priceValue,
            duration: durationValue,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        const serviceId = await createBaseServiceIfNeeded(formData.category);
        const { error } = await supabase
          .from('service_types')
          .insert({
            service_id: serviceId,
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price: priceValue,
            duration: durationValue,
          });
        
        if (error) throw error;
        toast.success("Service added successfully");
      }

      setFormData({ name: "", description: "", price: "", duration: "", category: "" });
      setDurationHours(0);
      setDurationMinutes(0);
      setIsAdding(false);
      setEditingId(null);
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    }
  };

  const handleEdit = (serviceType: ServiceType) => {
    const service = services.find(s => s.id === serviceType.service_id);
    setFormData({
      name: serviceType.name,
      description: serviceType.description || "",
      price: serviceType.price.toString(),
      duration: serviceType.duration.toString(),
      category: service?.category || "",
    });
    setDurationHours(Math.floor(serviceType.duration / 60));
    setDurationMinutes(serviceType.duration % 60);
    setEditingId(serviceType.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Service deleted successfully");
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", price: "", duration: "", category: "" });
    setDurationHours(0);
    setDurationMinutes(0);
    setIsAdding(false);
    setEditingId(null);
  };

  const groupedServiceTypes = serviceTypes.reduce((acc, serviceType) => {
    const service = services.find(s => s.id === serviceType.service_id);
    const category = service?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(serviceType);
    return acc;
  }, {} as Record<string, ServiceType[]>);

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
          <h2 className="text-xl sm:text-2xl font-semibold">Beauty Services</h2>
          <p className="text-sm text-muted-foreground">Manage your beauty and hair services</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Beauty Service
          </Button>
        )}
      </div>

      {/* Quick Category Selection */}
      {isAdding && !editingId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose a Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {BEAUTY_CATEGORIES.map((category) => (
                <Button
                  key={category.name}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => setFormData({ ...formData, category: category.name })}
                >
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {category.examples.slice(0, 2).join(", ")}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <Label htmlFor="custom-category">Or enter custom category:</Label>
              <Input
                id="custom-category"
                placeholder="e.g., Specialty Treatment"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form */}
      {isAdding && formData.category && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Service" : `Add ${formData.category} Service`}
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
                    placeholder="e.g., Deep Conditioning Treatment"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (GHS) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value || "0")))}
                    placeholder="Hours"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value || "0"))))}
                    placeholder="Minutes"
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
      <div className="space-y-6">
        {Object.keys(groupedServiceTypes).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No beauty services yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first beauty service to start accepting appointments
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedServiceTypes).map(([category, types]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="secondary">{types.length} service{types.length !== 1 ? 's' : ''}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {types.map((serviceType) => (
                    <div
                      key={serviceType.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-muted/20"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="font-semibold text-sm sm:text-base">{serviceType.name}</h4>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              GHS {serviceType.price}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {serviceType.duration} min
                            </Badge>
                          </div>
                        </div>
                        {serviceType.description && (
                          <p className="text-sm text-muted-foreground">
                            {serviceType.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 sm:gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(serviceType)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(serviceType.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};