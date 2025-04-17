
import React from "react";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { useStylistAppointments } from "@/hooks/useStylistAppointments";
import AppointmentsHeader from "./appointments/AppointmentsHeader";
import AppointmentsContent from "./appointments/AppointmentsContent";

const StylistAppointmentsTab = () => {
  const {
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
  } = useStylistAppointments();

  return (
    <div className="space-y-6">
      <AppointmentsHeader />
      
      <AppointmentFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortKey={sortKey}
        sortDirection={sortDirection}
        handleSort={handleSort}
        clearFilters={clearFilters}
      />
      
      <AppointmentsContent
        loading={loading}
        statusFilter={statusFilter}
        filteredAppointments={filteredAppointments}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onUpdateStatus={handleUpdateStatus}
        onViewDetails={handleViewDetails}
        clearFilters={clearFilters}
      />

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
