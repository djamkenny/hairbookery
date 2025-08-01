
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
      <div className="space-y-4 w-full overflow-x-hidden">
        {sortedAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No appointments found</p>
        ) : (
          sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className={`border border-border/30 w-full ${appointment.status !== 'completed' ? 'bg-muted/30' : ''}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="max-w-[60%]">
                    <h4 className="font-medium truncate">{appointment.client}</h4>
                    <p className="text-sm text-muted-foreground truncate">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{appointment.date}</p>
                    <p className="text-sm">{appointment.time}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/30">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'completed' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' :
                      appointment.status === 'canceled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
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
                    {appointment.status !== 'completed' && appointment.status !== 'canceled' && (
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

  // Desktop table view - wrap in responsive container
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAppointments.length === 0 ? (
            <TableRow>
              <TableHead colSpan={6} className="text-center h-24 text-muted-foreground">
                No appointments found
              </TableHead>
            </TableRow>
          ) : (
            sortedAppointments.map((appointment) => (
              <AppointmentRow 
                key={appointment.id}
                appointment={appointment}
                onUpdateStatus={onUpdateStatus}
                onViewDetails={onViewDetails}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentsTable;
