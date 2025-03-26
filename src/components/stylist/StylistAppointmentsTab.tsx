
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AppointmentsTable from "./AppointmentsTable";
import { Appointment } from "@/types/appointment";
import { fetchStylistAppointments, updateAppointmentStatus } from "@/services/appointmentService";

const StylistAppointmentsTab = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const data = await fetchStylistAppointments();
        setAppointments(data);
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, []);
  
  const handleUpdateStatus = async (appointmentId: string, newStatus: string, clientId: string) => {
    try {
      const appointmentInfo = appointments.find(a => a.id === appointmentId);
      
      await updateAppointmentStatus(
        appointmentId, 
        newStatus, 
        clientId, 
        appointmentInfo
      );
      
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
  
  const handleViewDetails = (appointment: Appointment) => {
    // This can be implemented later to show a modal with details
    console.log("View details for appointment:", appointment);
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
            <AppointmentsTable 
              appointments={appointments} 
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewDetails}
            />
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
