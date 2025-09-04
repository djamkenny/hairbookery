import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, MapPin, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CleaningServiceDetailsDialog } from "@/components/cleaning/CleaningServiceDetailsDialog";

interface PricingTier {
  name: string;
  description: string;
  pricePerRoom: string;
  duration: string;
  addons: AddonService[];
}

interface AddonService {
  id: string;
  name: string;
  price: string;
  description?: string;
}

interface CleaningServiceForm {
  name: string;
  description: string;
  category: string;
  pricingTiers: PricingTier[];
}

interface CleaningServiceFormProps {
  onServicesChange?: () => void;
}


export const CleaningServiceForm: React.FC<CleaningServiceFormProps> = ({ onServicesChange }) => {
  const [cleaningServices, setCleaningServices] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingService, setViewingService] = useState<any | null>(null);
  const [formData, setFormData] = useState<CleaningServiceForm>({
    name: "",
    description: "",
    category: "",
    pricingTiers: [
      { name: "Standard", description: "", pricePerRoom: "30", duration: "2", addons: [] }
    ],
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
    
    if (!formData.name.trim() || !formData.category || formData.pricingTiers.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate each pricing tier
    for (const tier of formData.pricingTiers) {
      if (!tier.name.trim() || !tier.pricePerRoom || !tier.duration) {
        toast.error("Please complete all pricing tier information");
        return;
      }
      
      const pricePerRoomValue = parseFloat(tier.pricePerRoom);
      const durationValue = parseInt(tier.duration);

      if (isNaN(pricePerRoomValue) || pricePerRoomValue <= 0) {
        toast.error("Please enter valid price per room for all tiers");
        return;
      }

      if (isNaN(durationValue) || durationValue <= 0) {
        toast.error("Please enter valid durations for all tiers");
        return;
      }

      // Validate addons
      for (const addon of tier.addons) {
        if (!addon.name.trim() || !addon.price || isNaN(parseFloat(addon.price)) || parseFloat(addon.price) <= 0) {
          toast.error("Please enter valid addon information");
          return;
        }
      }
    }

    try {
      // Get current user for specialist_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Store price per room and addons (we'll use a default of 1 room for display price)
      const servicesToProcess = formData.pricingTiers.map(tier => {
        const pricePerRoom = parseFloat(tier.pricePerRoom);
        
        return {
          name: `${formData.name.trim()} - ${tier.name.trim()}`,
          description: tier.description.trim() || formData.description.trim() || null,
          total_price: Math.round(pricePerRoom * 100), // Store price per room in cents
          duration_hours: parseInt(tier.duration),
          service_category: formData.category,
          specialist_id: user.id,
          addons: JSON.stringify(tier.addons), // Store addons as JSON
        };
      });

      if (editingId) {
        // For editing, just update the first service (simplified for now)
        const firstTier = formData.pricingTiers[0];
        const pricePerRoom = parseFloat(firstTier.pricePerRoom);
        
        const { error } = await supabase
          .from('cleaning_services')
          .update({
            name: formData.name.trim(),
            description: firstTier.description.trim() || formData.description.trim() || null,
            total_price: Math.round(pricePerRoom * 100), // Store price per room
            duration_hours: parseInt(firstTier.duration),
            service_category: formData.category,
            addons: JSON.stringify(firstTier.addons), // Store addons as JSON string
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Cleaning service updated successfully");
      } else {
        // Insert all pricing tiers as separate services
        const { error } = await supabase
          .from('cleaning_services')
          .insert(servicesToProcess);
        
        if (error) throw error;
        toast.success("Cleaning services added successfully");
      }

      setFormData({
        name: "",
        description: "",
        category: "",
        pricingTiers: [
          { name: "Standard", description: "", pricePerRoom: "30", duration: "2", addons: [] }
        ],
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
    // Get per room price from stored price
    const pricePerRoom = service.total_price / 100; // Convert from cents
    
    // Parse addons from JSON if string, or use as-is if already array
    let parsedAddons = [];
    try {
      if (typeof service.addons === 'string') {
        parsedAddons = JSON.parse(service.addons);
      } else if (Array.isArray(service.addons)) {
        parsedAddons = service.addons;
      }
    } catch (e) {
      parsedAddons = [];
    }
    
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.service_category,
      pricingTiers: [
        {
          name: "Standard",
          description: service.description || "",
          pricePerRoom: pricePerRoom.toString(),
          duration: service.duration_hours.toString(),
          addons: parsedAddons
        }
      ],
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
      pricingTiers: [
        { name: "Standard", description: "", pricePerRoom: "30", duration: "2", addons: [] }
      ],
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const addPricingTier = () => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: [
        ...prev.pricingTiers,
        { name: "", description: "", pricePerRoom: "", duration: "2", addons: [] }
      ]
    }));
  };

  const removePricingTier = (index: number) => {
    if (formData.pricingTiers.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, i) => i !== index)
    }));
  };

  const updatePricingTier = (index: number, field: keyof PricingTier, value: string | AddonService[]) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const addAddon = (tierIndex: number) => {
    const newAddon: AddonService = {
      id: Date.now().toString(),
      name: "",
      price: "",
      description: ""
    };
    
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.map((tier, i) => 
        i === tierIndex ? { ...tier, addons: [...tier.addons, newAddon] } : tier
      )
    }));
  };

  const removeAddon = (tierIndex: number, addonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.map((tier, i) => 
        i === tierIndex 
          ? { ...tier, addons: tier.addons.filter((_, ai) => ai !== addonIndex) }
          : tier
      )
    }));
  };

  const updateAddon = (tierIndex: number, addonIndex: number, field: keyof AddonService, value: string) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.map((tier, i) => 
        i === tierIndex 
          ? { 
              ...tier, 
              addons: tier.addons.map((addon, ai) => 
                ai === addonIndex ? { ...addon, [field]: value } : addon
              )
            }
          : tier
      )
    }));
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
              
              <div>
                <Label htmlFor="description">General Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="General description of the service offering"
                />
              </div>

              {/* Pricing Tiers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Pricing Tiers *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPricingTier}
                    disabled={formData.pricingTiers.length >= 5}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tier
                  </Button>
                </div>
                
                {formData.pricingTiers.map((tier, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Tier {index + 1}</Label>
                      {formData.pricingTiers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePricingTier(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div>
                         <Label htmlFor={`tier-name-${index}`}>Tier Name *</Label>
                         <Input
                           id={`tier-name-${index}`}
                           value={tier.name}
                           onChange={(e) => updatePricingTier(index, 'name', e.target.value)}
                           placeholder="e.g., Basic, Premium, Deluxe"
                           required
                         />
                       </div>
                       <div>
                         <Label htmlFor={`tier-per-room-${index}`}>Price Per Room (GHS) *</Label>
                         <Input
                           id={`tier-per-room-${index}`}
                           type="number"
                           step="0.01"
                           min="0"
                           value={tier.pricePerRoom}
                           onChange={(e) => updatePricingTier(index, 'pricePerRoom', e.target.value)}
                           placeholder="30.00"
                           required
                         />
                       </div>
                       <div>
                         <Label htmlFor={`tier-duration-${index}`}>Duration (Hours) *</Label>
                         <Input
                           id={`tier-duration-${index}`}
                           type="number"
                           min="1"
                           value={tier.duration}
                           onChange={(e) => updatePricingTier(index, 'duration', e.target.value)}
                           placeholder="2"
                           required
                         />
                       </div>
                       <div>
                         <Label htmlFor={`tier-description-${index}`}>Tier Description</Label>
                         <Input
                           id={`tier-description-${index}`}
                           value={tier.description}
                           onChange={(e) => updatePricingTier(index, 'description', e.target.value)}
                           placeholder="What's included in this tier"
                         />
                       </div>
                     </div>
                     
                     {/* Addons Section */}
                     <div className="space-y-3">
                       <div className="flex items-center justify-between">
                         <Label className="text-sm font-medium">Add-on Services</Label>
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => addAddon(index)}
                         >
                           <Plus className="h-4 w-4 mr-1" />
                           Add Addon
                         </Button>
                       </div>
                       
                       {tier.addons.map((addon, addonIndex) => (
                         <div key={addon.id} className="border rounded-lg p-3 space-y-2">
                           <div className="flex items-center justify-between">
                             <Label className="text-xs font-medium">Addon {addonIndex + 1}</Label>
                             <Button
                               type="button"
                               variant="ghost"
                               size="sm"
                               onClick={() => removeAddon(index, addonIndex)}
                             >
                               <X className="h-3 w-3" />
                             </Button>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                             <div>
                               <Label htmlFor={`addon-name-${index}-${addonIndex}`}>Name *</Label>
                               <Input
                                 id={`addon-name-${index}-${addonIndex}`}
                                 value={addon.name}
                                 onChange={(e) => updateAddon(index, addonIndex, 'name', e.target.value)}
                                 placeholder="e.g., Window Cleaning"
                                 required
                               />
                             </div>
                             <div>
                               <Label htmlFor={`addon-price-${index}-${addonIndex}`}>Price (GHS) *</Label>
                               <Input
                                 id={`addon-price-${index}-${addonIndex}`}
                                 type="number"
                                 step="0.01"
                                 min="0"
                                 value={addon.price}
                                 onChange={(e) => updateAddon(index, addonIndex, 'price', e.target.value)}
                                 placeholder="15.00"
                                 required
                               />
                             </div>
                             <div>
                               <Label htmlFor={`addon-description-${index}-${addonIndex}`}>Description</Label>
                               <Input
                                 id={`addon-description-${index}-${addonIndex}`}
                                 value={addon.description || ""}
                                 onChange={(e) => updateAddon(index, addonIndex, 'description', e.target.value)}
                                 placeholder="Brief description"
                               />
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                     
                     {/* Price Preview */}
                     <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                       <p className="text-sm text-muted-foreground">
                         <strong>Price Preview:</strong> GHS {tier.pricePerRoom ? parseFloat(tier.pricePerRoom).toFixed(2) : '0.00'} per room
                         <br />
                         <small>Clients will select number of rooms when booking</small>
                         {tier.addons.length > 0 && (
                           <>
                             <br />
                             <small>Add-ons: {tier.addons.map(a => a.name).join(', ')}</small>
                           </>
                         )}
                       </p>
                     </div>
                  </Card>
                ))}
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
                             GHS {(service.total_price / 100).toFixed(2)} per room
                           </Badge>
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
                      <Button size="sm" variant="outline" onClick={() => setViewingService(service)}>
                        <Eye className="h-3 w-3" />
                      </Button>
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

      {/* Service Details Dialog */}
      <CleaningServiceDetailsDialog
        service={viewingService}
        open={!!viewingService}
        onOpenChange={(open) => !open && setViewingService(null)}
      />
    </div>
  );
};