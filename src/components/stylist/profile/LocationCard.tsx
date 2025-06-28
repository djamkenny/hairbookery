
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPinIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationCardProps {
  isEditing: boolean;
  location: string;
  setLocation: (location: string) => void;
  className?: string;
}

const LocationCard = ({
  isEditing,
  location,
  setLocation,
  className
}: LocationCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-3">
            <Label htmlFor="location" className="text-sm font-medium">
              Salon/Workshop Address
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
              placeholder="Enter your full salon/workshop address"
            />
            <p className="text-xs text-muted-foreground">
              Please provide a complete address that clients can use with navigation apps or ride services
            </p>
          </div>
        ) : (
          <div className="min-h-[60px] flex items-start">
            {location ? (
              <div className="flex items-start gap-3 w-full">
                <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed break-words">{location}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Location not provided yet. Add your salon or workshop address.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationCard;
