import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";
import { useLocationSharing } from "@/hooks/useLocationSharing";

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
  const { shareLocation } = useLocationSharing();
  
  // Refresh availability status every 30 seconds to keep it current
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);
  
  // Limit bio to 50 characters
  const truncatedBio = bio.length > 50 
    ? bio.substring(0, 50) + "..." 
    : bio;

  // Limit role to 25 characters
  const truncatedRole = role.length > 25 
    ? role.substring(0, 25) + "..." 
    : role;

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
        return "text-primary";
      case 'full':
        return "text-orange-600";
      case 'unavailable':
      default:
        return "text-red-600";
    }
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (location) {
      shareLocation(location, name);
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 md:w-[calc(100%+3px)] ${className}`}>
      <div className="aspect-square overflow-hidden rounded-t-lg">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="h-full w-full bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 flex items-center justify-center">
                  <h2 class="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-4">
                    KnLbookery user
                  </h2>
                </div>
              `;
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-4">
              KnLbookery user
            </h2>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold mb-1">{name}</h3>
            <p className="text-primary text-sm mb-2">{truncatedRole}</p>
          </div>
          {!loading && availabilityStatus && (
            <span className={`text-xs font-medium ${getAvailabilityColor()}`}>
              {getAvailabilityText()}
            </span>
          )}
        </div>
        
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{truncatedBio}</p>
        
        <div 
          className="flex items-start gap-1 mb-3 cursor-pointer group/location hover:bg-muted/50 rounded p-1 -m-1 transition-colors"
          onClick={handleLocationClick}
        >
          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0 group-hover/location:text-primary transition-colors" />
          <span className="text-xs text-muted-foreground line-clamp-1 group-hover/location:text-primary transition-colors">
            {location || "Location not specified"}
          </span>
          {location && (
            <Navigation className="h-3 w-3 text-muted-foreground group-hover/location:text-primary transition-colors opacity-0 group-hover/location:opacity-100" />
          )}
        </div>
        
        <div className="mt-4">
          <Link to={`/stylist/${id}`} className="block">
            <Button variant="outline" size="sm" className="w-full text-xs h-9 px-3 md:h-7 md:px-2 md:text-[10px]">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default StylistCard;
