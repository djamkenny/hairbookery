
import React from "react";
import { Link } from "react-router-dom";
import { 
  CalendarIcon, 
  ClockIcon,
  BellIcon,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import AppointmentStats from "@/components/dashboard/AppointmentStats";
import QuickActions from "@/components/dashboard/QuickActions";
import { Appointment } from "@/types/appointment";

interface DashboardTabProps {
  user: any;
  avatarUrl: string | null;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  favoriteSylists: any[];
  loyaltyPoints: number;
  handleRescheduleAppointment: (id: string) => void;
  handleCancelAppointment: (id: string) => void;
}

const DashboardTab = ({ 
  user,
  avatarUrl,
  upcomingAppointments,
  pastAppointments,
  favoriteSylists,
  loyaltyPoints,
  handleRescheduleAppointment, 
  handleCancelAppointment 
}: DashboardTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <BellIcon className="h-3.5 w-3.5" />
            <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </Badge>
        </div>
      </div>
      
      <DashboardSummary 
        appointments={upcomingAppointments.length} 
        favorites={favoriteSylists.length}
        services={pastAppointments.length}
        loyaltyPoints={loyaltyPoints}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppointmentStats pastAppointments={pastAppointments.length} upcomingAppointments={upcomingAppointments.length} />
        <QuickActions />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Appointment</CardTitle>
          <CardDescription>Your upcoming appointment details</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="bg-secondary/30 p-4 rounded-lg border border-border/30">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium text-lg">{upcomingAppointments[0].service}</h3>
                  <p className="text-muted-foreground">With {upcomingAppointments[0].stylist}</p>
                  {upcomingAppointments[0].order_id && (
                    <div className="flex items-center mt-2 gap-2 p-1.5 bg-primary/5 rounded border border-primary/10 w-fit">
                      <ClipboardList className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-mono text-primary">{upcomingAppointments[0].order_id}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center text-sm font-medium mb-1">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                    <span>{upcomingAppointments[0].date}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ClockIcon className="h-3.5 w-3.5 mr-1" />
                    <span>{upcomingAppointments[0].time}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRescheduleAppointment(upcomingAppointments[0].id)}
                >
                  Reschedule
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancelAppointment(upcomingAppointments[0].id)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-3">You don't have any upcoming appointments.</p>
              <Link to="/booking">
                <Button size="sm">Book an Appointment</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
