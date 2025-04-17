
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface AppointmentActionsProps {
  status: string;
  appointmentId: string;
  clientId: string;
  onUpdateStatus?: (appointmentId: string, newStatus: string, clientId: string) => void;
  onCancelAppointment?: (appointmentId: string, clientId: string) => void;
  onClose: () => void;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({ 
  status,
  appointmentId,
  clientId,
  onUpdateStatus,
  onCancelAppointment,
  onClose
}) => {
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  const handleCancelAppointment = () => {
    if (onCancelAppointment) {
      onCancelAppointment(appointmentId, clientId);
      setIsCancelAlertOpen(false);
      toast.success("Appointment canceled");
      onClose();
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        {status === "pending" && onUpdateStatus && (
          <Button 
            onClick={() => {
              onUpdateStatus(appointmentId, "confirmed", clientId);
              onClose();
            }}
          >
            Confirm
          </Button>
        )}
        {status === "confirmed" && onUpdateStatus && (
          <Button 
            onClick={() => {
              onUpdateStatus(appointmentId, "completed", clientId);
              onClose();
            }}
          >
            Complete
          </Button>
        )}
        {(status === "pending" || status === "confirmed") && onCancelAppointment && (
          <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Cancel
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
    </>
  );
};

export default AppointmentActions;
