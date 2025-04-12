
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Appointment } from "@/types/appointment";
import AppointmentRow from "./AppointmentRow";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

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
  const isMobile = useIsMobile();
  
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

  if (isMobile) {
    // Mobile card view
    return (
      <div className="space-y-4">
        {sortedAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No appointments found</p>
        ) : (
          sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="border border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{appointment.client}</h4>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{appointment.date}</p>
                    <p className="text-sm">{appointment.time}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/30">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {onViewDetails && (
                      <button 
                        onClick={() => onViewDetails(appointment)}
                        className="px-3 py-1 text-xs bg-secondary text-foreground rounded-md hover:bg-secondary/80"
                      >
                        View
                      </button>
                    )}
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => onUpdateStatus(appointment.id, 'completed', appointment.client_id)}
                        className="px-3 py-1 text-xs bg-primary/80 text-primary-foreground rounded-md hover:bg-primary"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // Desktop table view
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
