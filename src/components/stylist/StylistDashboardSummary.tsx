
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, Users, CalendarCheck, Star } from "lucide-react";

interface StylistDashboardSummaryProps {
  upcomingAppointments: number;
  totalClients: number;
  completedAppointments: number;
  rating: number | null;
}

const StylistDashboardSummary = ({
  upcomingAppointments = 0,
  totalClients = 0,
  completedAppointments = 0,
  rating = null
}: StylistDashboardSummaryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Upcoming</p>
            <p className="text-2xl font-medium">{upcomingAppointments}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Clients</p>
            <p className="text-2xl font-medium">{totalClients}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <CalendarCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Completed</p>
            <p className="text-2xl font-medium">{completedAppointments}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Rating</p>
            <p className="text-2xl font-medium">{rating ? rating.toFixed(1) : '--'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistDashboardSummary;
