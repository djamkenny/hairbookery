import React from "react";
import { Clock, DollarSign, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Service } from "./types";
import { formatGHS } from "./formatGHS";

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
  const hasImages = service.image_urls && service.image_urls.length > 0;
  const firstImage = hasImages ? service.image_urls[0] : null;

  return (
    <Card className={isEditing ? "opacity-50" : ""}>
      {firstImage && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
          <img
            src={firstImage}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          {service.image_urls && service.image_urls.length > 1 && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-black/70 text-white"
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              {service.image_urls.length}
            </Badge>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="max-w-[70%]">
            <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
            {service.description && (
              <CardDescription className="mt-1">{service.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(service)}
              disabled={isEditing}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(service.id)}
              disabled={isEditing}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
            <span className="font-medium">{formatGHS(service.price)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{service.duration}min</span>
          </div>
        </div>

        {!hasImages && (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg text-center">
            <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">No images yet</p>
            <p className="text-xs text-muted-foreground">Edit to add photos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
