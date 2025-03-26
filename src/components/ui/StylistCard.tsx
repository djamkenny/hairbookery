
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StylistCardProps {
  id: string | number;
  name: string;
  role: string;
  bio: string;
  image: string;
  className?: string;
  style?: React.CSSProperties;
}

const StylistCard = ({ 
  id, 
  name, 
  role, 
  bio, 
  image,
  className,
  style
}: StylistCardProps) => {
  return (
    <div 
      className={cn(
        "group bg-card border border-border/30 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-border",
        className
      )}
      style={style}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-medium mb-1">{name}</h3>
        <p className="text-primary text-sm mb-3">{role}</p>
        <p className="text-muted-foreground text-sm mb-4">{bio}</p>
        
        <Link to={`/booking?stylist=${id}`}>
          <Button variant="outline" className="w-full">
            Book with {name.split(" ")[0]}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StylistCard;
