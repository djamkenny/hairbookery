

import React from "react";
import { Clock, Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  features?: string[];
  className?: string;
  onViewDetail?: () => void;
}

const ServiceCard = ({ 
  title, 
  description, 
  price, 
  duration, 
  image,
  features = [],
  className,
  onViewDetail
}: ServiceCardProps) => {
  // Limit description to 120 characters
  const truncatedDescription = description.length > 120 
    ? description.substring(0, 120) + "..." 
    : description;

  const ServiceDetailDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          View Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="aspect-[4/2] overflow-hidden rounded-lg shadow-sm">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <span className="text-3xl font-bold text-primary">{price}</span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <div className="flex items-center justify-center text-lg font-medium">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Service Description</h4>
                <p className="text-muted-foreground leading-relaxed text-base">{description}</p>
              </div>
              
              {features.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">What's Included</h4>
                  <div className="grid gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Ready to book this service? Click "Book a Service" to get started.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border hover-scale",
      className
    )}>
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base md:text-lg font-medium text-foreground pr-2">{title}</h3>
          <span className="font-medium text-primary text-sm md:text-base flex-shrink-0">{price}</span>
        </div>
        
        <p className="text-muted-foreground mb-4 text-xs md:text-sm leading-relaxed">
          {truncatedDescription}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-muted-foreground text-xs">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{duration}</span>
          </div>
          
          <ServiceDetailDialog />
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;

