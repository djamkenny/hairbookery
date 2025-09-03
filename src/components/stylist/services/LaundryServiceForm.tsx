import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Save, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LaundryServiceForm {
  name: string;
  description: string;
  pricePerKg: string;
  basePrice: string;
  turnaroundDays: string;
  isExpress: boolean;
}

interface LaundryServiceFormProps {
  onServicesChange?: () => void;
}


export const LaundryServiceForm: React.FC<LaundryServiceFormProps> = ({ onServicesChange }) => {
  const [laundryServices, setLaundryServices] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LaundryServiceForm>({
    name: "",
    description: "",
    pricePerKg: "",
    basePrice: "",
    turnaroundDays: "",
    isExpress: false,
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
      
      // Fetch laundry services for current specialist only
      const { data: servicesData } = await supabase
        .from('laundry_services')
        .select('*')
        .eq('specialist_id', user.id)
        .order('name');
      
      setLaundryServices(servicesData || []);

      // Fetch user profile for service areas
      const { data: profile } = await supabase
        .from('profiles')
        .select('service_areas')
        .eq('id', user.id)
        .single();
      
      setServiceAreas(profile?.service_areas || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load laundry services");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.pricePerKg || !formData.turnaroundDays) {
      toast.error("Please fill in all required fields");
      return;
    }

    const pricePerKgValue = parseFloat(formData.pricePerKg);
    const basePriceValue = parseFloat(formData.basePrice || "0");
    const turnaroundValue = parseInt(formData.turnaroundDays);

    if (isNaN(pricePerKgValue) || pricePerKgValue <= 0) {
      toast.error("Please enter a valid price per kg");
      return;
    }

    if (isNaN(turnaroundValue) || turnaroundValue <= 0) {
      toast.error("Please enter a valid turnaround time");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('laundry_services')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price_per_kg: Math.round(pricePerKgValue * 100), // Convert to cents
            base_price: Math.round(basePriceValue * 100),
            turnaround_days: turnaroundValue,
            is_express: formData.isExpress,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Laundry service updated successfully");
      } else {
        // Get current user for specialist_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("User not authenticated");
          return;
        }

        const { error } = await supabase
          .from('laundry_services')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price_per_kg: Math.round(pricePerKgValue * 100),
            base_price: Math.round(basePriceValue * 100),
            turnaround_days: turnaroundValue,
            is_express: formData.isExpress,
            specialist_id: user.id,
          });
        
        if (error) throw error;
        toast.success("Laundry service added successfully");
      }

      setFormData({
        name: "",
        description: "",
        pricePerKg: "",
        basePrice: "",
        turnaroundDays: "",
        isExpress: false,
      });
      setIsAdding(false);
      setEditingId(null);
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error saving laundry service:", error);
      toast.error("Failed to save laundry service");
    }
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || "",
      pricePerKg: (service.price_per_kg / 100).toFixed(2),
      basePrice: (service.base_price / 100).toFixed(2),
      turnaroundDays: service.turnaround_days.toString(),
      isExpress: service.is_express,
    });
    setEditingId(service.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this laundry service?")) return;

    try {
      const { error } = await supabase
        .from('laundry_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Laundry service deleted successfully");
      fetchData();
      onServicesChange?.();
    } catch (error: any) {
      console.error("Error deleting laundry service:", error);
      toast.error("Failed to delete laundry service");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      pricePerKg: "",
      basePrice: "",
      turnaroundDays: "",
      isExpress: false,
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
          <h2 className="text-xl sm:text-2xl font-semibold">Laundry Services</h2>
          <p className="text-sm text-muted-foreground">Manage your laundry and dry cleaning services</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Laundry Service
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
              {editingId ? "Edit Laundry Service" : "Add Laundry Service"}
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
                    placeholder="e.g., Premium Wash & Fold"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="turnaroundDays">Turnaround Days *</Label>
                  <Input
                    id="turnaroundDays"
                    type="number"
                    min="1"
                    value={formData.turnaroundDays}
                    onChange={(e) => setFormData({ ...formData, turnaroundDays: e.target.value })}
                    placeholder="2"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerKg">Price per KG (GHS) *</Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    placeholder="8.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price (GHS)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="15.00"
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="isExpress"
                  checked={formData.isExpress}
                  onCheckedChange={(checked) => setFormData({ ...formData, isExpress: checked })}
                />
                <Label htmlFor="isExpress">Express Service (Premium pricing)</Label>
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
        {laundryServices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No laundry services yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first laundry service to start accepting orders
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
              <CardTitle>Your Laundry Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {laundryServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-muted/20"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base">{service.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            GHS {(service.price_per_kg / 100).toFixed(2)}/kg
                          </Badge>
                          {service.base_price > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Base: GHS {(service.base_price / 100).toFixed(2)}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {service.turnaround_days} day{service.turnaround_days !== 1 ? 's' : ''}
                          </Badge>
                          {service.is_express && (
                            <Badge className="text-xs">Express</Badge>
                          )}
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 sm:gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
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
        )}
      </div>
    </div>
  );
};