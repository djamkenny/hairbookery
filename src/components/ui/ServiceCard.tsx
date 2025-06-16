
import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  className?: string;
}

const ServiceCard = ({ 
  title, 
  description, 
  price, 
  duration, 
  image,
  className
}: ServiceCardProps) => {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border hover-scale",
      className
    )}>
      <div className="aspect-[6/3] overflow-hidden bg-muted relative">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          <span className="font-medium text-primary">{price}</span>
        </div>
        
        <p className="text-muted-foreground mb-4 text-sm">
          {description}
        </p>
        
        <div className="flex items-center text-muted-foreground text-xs">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
