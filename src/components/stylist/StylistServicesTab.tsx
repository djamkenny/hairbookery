
import React, { useState, useEffect } from "react";
import { PlusCircle, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";

import { ServiceForm, ServiceFormValues } from "./services/ServiceForm";
import { ServiceList } from "./services/ServiceList";
import { Service } from "./services/types";
import { fetchServices, addService, updateService, deleteService } from "./services/serviceApi";

const StylistServicesTab = () => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFormValues, setEditingFormValues] = useState<ServiceFormValues | undefined>(undefined);
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const servicesData = await fetchServices();
    setServices(servicesData);
    setLoading(false);
  };

  const handleAddServiceSubmit = async (data: ServiceFormValues) => {
    const newService = await addService(data);
    
    if (newService) {
      setServices([...services, newService]);
      setIsAddingService(false);
      toast.success("Service added successfully");
    }
  };

  const handleEditService = (service: Service) => {
    // Remove the "min" from duration and "$" from price
    const durationValue = service.duration.replace(/\D/g, '');
    const priceValue = service.price.replace(/[^0-9.]/g, '');
    
    setEditingServiceId(service.id);
    
    // Prepare form values for editing
    const formValues: ServiceFormValues = {
      name: service.name,
      description: service.description || "",
      duration: durationValue,
      price: priceValue
    };
    
    setEditingFormValues(formValues);
    return formValues;
  };

  const handleUpdateServiceSubmit = async (data: ServiceFormValues) => {
    if (!editingServiceId) return;
    
    const success = await updateService(editingServiceId, data);
    
    if (success) {
      // Extract values for UI update
      const priceStr = data.price.replace(/[^0-9.]/g, '');
      const durationStr = data.duration.replace(/[^0-9]/g, '');
      const priceValue = priceStr ? parseFloat(priceStr) : 0;
      const durationValue = durationStr ? parseInt(durationStr) : 0;
      
      // Update local state
      const updatedServices = services.map(service => 
        service.id === editingServiceId ? 
          { 
            ...service, 
            name: data.name,
            description: data.description || null,
            duration: `${durationValue} min`,
            price: `$${priceValue}`
          } : 
          service
      );
      
      setServices(updatedServices);
      setEditingServiceId(null);
      setEditingFormValues(undefined);
      toast.success("Service updated successfully");
    }
  };

  const handleDeleteService = async (id: string) => {
    const success = await deleteService(id);
    
    if (success) {
      setServices(services.filter(service => service.id !== id));
      toast.success("Service deleted successfully");
    }
  };

  const cancelForm = () => {
    setIsAddingService(false);
    setEditingServiceId(null);
    setEditingFormValues(undefined);
  };

  const getGridCols = () => {
    if (breakpoint === 'xxs' || breakpoint === 'xs' || breakpoint === 'sm') {
      return 'grid-cols-1';
    } else if (breakpoint === 'md') {
      return 'grid-cols-2';
    } else {
      return 'grid-cols-3';
    }
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Services</h1>
        </div>
        
        {!isAddingService && editingServiceId === null && (
          <Button onClick={() => setIsAddingService(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        )}
      </div>
      
      {(isAddingService || editingServiceId !== null) && (
        <ServiceForm 
          defaultValues={editingFormValues}
          onSubmit={editingServiceId ? handleUpdateServiceSubmit : handleAddServiceSubmit}
          onCancel={cancelForm}
          isEditing={editingServiceId !== null}
        />
      )}
      
      <ServiceList 
        services={services}
        loading={loading}
        editingServiceId={editingServiceId}
        onAddService={() => setIsAddingService(true)}
        onEditService={(service) => {
          handleEditService(service);
        }}
        onDeleteService={handleDeleteService}
        gridCols={getGridCols()}
      />
    </div>
  );
};

export default StylistServicesTab;
