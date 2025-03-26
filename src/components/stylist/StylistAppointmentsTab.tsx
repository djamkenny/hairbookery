
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Filter, ArrowUpDown, Search, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import AppointmentsTable from "./AppointmentsTable";
import { Appointment } from "@/types/appointment";
import { fetchStylistAppointments, updateAppointmentStatus } from "@/services/appointmentService";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { supabase } from "@/integrations/supabase/client";

const StylistAppointmentsTab = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof Appointment | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const data = await fetchStylistAppointments();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, []);
  
  // Filter and search appointments whenever filters or search query changes
  useEffect(() => {
    let result = [...appointments];
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(appointment => appointment.status === statusFilter);
    }
    
    // Filter by search query (client name or service)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        appointment => 
          appointment.client.toLowerCase().includes(query) || 
          appointment.service.toLowerCase().includes(query)
      );
    }
    
    setFilteredAppointments(result);
  }, [appointments, statusFilter, searchQuery]);
  
  const handleUpdateStatus = async (appointmentId: string, newStatus: string, clientId: string) => {
    try {
      const appointmentInfo = appointments.find(a => a.id === appointmentId);
      
      await updateAppointmentStatus(
        appointmentId, 
        newStatus, 
        clientId, 
        appointmentInfo
      );
      
      // Update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus } 
            : appointment
        )
      );
      
      toast.success(`Appointment ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error("Failed to update appointment status");
    }
  };

  const handleCancelAppointment = async (appointmentId: string, clientId: string) => {
    try {
      // Update appointment status to canceled
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', appointmentId);
      
      if (error) throw error;

      // Send notification to client
      const appointmentInfo = appointments.find(a => a.id === appointmentId);
      if (appointmentInfo) {
        const message = `Your appointment for ${appointmentInfo.service} on ${appointmentInfo.date} at ${appointmentInfo.time} has been canceled.`;
        
        await supabase
          .from('notifications')
          .insert([{
            user_id: clientId,
            message: message,
            type: 'appointment_canceled',
            is_read: false,
            related_id: appointmentId
          }]);
      }
      
      // Update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'canceled' } 
            : appointment
        )
      );
      
    } catch (error: any) {
      console.error('Error canceling appointment:', error);
      toast.error("Failed to cancel appointment");
    }
  };
  
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleSort = (key: keyof Appointment) => {
    if (sortKey === key) {
      // Toggle direction if already sorting by this key
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort key and default to ascending
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSortKey(undefined);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>
      
      {/* Filtering and Sorting Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 max-w-xs"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" variant="outline">
            <ToggleGroupItem value="date" onClick={() => handleSort('date')}>
              <CalendarDays className="h-4 w-4 mr-1" />
              Date {sortKey === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </ToggleGroupItem>
            <ToggleGroupItem value="client" onClick={() => handleSort('client')}>
              Client {sortKey === 'client' && (sortDirection === 'asc' ? '↑' : '↓')}
            </ToggleGroupItem>
            <ToggleGroupItem value="status" onClick={() => handleSort('status')}>
              Status {sortKey === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </ToggleGroupItem>
          </ToggleGroup>
          
          {(statusFilter !== "all" || searchQuery || sortKey) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "all" 
              ? "All Appointments" 
              : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Appointments`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            <AppointmentsTable 
              appointments={filteredAppointments} 
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewDetails}
              sortKey={sortKey}
              sortDirection={sortDirection}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "No appointments match your filters." 
                  : "You don't have any appointments."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onUpdateStatus={handleUpdateStatus}
        onCancelAppointment={handleCancelAppointment}
      />
    </div>
  );
};

export default StylistAppointmentsTab;
