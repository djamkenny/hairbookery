
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ServiceFormValues {
  name: string;
  description: string;
  duration: string;
  price: string;
}

const StylistServicesTab = () => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  
  // Sample data - would be replaced with real data from API/database
  const [services, setServices] = useState([
    { 
      id: 1, 
      name: "Haircut & Styling", 
      description: "Professional haircut and styling service tailored to your preferences.",
      duration: "45 min", 
      price: "$65" 
    },
    { 
      id: 2, 
      name: "Hair Coloring", 
      description: "Full color service using premium products for vibrant, long-lasting results.",
      duration: "2 hours", 
      price: "$120" 
    },
    { 
      id: 3, 
      name: "Blowout", 
      description: "Professional blow dry and styling to achieve a smooth, voluminous look.",
      duration: "30 min", 
      price: "$45" 
    }
  ]);

  const form = useForm<ServiceFormValues>({
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: ""
    }
  });

  const handleAddService = (data: ServiceFormValues) => {
    const newService = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price
    };
    
    setServices([...services, newService]);
    setIsAddingService(false);
    form.reset();
    toast.success("Service added successfully");
  };

  const handleEditService = (service: any) => {
    setEditingServiceId(service.id);
    form.reset({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price
    });
  };

  const handleUpdateService = (data: ServiceFormValues) => {
    const updatedServices = services.map(service => 
      service.id === editingServiceId ? 
        { ...service, ...data } : 
        service
    );
    
    setServices(updatedServices);
    setEditingServiceId(null);
    form.reset();
    toast.success("Service updated successfully");
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
    toast.success("Service deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Services</h1>
        
        {!isAddingService && editingServiceId === null && (
          <Button onClick={() => setIsAddingService(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        )}
      </div>
      
      {(isAddingService || editingServiceId !== null) && (
        <Card>
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
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 45 min" {...field} />
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
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $65" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className={editingServiceId === service.id ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription className="mt-2">{service.price} • {service.duration}</CardDescription>
                </div>
                
                {editingServiceId !== service.id && (
                  <div className="flex space-x-2">
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
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StylistServicesTab;
