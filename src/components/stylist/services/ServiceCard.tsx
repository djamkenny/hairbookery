
import React from "react";
import { Clock, DollarSign, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Service } from "./types";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onEdit, 
  onDelete, 
  isEditing 
}) => {
  return (
    <Card className={isEditing ? "opacity-50" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="max-w-[70%]">
            <CardTitle className="text-lg truncate">{service.name}</CardTitle>
            <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                {service.price}
              </span>
              <span className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-0.5" />
                {service.duration}
              </span>
            </CardDescription>
          </div>
          
          {!isEditing && (
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onEdit(service)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDelete(service.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {service.description || "No description provided."}
        </p>
      </CardContent>
    </Card>
  );
};
