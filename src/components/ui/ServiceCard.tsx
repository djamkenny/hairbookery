
import React from "react";
import { Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  features?: string[];
  className?: string;
}

const ServiceCard = ({ 
  title, 
  description, 
  price, 
  duration, 
  image,
  features = [],
  className
}: ServiceCardProps) => {
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
          {description}
        </p>
        
        {features.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs md:text-sm font-medium mb-2 text-foreground">What's included:</h4>
            <ul className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center text-xs text-muted-foreground">
                  <Check className="h-3 w-3 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">{feature}</span>
                </li>
              ))}
              {features.length > 3 && (
                <li className="text-xs text-muted-foreground pl-5">
                  +{features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}
        
        <div className="flex items-center text-muted-foreground text-xs">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
