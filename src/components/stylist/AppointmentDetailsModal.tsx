
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Scissors,
  ClipboardList
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  if (!appointment) return null;

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

  const handleCancelAppointment = () => {
    if (onCancelAppointment && appointment) {
      onCancelAppointment(appointment.id, appointment.client_id);
      setIsCancelAlertOpen(false);
      toast.success("Appointment canceled");
      onClose();
    }
  };

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
          <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50">
            <div className="bg-primary/10 p-2 rounded-md">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold leading-none">Client</h4>
              <p className="text-sm text-muted-foreground">{appointment.client}</p>
              {appointment.clientEmail && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{appointment.clientEmail}</span>
                </div>
              )}
              {appointment.clientPhone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{appointment.clientPhone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50">
              <div className="bg-primary/10 p-2 rounded-md">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold leading-none">Date</h4>
                <p className="text-sm text-muted-foreground">{appointment.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50">
              <div className="bg-primary/10 p-2 rounded-md">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold leading-none">Time</h4>
                <p className="text-sm text-muted-foreground">{appointment.time}</p>
              </div>
            </div>
          </div>

          {appointment.order_id && (
            <div className="flex items-start gap-3 border rounded-lg p-3 bg-background/50 border-primary/20">
              <div className="bg-primary/10 p-2 rounded-md">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold leading-none">Order ID</h4>
                <p className="text-sm text-primary font-mono">{appointment.order_id}</p>
                <p className="text-xs text-muted-foreground">Share this ID with the client for reference</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 border rounded-lg p-3 bg-background/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">Service</h4>
              </div>
              <Badge variant={getBadgeVariant(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{appointment.service}</p>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex justify-between items-center">
          <div>
            {appointment.status === "pending" && onUpdateStatus && (
              <Button 
                onClick={() => {
                  onUpdateStatus(appointment.id, "confirmed", appointment.client_id);
                  onClose();
                }}
              >
                Confirm Appointment
              </Button>
            )}
            {appointment.status === "confirmed" && onUpdateStatus && (
              <Button 
                onClick={() => {
                  onUpdateStatus(appointment.id, "completed", appointment.client_id);
                  onClose();
                }}
              >
                Mark as Completed
              </Button>
            )}
            {(appointment.status === "pending" || appointment.status === "confirmed") && onCancelAppointment && (
              <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="ml-2">
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep appointment</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelAppointment}>
                      Yes, cancel appointment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
