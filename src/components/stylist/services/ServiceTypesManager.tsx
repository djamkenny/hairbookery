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

interface ServiceTypesManagerProps {
  serviceId: string;
  serviceName: string;
  onClose: () => void;
}

interface ServiceTypeForm {
  name: string;
  description: string;
  price: string;
  duration: string;
}

const ServiceTypesManager: React.FC<ServiceTypesManagerProps> = ({
  serviceId,
  serviceName,
  onClose,
}) => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceTypeForm>({
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceTypes();
  }, [serviceId]);

  const fetchServiceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('service_id', serviceId)
        .order('name');

      if (error) throw error;
      setServiceTypes(data || []);
    } catch (error: any) {
      console.error("Error fetching service types:", error);
      toast.error("Failed to load service types");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price || !formData.duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    const priceValue = parseFloat(formData.price);
    const durationValue = parseInt(formData.duration);

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
        toast.success("Service type updated successfully");
      } else {
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
        toast.success("Service type added successfully");
      }

      setFormData({ name: "", description: "", price: "", duration: "" });
      setIsAdding(false);
      setEditingId(null);
      fetchServiceTypes();
    } catch (error: any) {
      console.error("Error saving service type:", error);
      toast.error("Failed to save service type");
    }
  };

  const handleEdit = (serviceType: ServiceType) => {
    setFormData({
      name: serviceType.name,
      description: serviceType.description || "",
      price: serviceType.price.toString(),
      duration: serviceType.duration.toString(),
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
      toast.success("Service type deleted successfully");
      fetchServiceTypes();
    } catch (error: any) {
      console.error("Error deleting service type:", error);
      toast.error("Failed to delete service type");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", price: "", duration: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading service types...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Service Types for "{serviceName}"</CardTitle>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
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
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Manicure, Pedicure"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Add New Button */}
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service Type
          </Button>
        )}

        {/* Service Types List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Service Types ({serviceTypes.length})
          </h3>
          {serviceTypes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No service types added yet. Add your first service type to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {serviceTypes.map((serviceType) => (
                <Card key={serviceType.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceTypesManager;