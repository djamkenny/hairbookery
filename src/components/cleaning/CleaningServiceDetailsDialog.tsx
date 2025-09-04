import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign } from "lucide-react";

interface CleaningService {
  id: string;
  name: string;
  description: string | null;
  total_price: number;
  duration_hours: number;
  service_category: string;
  created_at: string;
}

interface CleaningServiceDetailsDialogProps {
  service: CleaningService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPrice = (priceInCents: number) => {
  return `GHS ${(priceInCents / 100).toFixed(2)}`;
};

const getCategoryLabel = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    home: "Home Cleaning",
    office: "Office Cleaning",
    deep: "Deep Cleaning",
    carpet: "Carpet Cleaning",
    post_construction: "Post-Construction Cleaning",
  };
  return categoryMap[category] || category;
};

export const CleaningServiceDetailsDialog: React.FC<CleaningServiceDetailsDialogProps> = ({
  service,
  open,
  onOpenChange,
}) => {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{service.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{formatPrice(service.total_price)}</p>
                <p className="text-sm text-muted-foreground">Total Service Cost</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{service.duration_hours} hours</p>
                <p className="text-sm text-muted-foreground">Estimated Duration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <Badge variant="secondary">{getCategoryLabel(service.service_category)}</Badge>
                <p className="text-sm text-muted-foreground mt-1">Service Category</p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {service.description && (
            <div>
              <h4 className="font-medium mb-2">Service Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          )}
          
          {/* Payment Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Booking Fee (Pay Now):</span>
                <span className="font-medium text-primary">
                  {formatPrice(service.total_price >= 10000 ? 1000 : Math.round(service.total_price * 0.1))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Cost (At Appointment):</span>
                <span className="font-medium">{formatPrice(service.total_price)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Cost:</span>
                <span>
                  {formatPrice(service.total_price + (service.total_price >= 10000 ? 1000 : Math.round(service.total_price * 0.1)))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};