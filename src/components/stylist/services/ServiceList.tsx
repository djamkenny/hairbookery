
import React, { useState } from "react";
import { Service } from "./types";
import { ServiceCard } from "./ServiceCard";
import { ServiceForm } from "./ServiceForm";
import { ServiceGallery } from "./ServiceGallery";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Grid, List } from "lucide-react";
import { toast } from "sonner";
import { 
  createService,
  updateService,
  deleteService,
  fetchServices
} from "./serviceApi";

interface ServiceListProps {
  services: Service[];
  onServicesChange: () => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ 
  services, 
  onServicesChange 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const handleCreateService = async (data: any) => {
    try {
      await createService(data);
      setIsCreating(false);
      onServicesChange();
      toast.success("Service created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create service");
    }
  };

  const handleUpdateService = async (data: any) => {
    if (!editingService) return;
    
    try {
      await updateService(editingService.id, data);
      setEditingService(null);
      setCurrentImages([]);
      onServicesChange();
      toast.success("Service updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update service");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
      onServicesChange();
      toast.success("Service deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete service");
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setCurrentImages(service.image_urls || []);
  };

  const handleImagesUpdate = (images: string[]) => {
    setCurrentImages(images);
  };

  if (isCreating) {
    return (
      <ServiceForm
        onSubmit={handleCreateService}
        onCancel={() => setIsCreating(false)}
        isEditing={false}
      />
    );
  }

  if (editingService) {
    return (
      <ServiceForm
          defaultValues={{
            name: editingService.name,
            description: editingService.description || "",
            duration: editingService.duration,
            price: editingService.price,
            category: editingService.category || 'Hair Cutting & Styling'
          }}
        onSubmit={handleUpdateService}
        onCancel={() => {
          setEditingService(null);
          setCurrentImages([]);
        }}
        isEditing={true}
        serviceId={editingService.id}
        currentImages={currentImages}
        onImagesUpdate={handleImagesUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Services</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Manage Services
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Service Gallery
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {services.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first service to start accepting bookings
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                  isEditing={!!editingService}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="gallery">
          <ServiceGallery services={services} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
