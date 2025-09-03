import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { LaundryOrder } from "@/types/laundry";
import { ScrollArea } from "@/components/ui/scroll-area";
import LaundryAppointmentDetailsCard from "@/components/appointments/LaundryAppointmentDetailsCard";

interface LaundryAppointmentDetailsModalProps {
  order: LaundryOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const LaundryAppointmentDetailsModal: React.FC<LaundryAppointmentDetailsModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] h-[92vh] min-h-0 p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-4 shrink-0">
          <DialogTitle className="text-xl">Laundry Order Details</DialogTitle>
          <DialogDescription>
            Complete information about order #{order.order_number}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea type="always" className="flex-1 h-full px-6 pb-6">
          <LaundryAppointmentDetailsCard
            order={order}
            showClientInfo={true}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LaundryAppointmentDetailsModal;