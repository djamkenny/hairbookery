
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Appointment } from "@/types/appointment";
import { toast } from "sonner";

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
  const [isCompleting, setIsCompleting] = useState(false);

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

  const handleCompleteAppointment = async () => {
    setIsCompleting(true);
    try {
      await onUpdateStatus(appointment.id, "completed", appointment.client_id);
      toast.success("Appointment completed! Earnings have been processed and added to your balance.");
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <TableRow key={appointment.id} className={appointment.status !== 'completed' ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red'}>
      <TableCell className="font-medium text-xs md:text-sm">{appointment.client}</TableCell>
      <TableCell className="text-xs md:text-sm">{appointment.service}</TableCell>
      <TableCell className="text-xs md:text-sm">{appointment.date}</TableCell>
      <TableCell className="text-xs md:text-sm">{appointment.time}</TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(appointment.status)} className="text-xs">
          {getStatusLabel(appointment.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={() => onViewDetails && onViewDetails(appointment)}
          >
            Details
          </Button>
          {appointment.status === "pending" && (
            <Button 
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => onUpdateStatus(appointment.id, "confirmed", appointment.client_id)}
            >
              Confirm
            </Button>
          )}
          {appointment.status === "confirmed" && (
            <Button 
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={handleCompleteAppointment}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  <span className="hidden sm:inline">Processing</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                "Complete"
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AppointmentRow;
