
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const StylistAppointmentsTab = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return;
        }
        
        // Fetch appointments where this stylist is assigned, along with client info
        // Use separate queries to avoid relationship issues
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            services:service_id(name)
          `)
          .eq('stylist_id', user.id)
          .is('canceled_at', null);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Get all unique client IDs from the appointments
          const clientIds = [...new Set(data.map(appointment => appointment.client_id))];
          
          // Fetch client profiles in a separate query
          const { data: clientProfiles, error: clientError } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .in('id', clientIds);
            
          if (clientError) {
            console.error("Error fetching client profiles:", clientError);
          }
          
          // Create a map of client profiles by ID for easy lookup
          const clientProfileMap = (clientProfiles || []).reduce((map, profile) => {
            map[profile.id] = profile;
            return map;
          }, {} as Record<string, any>);
          
          // Format the appointments data with client info from the map
          const formattedAppointments = data.map(appointment => {
            const clientProfile = clientProfileMap[appointment.client_id] || {};
            
            return {
              id: appointment.id,
              client: clientProfile.full_name || 'Client',
              service: appointment.services?.name || 'Service',
              date: format(new Date(appointment.appointment_date), 'MMMM dd, yyyy'),
              time: appointment.appointment_time,
              status: appointment.status,
              clientEmail: clientProfile.email,
              clientPhone: clientProfile.phone
            };
          });
          
          setAppointments(formattedAppointments);
        }
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      // Update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus } 
            : appointment
        )
      );
      
      toast.success(`Appointment ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error("Failed to update appointment status");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.client}</TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                        {appointment.status === "confirmed" ? "Confirmed" : 
                         appointment.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Details</Button>
                        {appointment.status === "pending" && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment.id, "confirmed")}
                          >
                            Confirm
                          </Button>
                        )}
                        {appointment.status === "confirmed" && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment.id, "completed")}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't have any upcoming appointments.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistAppointmentsTab;
