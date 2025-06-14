
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Appointment } from "@/types/appointment";
import ClientInfoCard from "./ClientInfoCard";
import DateTimeCards from "./DateTimeCards";
import OrderIdCard from "./OrderIdCard";
import ServiceStatusCard from "./ServiceStatusCard";
import AppointmentActions from "./AppointmentActions";

interface AppointmentDetailsContentProps {
  appointment: Appointment;
  onUpdateStatus?: (appointmentId: string, newStatus: string, clientId: string) => void;
  onCancelAppointment?: (appointmentId: string, clientId: string) => void;
  onClose: () => void;
}

const AppointmentDetailsContent: React.FC<AppointmentDetailsContentProps> = ({
  appointment,
  onUpdateStatus,
  onCancelAppointment,
  onClose
}) => {
  // Add helper for formatting
  const formatAmount = (amount?: number) =>
    typeof amount === "number"
      ? `GH₵${(amount / 100).toFixed(2)}`
      : "--";

  return (
    <>
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
        {/* Show the amount paid for this booking */}
        {"amount" in appointment && appointment.amount !== undefined && (
          <div className="border rounded-lg p-3 bg-green-50">
            <span className="block text-xs text-green-600 font-medium mb-1">Amount Paid</span>
            <span className="text-lg font-bold text-green-800">{formatAmount(appointment.amount)}</span>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <AppointmentActions 
          status={appointment.status}
          appointmentId={appointment.id}
          clientId={appointment.client_id}
          onUpdateStatus={onUpdateStatus}
          onCancelAppointment={onCancelAppointment}
          onClose={onClose}
        />
      </div>
    </>
  );
};
export default AppointmentDetailsContent;
