
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";

interface AppointmentRowProps {
  appointment: Appointment;
  onUpdateStatus: (appointmentId: string, newStatus: string, clientId: string) => void;
  onViewDetails?: (appointment: Appointment) => void;
}

const AppointmentRow: React.FC<AppointmentRowProps> = ({ 
  appointment, 
  onUpdateStatus,
  onViewDetails 
}) => {
  const getBadgeVariant = (status: string) => {
    switch(status) {
      case "confirmed": return "default";
      case "completed": return "secondary";
      case "canceled": return "destructive";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "confirmed": return "Confirmed";
      case "completed": return "Completed";
      case "canceled": return "Canceled";
      default: return "Pending";
    }
  };

  return (
    <TableRow key={appointment.id}>
      <TableCell className="font-medium">{appointment.client}</TableCell>
      <TableCell>{appointment.service}</TableCell>
      <TableCell>{appointment.date}</TableCell>
      <TableCell>{appointment.time}</TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(appointment.status)}>
          {getStatusLabel(appointment.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails && onViewDetails(appointment)}
          >
            Details
          </Button>
          {appointment.status === "pending" && (
            <Button 
              size="sm"
              onClick={() => onUpdateStatus(appointment.id, "confirmed", appointment.client_id)}
            >
              Confirm
            </Button>
          )}
          {appointment.status === "confirmed" && (
            <Button 
              size="sm"
              onClick={() => onUpdateStatus(appointment.id, "completed", appointment.client_id)}
            >
              Complete
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AppointmentRow;
