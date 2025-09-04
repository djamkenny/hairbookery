import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, MapPin, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


interface CleaningServiceForm {
  name: string;
  description: string;
  category: string;
  duration_hours: number;
}

interface CleaningServiceFormProps {
  onServicesChange?: () => void;
}

export const CleaningServiceForm: React.FC<CleaningServiceFormProps> = ({ onServicesChange }) => {
  const [cleaningServices, setCleaningServices] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<CleaningServiceForm>({
    name: "",
    description: "",
    category: "",
    duration_hours: 2,
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
    
    if (!formData.name.trim() || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Get current user for specialist_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        service_category: formData.category,
        specialist_id: user.id,
        duration_hours: formData.duration_hours,
      };

      if (editingId) {
        const { error } = await supabase
          .from('cleaning_services')
          .update(serviceData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Cleaning service updated successfully");
      } else {
        const { error } = await supabase
          .from('cleaning_services')
          .insert([serviceData]);
        
        if (error) throw error;
        toast.success("Cleaning service added successfully");
      }

      setFormData({
        name: "",
        description: "",
        category: "",
        duration_hours: 2,
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
      category: service.service_category,
      duration_hours: service.duration_hours || 2,
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
      category: "",
      duration_hours: 2,
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
          <h2 className="text-xl sm:text-2xl font-semibold">Cleaning Services</h2>
          <p className="text-sm text-muted-foreground">Manage your cleaning service types</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Service Type
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

      {/* Add/Edit Service Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Service Type' : 'Add New Service Type'}
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Deep House Cleaning"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="category">Service Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="deep_cleaning">Deep Cleaning</SelectItem>
                    <SelectItem value="regular_cleaning">Regular Cleaning</SelectItem>
                    <SelectItem value="move_in_out">Move In/Out</SelectItem>
                    <SelectItem value="post_construction">Post Construction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Duration (Hours) *</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="24"
                  required
                />
              </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this service includes..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Service Images</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setImageFiles(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload service images
                    </span>
                  </label>
                  {imageFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {imageFiles.length} file(s) selected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update Service' : 'Add Service'}
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
      <Card>
        <CardHeader>
          <CardTitle>Your Service Types</CardTitle>
        </CardHeader>
        <CardContent>
          {cleaningServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No service types added yet.</p>
              <p className="text-sm">Add your first service type to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {cleaningServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description || 'No description'}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{service.service_category}</Badge>
                      <Badge variant="secondary">{service.duration_hours}h duration</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};