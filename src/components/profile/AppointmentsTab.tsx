
import React from "react";
import { Link } from "react-router-dom";
import { 
  CalendarIcon, 
  ClockIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Appointment {
  id: number;
  service: string;
  stylist: string;
  date: string;
  time: string;
  status: string;
}

interface AppointmentsTabProps {
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  handleRescheduleAppointment: (id: number) => void;
  handleCancelAppointment: (id: number) => void;
}

const AppointmentsTab = ({ 
  upcomingAppointments, 
  pastAppointments, 
  handleRescheduleAppointment, 
  handleCancelAppointment 
}: AppointmentsTabProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Appointments</h1>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="border-l-4 border-primary p-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{appointment.service}</h3>
                        <p className="text-muted-foreground">With {appointment.stylist}</p>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:text-right">
                        <div className="flex items-center sm:justify-end text-sm font-medium mb-1">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center sm:justify-end text-sm text-muted-foreground">
                          <ClockIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRescheduleAppointment(appointment.id)}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">You don't have any upcoming appointments.</p>
              <Link to="/booking">
                <Button>Book an Appointment</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-l-4 border-muted p-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{appointment.service}</h3>
                        <p className="text-muted-foreground">With {appointment.stylist}</p>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:text-right">
                        <div className="flex items-center sm:justify-end text-sm font-medium mb-1">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center sm:justify-end text-sm text-muted-foreground">
                          <ClockIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        Book Similar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                      >
                        Leave Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">You don't have any past appointments.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsTab;
