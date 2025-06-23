
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, Users, CalendarCheck, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <CalendarClock className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Upcoming</p>
            <p className="text-xl sm:text-2xl font-medium">{upcomingAppointments}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <Users className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Clients</p>
            <p className="text-xl sm:text-2xl font-medium">{totalClients}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <CalendarCheck className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Completed</p>
            <p className="text-xl sm:text-2xl font-medium">{completedAppointments}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <Star className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Rating</p>
            <p className="text-xl sm:text-2xl font-medium">{rating ? rating.toFixed(1) : '--'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistDashboardSummary;
