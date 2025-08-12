
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Image as ImageIcon, Upload } from "lucide-react";
import { Service } from "./types";
import { ServiceImageUpload } from "./ServiceImageUpload";

interface ServiceGalleryProps {
  services: Service[];
  className?: string;
  onServicesChange?: () => void;
}

export const ServiceGallery: React.FC<ServiceGalleryProps> = ({ services, className, onServicesChange }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadService, setUploadService] = useState<Service | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesWithImages.map((service) => (
          <div key={service.id} className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-lg">{service.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {service.image_urls?.length || 0} photos
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setUploadService(service)}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {service.image_urls?.slice(0, 2).map((imageUrl, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-muted">
                      <img
                        src={imageUrl}
                        alt={`${service.name} image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                        {index === 1 && (service.image_urls?.length || 0) > 2 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="text-white font-medium">
                              +{(service.image_urls?.length || 0) - 2} more
                            </span>
                          </div>
                        )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {service.image_urls?.map((url, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => setSelectedImage(url)}
                          >
                            <img
                              src={url}
                              alt={`${service.name} image ${imgIndex + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4">
                        <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-muted-foreground mb-3">{service.description}</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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

      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-6xl w-full">
            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Service image"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
