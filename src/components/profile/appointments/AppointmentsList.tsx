
import React from "react";
import { Appointment } from "@/types/appointment";
import AppointmentCard from "./AppointmentCard";
import EmptyAppointmentsState from "./EmptyAppointmentsState";

interface AppointmentsListProps {
  appointments: Appointment[];
  type: "upcoming" | "past";
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const AppointmentsList = ({ 
  appointments, 
  type, 
  onReschedule, 
  onCancel 
}: AppointmentsListProps) => {
  const isPast = type === "past";

  const handleBookSimilar = (appointment: Appointment) => {
    // Store appointment details in localStorage for booking form
    localStorage.setItem('similarBooking', JSON.stringify({
      service: appointment.service,
      stylist: appointment.stylist || '',
      notes: `Similar to previous appointment on ${appointment.date}`
    }));
    
    // Navigate to booking page
    window.location.href = '/booking';
  };

  if (appointments.length === 0) {
    return <EmptyAppointmentsState type={type} />;
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          isPast={isPast}
          onReschedule={onReschedule}
          onCancel={onCancel}
          onBookSimilar={isPast ? handleBookSimilar : undefined}
        />
      ))}
    </div>
  );
};

export default AppointmentsList;
