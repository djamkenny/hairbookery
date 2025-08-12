import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ServiceType } from "./types";
import { ServiceImageUpload } from "./ServiceImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceTypeForm {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

interface ServiceTypeManagementProps {
  onServicesChange?: () => void;
}

const ServiceTypeManagement: React.FC<ServiceTypeManagementProps> = ({
  onServicesChange
}) => {
  const { toast } = useToast();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceTypeForm>({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploadService, setUploadService] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .order('display_order');
      
      setCategories(categoriesData || []);

      // Fetch current user and stylist's services
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setServices([]);
      } else {
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('stylist_id', user.id)
          .order('name');
        setServices(servicesData || []);
      }

      // Fetch all service types for this stylist
      if (user) {
        const { data: servicesForIds } = await supabase
          .from('services')
          .select('id')
          .eq('stylist_id', user.id);
        const serviceIds = (servicesForIds || []).map(s => s.id);
        if (serviceIds.length > 0) {
          const { data: serviceTypesData, error } = await supabase
            .from('service_types')
            .select(`
              *,
              services!inner(name, category, stylist_id)
            `)
            .in('service_id', serviceIds)
            .order('name');

          if (error) throw error;
          setServiceTypes(serviceTypesData || []);
        } else {
          setServiceTypes([]);
        }
      } else {
        setServiceTypes([]);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", description: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const createBaseServiceIfNeeded = async (category: string): Promise<string> => {
    // Check if there's already a base service for this category
    const existingService = services.find(s => s.category === category && s.is_base_service);
    if (existingService) {
      return existingService.id;
    }

    // Create a base service for this category
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
    
    // Update local services state
    setServices(prev => [...prev, data]);
    
    return data.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price || !formData.duration || !formData.category) {
      toast({ variant: "destructive", description: "Please fill in all required fields" });
      return;
    }

    const priceValue = parseFloat(formData.price);
    const durationValue = parseInt(formData.duration);

    if (isNaN(priceValue) || priceValue <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid price" });
      return;
    }

    if (isNaN(durationValue) || durationValue <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid duration" });
      return;
    }

    try {
      if (editingId) {
        // Update existing service type
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
        toast({ description: "Service type updated successfully" });
      } else {
        // Create new service type
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
        toast({ description: "Service type added successfully" });
      }

      setFormData({ name: "", description: "", price: "", duration: "", category: "" });
      setIsAdding(false);
      setEditingId(null);
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error saving service type:", error);
      toast({ variant: "destructive", description: "Failed to save service type" });
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
    setEditingId(serviceType.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service type?")) return;

    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ description: "Service type deleted successfully" });
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error deleting service type:", error);
      toast({ variant: "destructive", description: "Failed to delete service type" });
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", price: "", duration: "", category: "" });
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Service Types</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service Type
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Service Type" : "Add Service Type"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={!!editingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Service Type Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Manicure, Pedicure, Haircut"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
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
                  placeholder="Optional description of the service type"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Update" : "Add"} Service Type
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Service Types by Category */}
      <div className="space-y-6">
        {Object.keys(groupedServiceTypes).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No service types yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first service type to start accepting bookings
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service Type
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
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{serviceType.name}</h4>
                          <Badge variant="secondary">
                            GHS {serviceType.price}
                          </Badge>
                          <Badge variant="outline">
                            {serviceType.duration} min
                          </Badge>
                        </div>
                        {serviceType.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {serviceType.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const svc = services.find(s => s.id === serviceType.service_id);
                            if (svc) setUploadService(svc);
                          }}
                          aria-label="Upload service images"
                          title="Upload service images"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(serviceType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(serviceType.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
      {uploadService && (
        <Dialog open={!!uploadService} onOpenChange={(open) => !open && setUploadService(null)}>
          <DialogContent className="max-w-2xl w-full">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload images for {uploadService.name}</h3>
              <ServiceImageUpload
                serviceId={uploadService.id}
                currentImages={uploadService.image_urls || []}
                onImagesUpdate={() => {
                  setUploadService(null);
                  fetchData();
                  onServicesChange?.();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ServiceTypeManagement;