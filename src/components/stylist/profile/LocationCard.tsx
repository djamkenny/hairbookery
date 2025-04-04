
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
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor="location" className="block text-sm font-medium">Salon/Workshop Address</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
              placeholder="Enter your full salon/workshop address"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Please provide a complete address that clients can use with navigation apps or ride services
            </p>
          </div>
        ) : (
          <div>
            {location ? (
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p>{location}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No location provided yet. Add your salon or workshop address.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationCard;
