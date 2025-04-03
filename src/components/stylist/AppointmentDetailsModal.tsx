
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
import { Separator } from "@/components/ui/separator";
import ClientInfoCard from "./appointment-details/ClientInfoCard";
import DateTimeCards from "./appointment-details/DateTimeCards";
import OrderIdCard from "./appointment-details/OrderIdCard";
import ServiceStatusCard from "./appointment-details/ServiceStatusCard";
import AppointmentActions from "./appointment-details/AppointmentActions";

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
        
        <div className="grid gap-4 py-3">
          <ClientInfoCard 
            client={appointment.client}
            clientEmail={appointment.clientEmail}
            clientPhone={appointment.clientPhone}
          />

          <DateTimeCards 
            date={appointment.date}
            time={appointment.time}
          />

          {appointment.order_id && (
            <OrderIdCard orderId={appointment.order_id} />
          )}

          <ServiceStatusCard 
            service={appointment.service}
            status={appointment.status}
          />
        </div>

        <Separator />

        <DialogFooter>
          <AppointmentActions 
            status={appointment.status}
            appointmentId={appointment.id}
            clientId={appointment.client_id}
            onUpdateStatus={onUpdateStatus}
            onCancelAppointment={onCancelAppointment}
            onClose={onClose}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
