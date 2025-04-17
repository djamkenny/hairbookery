
import React from "react";
import { ServiceCard } from "./ServiceCard";
import { Service } from "./types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ServiceListProps {
  services: Service[];
  loading: boolean;
  editingServiceId: string | null;
  onAddService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  gridCols: string;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  loading,
  editingServiceId,
  onAddService,
  onEditService,
  onDeleteService,
  gridCols
}) => {
  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-4`}>
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
    );
  }
  
  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No services yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
            Add your first service by clicking the "Add Service" button above.
          </p>
          <Button onClick={onAddService}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Your First Service
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {services.map((service) => (
        <ServiceCard 
          key={service.id}
          service={service}
          onEdit={onEditService}
          onDelete={onDeleteService}
          isEditing={editingServiceId === service.id}
        />
      ))}
    </div>
  );
};
