
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Appointment } from "@/types/appointment";
import AppointmentDetailsContent from "./appointment-details/AppointmentDetailsContent";

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (appointmentId: string, newStatus: string, clientId: string) => void;
  onCancelAppointment?: (appointmentId: string, clientId: string) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdateStatus,
  onCancelAppointment
}) => {
  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Appointment Details</DialogTitle>
          <DialogDescription>
            Complete information about this appointment
          </DialogDescription>
        </DialogHeader>
        
        <AppointmentDetailsContent
          appointment={appointment}
          onUpdateStatus={onUpdateStatus}
          onCancelAppointment={onCancelAppointment}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
