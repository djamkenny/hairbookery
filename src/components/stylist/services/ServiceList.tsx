
import React from "react";
import { Service } from "./types";
import { ServiceGallery } from "./ServiceGallery";
import ServiceTypeManagement from "./ServiceTypeManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, Settings } from "lucide-react";

interface ServiceListProps {
  services: Service[];
  onServicesChange: () => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ 
  services, 
  onServicesChange 
}) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="types" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Service Types
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Service Gallery
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="types" className="space-y-4">
          <ServiceTypeManagement onServicesChange={onServicesChange} />
        </TabsContent>
        
        <TabsContent value="gallery">
          <ServiceGallery services={services} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
