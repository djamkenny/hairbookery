
import React, { useState, useEffect } from "react";
import { ServiceList } from "./services/ServiceList";
import { Service } from "./services/types";
import { fetchServices } from "./services/serviceApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SpecialistServicesTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      setLoading(true);
      const fetchedServices = await fetchServices();
      setServices(fetchedServices);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error(error.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceList 
        services={services} 
        onServicesChange={loadServices}
      />
    </div>
  );
};

export default SpecialistServicesTab;
