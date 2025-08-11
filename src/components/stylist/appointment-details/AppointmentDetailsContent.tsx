
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Appointment, AppointmentServiceDisplay } from "@/types/appointment";
import ClientInfoCard from "./ClientInfoCard";
import DateTimeCards from "./DateTimeCards";
import OrderIdCard from "./OrderIdCard";
import ServiceStatusCard from "./ServiceStatusCard";
import AppointmentActions from "./AppointmentActions";
import TotalAmountCard from "./TotalAmountCard";

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
  // Calculate total amount: sum of service prices; fallback to appointment.amount (pesewas)
  const services = (appointment as any).services as AppointmentServiceDisplay[] | undefined;
  const totalFromServices = services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) ?? 0;
  const totalAmount = totalFromServices > 0
    ? totalFromServices
    : (typeof appointment.amount === "number" && !isNaN(appointment.amount) ? appointment.amount / 100 : 0);

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
        {totalAmount > 0 && (
          <TotalAmountCard total={totalAmount} />
        )}
        <ServiceStatusCard 
          service={appointment.service}
          services={(appointment as any).services}
          status={appointment.status}
        />
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
