
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Appointment } from "@/types/appointment";
import AppointmentRow from "./AppointmentRow";

interface AppointmentsTableProps {
  appointments: Appointment[];
  onUpdateStatus: (appointmentId: string, newStatus: string, clientId: string) => void;
  onViewDetails?: (appointment: Appointment) => void;
  sortKey?: keyof Appointment;
  sortDirection?: 'asc' | 'desc';
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ 
  appointments, 
  onUpdateStatus,
  onViewDetails,
  sortKey,
  sortDirection = 'asc'
}) => {
  // Sort appointments if sort parameters are provided
  const sortedAppointments = React.useMemo(() => {
    if (!sortKey) return appointments;
    
    return [...appointments].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      
      // Basic string comparison for most fields
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });
  }, [appointments, sortKey, sortDirection]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAppointments.map((appointment) => (
          <AppointmentRow 
            key={appointment.id}
            appointment={appointment}
            onUpdateStatus={onUpdateStatus}
            onViewDetails={onViewDetails}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default AppointmentsTable;
