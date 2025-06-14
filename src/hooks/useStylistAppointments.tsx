import { useState, useEffect } from "react";
import { Appointment } from "@/types/appointment";
import { fetchStylistAppointments, updateAppointmentStatus } from "@/services/appointments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStylistAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof Appointment | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Load appointments on component mount
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
  
  // Filter appointments when filter criteria change
  useEffect(() => {
    let result = [...appointments];
    
    if (statusFilter !== "all") {
      result = result.filter(appointment => appointment.status === statusFilter);
    }
    
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
      
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus } 
            : appointment
        )
      );
      
      // The 'completed' status has its own toast messages in the service to provide more detail
      if (newStatus !== "completed") {
        toast.success(`Appointment ${newStatus}`);
      }
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error("Failed to update appointment status");
    }
  };

  const handleCancelAppointment = async (appointmentId: string, clientId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', appointmentId);
      
      if (error) throw error;

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
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setSortKey(undefined);
  };
  
  return {
    appointments,
    filteredAppointments,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortKey,
    sortDirection,
    selectedAppointment,
    isDetailsModalOpen,
    handleUpdateStatus,
    handleCancelAppointment,
    handleViewDetails,
    handleCloseDetailsModal,
    handleSort,
    clearFilters
  };
};
