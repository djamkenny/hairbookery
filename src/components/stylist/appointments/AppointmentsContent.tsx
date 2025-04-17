
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AppointmentsTable from "../AppointmentsTable";
import { Appointment } from "@/types/appointment";

interface AppointmentsContentProps {
  loading: boolean;
  statusFilter: string;
  filteredAppointments: Appointment[];
  sortKey?: keyof Appointment;
  sortDirection: 'asc' | 'desc';
  onUpdateStatus: (appointmentId: string, newStatus: string, clientId: string) => void;
  onViewDetails: (appointment: Appointment) => void;
  clearFilters: () => void;
}

const AppointmentsContent: React.FC<AppointmentsContentProps> = ({
  loading,
  statusFilter,
  filteredAppointments,
  sortKey,
  sortDirection,
  onUpdateStatus,
  onViewDetails,
  clearFilters
}) => {
  const getCardTitle = () => {
    return statusFilter === "all" 
      ? "All Appointments" 
      : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Appointments`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getCardTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAppointments.length > 0 ? (
          <AppointmentsTable 
            appointments={filteredAppointments} 
            onUpdateStatus={onUpdateStatus}
            onViewDetails={onViewDetails}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {statusFilter !== "all" || filteredAppointments.length === 0
                ? "No appointments match your filters." 
                : "You don't have any appointments."}
            </p>
            {(statusFilter !== "all" || filteredAppointments.length === 0) && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsContent;
