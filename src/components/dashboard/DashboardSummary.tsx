
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, HeartIcon, ScissorsIcon, BadgeIcon } from "lucide-react";

interface DashboardSummaryProps {
  appointments: number;
  favorites: number;
  services?: number;
  loyaltyPoints?: number;
}

const DashboardSummary = ({ 
  appointments = 0, 
  favorites = 0,
  services = 0,
  loyaltyPoints = 0
}: DashboardSummaryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Upcoming</p>
            <p className="text-2xl font-medium">{appointments}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <HeartIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Favorites</p>
            <p className="text-2xl font-medium">{favorites}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <ScissorsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Services</p>
            <p className="text-2xl font-medium">{services}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <BadgeIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Loyalty Points</p>
            <p className="text-2xl font-medium">{loyaltyPoints}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
