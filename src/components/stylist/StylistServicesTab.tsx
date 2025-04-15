
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, Scissors, Clock, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";

const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  price: z.string().min(1, "Price is required")
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: string;
  price: string;
}

const StylistServicesTab = () => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: ""
    }
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to view services");
        return;
      }

      // Fetch services from the database
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
        return;
      }

      const formattedServices = data.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: `${service.duration} min`,
        price: `$${service.price}`
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error("Error in fetchServices:", error);
      toast.error("An error occurred while fetching services");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (data: ServiceFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to add services");
        return;
      }

      // Extract numeric price and duration values
      const priceStr = data.price.replace(/[^0-9.]/g, '');
      const durationStr = data.duration.replace(/[^0-9]/g, '');
      
      // Ensure valid numeric values
      const priceValue = priceStr ? parseFloat(priceStr) : 0;
      const durationValue = durationStr ? parseInt(durationStr) : 0;
      
      if (isNaN(priceValue) || priceValue <= 0) {
        toast.error("Please enter a valid price");
        return;
      }
      
      if (isNaN(durationValue) || durationValue <= 0) {
        toast.error("Please enter a valid duration");
        return;
      }

      console.log("Submitting service:", {
        name: data.name,
        description: data.description,
        price: priceValue,
        duration: durationValue
      });

      // Insert new service with the stylist_id attached (this is what we need to add)
      const { data: newService, error } = await supabase
        .from('services')
        .insert({
          name: data.name,
          description: data.description || null,
          price: priceValue,
          duration: durationValue,
          stylist_id: user.id // Add stylist_id to link service to stylist
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding service:", error);
        toast.error("Failed to add service: " + error.message);
        return;
      }

      console.log("Service added successfully:", newService);

      const formattedService = {
        id: newService.id,
        name: newService.name,
        description: newService.description,
        duration: `${newService.duration} min`,
        price: `$${newService.price}`
      };
      
      setServices([...services, formattedService]);
      setIsAddingService(false);
      form.reset();
      toast.success("Service added successfully");
    } catch (error: any) {
      console.error("Error in handleAddService:", error);
      toast.error(`An error occurred while adding the service: ${error.message || "Unknown error"}`);
    }
  };

  const handleEditService = (service: Service) => {
    // Remove the "min" from duration and "$" from price
    const durationValue = service.duration.replace(/\D/g, '');
    const priceValue = service.price.replace(/[^0-9.]/g, '');
    
    setEditingServiceId(service.id);
    form.reset({
      name: service.name,
      description: service.description || "",
      duration: durationValue,
      price: priceValue
    });
  };

  const handleUpdateService = async (data: ServiceFormValues) => {
    try {
      if (!editingServiceId) return;

      // Extract numeric price and duration values
      const priceStr = data.price.replace(/[^0-9.]/g, '');
      const durationStr = data.duration.replace(/[^0-9]/g, '');
      
      // Ensure valid numeric values
      const priceValue = priceStr ? parseFloat(priceStr) : 0;
      const durationValue = durationStr ? parseInt(durationStr) : 0;
      
      if (isNaN(priceValue) || priceValue <= 0) {
        toast.error("Please enter a valid price");
        return;
      }
      
      if (isNaN(durationValue) || durationValue <= 0) {
        toast.error("Please enter a valid duration");
        return;
      }

      const { error } = await supabase
        .from('services')
        .update({
          name: data.name,
          description: data.description || null,
          price: priceValue,
          duration: durationValue
        })
        .eq('id', editingServiceId);
      
      if (error) {
        console.error("Error updating service:", error);
        toast.error("Failed to update service: " + error.message);
        return;
      }

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
      form.reset();
      toast.success("Service updated successfully");
    } catch (error: any) {
      console.error("Error in handleUpdateService:", error);
      toast.error(`An error occurred while updating the service: ${error.message || "Unknown error"}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service: " + error.message);
        return;
      }

      setServices(services.filter(service => service.id !== id));
      toast.success("Service deleted successfully");
    } catch (error: any) {
      console.error("Error in handleDeleteService:", error);
      toast.error(`An error occurred while deleting the service: ${error.message || "Unknown error"}`);
    }
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
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{editingServiceId !== null ? "Edit Service" : "Add New Service"}</CardTitle>
            <CardDescription>
              {editingServiceId !== null 
                ? "Update the details of your service" 
                : "Fill in the details to add a new service to your offerings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingServiceId !== null ? handleUpdateService : handleAddService)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Haircut & Styling" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this service includes" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. 45" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. 65" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingService(false);
                      setEditingServiceId(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingServiceId !== null ? "Update Service" : "Add Service"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Service listing - loading state, empty state, or list of services */}
      {loading ? (
        <div className={`grid ${getGridCols()} gap-4`}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 && !isAddingService ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No services yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
              Add your first service by clicking the "Add Service" button above.
            </p>
            <Button onClick={() => setIsAddingService(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${getGridCols()} gap-4`}>
          {services.map((service) => (
            <Card key={service.id} className={editingServiceId === service.id ? "opacity-50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <CardTitle className="text-lg truncate">{service.name}</CardTitle>
                    <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="flex items-center"><DollarSign className="h-3.5 w-3.5 mr-0.5" />{service.price}</span>
                      <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-0.5" />{service.duration}</span>
                    </CardDescription>
                  </div>
                  
                  {editingServiceId !== service.id && (
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{service.description || "No description provided."}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StylistServicesTab;
