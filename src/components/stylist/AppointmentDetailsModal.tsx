
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
<DialogContent className="sm:max-w-md max-h-[92vh] h-[92vh] min-h-0 p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-4 shrink-0">
          <DialogTitle className="text-xl">Appointment Details</DialogTitle>
          <DialogDescription>
            Complete information about this appointment
          </DialogDescription>
        </DialogHeader>
        <ScrollArea type="always" className="flex-1 h-full px-6 pb-6">
          <AppointmentDetailsContent
            appointment={appointment}
            onUpdateStatus={onUpdateStatus}
            onCancelAppointment={onCancelAppointment}
            onClose={onClose}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
