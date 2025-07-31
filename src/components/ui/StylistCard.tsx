import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";

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
  const { availabilityStatus, loading, refetch } = useAvailabilityStatus(id);
  
  // Refresh availability status every 30 seconds to keep it current
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);
  
  // Limit bio to 100 characters
  const truncatedBio = bio.length > 100 
    ? bio.substring(0, 100) + "..." 
    : bio;

  const getAvailabilityText = () => {
    if (loading) return "";
    if (!availabilityStatus) return "";
    
    switch (availabilityStatus.status) {
      case 'available':
        return "Available";
      case 'full':
        return "Fully Booked";
      case 'unavailable':
      default:
        return "Not Available";
    }
  };

  const getAvailabilityColor = () => {
    if (loading || !availabilityStatus) return "text-muted-foreground";
    
    switch (availabilityStatus.status) {
      case 'available':
        return "text-green-600";
      case 'full':
        return "text-orange-600";
      case 'unavailable':
      default:
        return "text-red-600";
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-4">
          KnLbookery user
        </h2>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold mb-1">{name}</h3>
            <p className="text-primary text-sm mb-2">{role}</p>
          </div>
          {!loading && availabilityStatus && (
            <span className={`text-xs font-medium ${getAvailabilityColor()}`}>
              {getAvailabilityText()}
            </span>
          )}
        </div>
        
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{truncatedBio}</p>
        
        <div className="flex items-start gap-1 mb-3">
          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-xs text-muted-foreground line-clamp-1">
            {location || "Location not specified"}
          </span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Link to={`/stylist/${id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs h-9 px-3">
              View Profile
            </Button>
          </Link>
          <Link to={`/booking?stylist=${id}`} className="flex-1">
            <Button 
              size="sm" 
              className="w-full text-xs h-9 px-3"
              disabled={!availabilityStatus?.available || availabilityStatus?.status === 'unavailable'}
            >
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
