import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from "@/types/appointment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentsContentProps {
  loading: boolean;
  statusFilter: string;
  filteredAppointments: Appointment[];
  sortKey: keyof Appointment | undefined;
  sortDirection: "asc" | "desc";
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
  clearFilters,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="font-mono">Reference ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : filteredAppointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No appointments found.
              </TableCell>
            </TableRow>
          ) : (
            filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">{appointment.client}</TableCell>
                <TableCell>{(() => {
                  const svcs = (appointment as any).services;
                  if (Array.isArray(svcs) && svcs.length > 0) {
                    if (svcs.length === 1) {
                      const s = svcs[0];
                      return s?.baseServiceName || s?.name || 'Service';
                    }
                    return `${svcs.length} services`;
                  }
                  return appointment.service;
                })()}</TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-primary">
                  {appointment.order_id || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(appointment)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentsContent;
