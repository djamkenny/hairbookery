
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
import { Loader2 } from "lucide-react";
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
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCancelAppointment = () => {
    if (onCancelAppointment) {
      onCancelAppointment(appointmentId, clientId);
      setIsCancelAlertOpen(false);
      toast.success("Appointment canceled");
      onClose();
    }
  };

  const handleCompleteAppointment = async () => {
    if (onUpdateStatus) {
      setIsCompleting(true);
      try {
        await onUpdateStatus(appointmentId, "completed", clientId);
        toast.success("Appointment completed! Earnings have been processed and added to your balance.");
        onClose();
      } catch (error) {
        console.error("Error completing appointment:", error);
        toast.error("Failed to complete appointment. Please try again.");
      } finally {
        setIsCompleting(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {status === "pending" && onUpdateStatus && (
          <Button 
            className="w-full sm:w-auto"
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
            className="w-full sm:w-auto"
            onClick={handleCompleteAppointment}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete"
            )}
          </Button>
        )}
        {(status === "pending" || status === "confirmed") && onCancelAppointment && (
          <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">No, keep appointment</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelAppointment} className="w-full sm:w-auto">
                  Yes, cancel appointment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
    </div>
  );
};

export default AppointmentActions;
