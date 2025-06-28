
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";

interface StylistCardProps {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  location?: string;
  className?: string;
}

const StylistCard = ({ id, name, role, bio, image, location, className }: StylistCardProps) => {
  // Limit bio to 100 characters
  const truncatedBio = bio.length > 100 
    ? bio.substring(0, 100) + "..." 
    : bio;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="aspect-square overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        <p className="text-primary text-sm mb-2">{role}</p>
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{truncatedBio}</p>
        
        <div className="flex items-start gap-1 mb-3">
          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-xs text-muted-foreground line-clamp-1">
            {location || "Location not specified"}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/stylist/${id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Profile
            </Button>
          </Link>
          <Link to={`/booking?stylist=${id}`} className="flex-1">
            <Button size="sm" className="w-full text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default StylistCard;
