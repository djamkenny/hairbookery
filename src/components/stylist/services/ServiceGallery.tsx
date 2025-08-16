
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { Service } from "./types";
import { ServiceImageUpload } from "./ServiceImageUpload";
import { deleteService } from "./serviceApi";
import { toast } from "@/hooks/use-toast";
import ImageLightbox from "@/components/ui/ImageLightbox";

interface ServiceGalleryProps {
  services: Service[];
  className?: string;
  onServicesChange?: () => void;
}

export const ServiceGallery: React.FC<ServiceGalleryProps> = ({ services, className, onServicesChange }) => {
  const [uploadService, setUploadService] = useState<Service | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");

  const servicesWithImages = services.filter(service => service.image_urls && service.image_urls.length > 0);

  if (servicesWithImages.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Service Images Yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload images to your services to create a beautiful gallery for clients
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Service Gallery</h2>
        <p className="text-muted-foreground">Showcase of our available services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {servicesWithImages.map((service) => (
          <div key={service.id} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h3 className="font-medium text-lg">{service.name}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {service.image_urls?.length || 0} photos
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-xs px-2 py-1"
                    onClick={() => setUploadService(service)}
                  >
                    <Upload className="h-3 w-3" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-destructive text-xs px-2 py-1"
                    onClick={async () => {
                      if (!confirm("Delete this service? This will remove its images and types.")) return;
                      try {
                        await deleteService(service.id);
                        toast({ description: "Service deleted" });
                        onServicesChange?.();
                      } catch (e: any) {
                        console.error(e);
                        toast({ variant: "destructive", description: e.message || "Failed to delete service" });
                      }
                    }}
                    title="Delete service"
                    aria-label="Delete service"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {service.image_urls?.slice(0, 2).map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-muted"
                  onClick={() => {
                    setLightboxImages(service.image_urls || []);
                    setLightboxIndex(index);
                    setLightboxTitle(service.name);
                    setLightboxOpen(true);
                  }}
                  aria-label={`Open ${service.name} gallery at image ${index + 1}`}
                >
                  <img
                    src={imageUrl}
                    alt={`${service.name} image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {index === 1 && (service.image_urls?.length || 0) > 2 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-medium">+{(service.image_urls?.length || 0) - 2} more</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              {service.description && (
                <p className="text-sm text-muted-foreground mb-0">{service.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {uploadService && (
        <Dialog open={!!uploadService} onOpenChange={(open) => !open && setUploadService(null)}>
          <DialogContent className="max-w-2xl w-full">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload images for {uploadService.name}</h3>
              <ServiceImageUpload
                serviceId={uploadService.id}
                currentImages={uploadService.image_urls || []}
                onImagesUpdate={() => {
                  setUploadService(null);
                  onServicesChange?.();
                }}
                maxImages={2}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={lightboxImages}
        startIndex={lightboxIndex}
        altPrefix={`${lightboxTitle} image`}
        title={lightboxTitle}
      />
    </div>
  );
};
