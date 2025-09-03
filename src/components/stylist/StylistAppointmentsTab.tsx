
import React, { useState, useEffect } from "react";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { useStylistAppointments } from "@/hooks/useStylistAppointments";
import { useLaundryAppointments } from "@/hooks/useLaundryAppointments";
import AppointmentsHeader from "./appointments/AppointmentsHeader";
import AppointmentsContent from "./appointments/AppointmentsContent";
import { LaundryAppointmentsList } from "@/components/laundry/LaundryAppointmentsList";
import LaundryAppointmentDetailsModal from "@/components/laundry/LaundryAppointmentDetailsModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const SpecialistAppointmentsTab = () => {
  const [isLaundrySpecialist, setIsLaundrySpecialist] = useState(false);
  const [isStylist, setIsStylist] = useState(false);

  const {
    filteredAppointments,
    loading: beautyLoading,
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

  const {
    orders: laundryOrders,
    loading: laundryLoading,
    selectedOrder,
    isDetailsModalOpen: isLaundryDetailsModalOpen,
    handleUpdateStatus: handleUpdateLaundryStatus,
    handleViewDetails: handleViewLaundryDetails,
    handleCloseDetailsModal: handleCloseLaundryDetailsModal
  } = useLaundryAppointments();

  useEffect(() => {
    const checkUserType = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_stylist, is_laundry_specialist')
          .eq('id', user.id)
          .single();
        
        setIsStylist(profile?.is_stylist || false);
        setIsLaundrySpecialist(profile?.is_laundry_specialist || false);
      }
    };

    checkUserType();
  }, []);

  // If user is both stylist and laundry specialist, show tabs
  if (isStylist && isLaundrySpecialist) {
    return (
      <div className="space-y-6">
        <AppointmentsHeader />
        
        <Tabs defaultValue="beauty" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="beauty">Beauty Services</TabsTrigger>
              <TabsTrigger value="laundry">Cleaning Services</TabsTrigger>
            </TabsList>
          
          <TabsContent value="beauty" className="space-y-6">
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
              loading={beautyLoading}
              statusFilter={statusFilter}
              filteredAppointments={filteredAppointments}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewDetails}
              clearFilters={clearFilters}
            />
          </TabsContent>
          
          <TabsContent value="laundry" className="space-y-6">
            <LaundryAppointmentsList
              orders={laundryOrders}
              loading={laundryLoading}
              onUpdateStatus={handleUpdateLaundryStatus}
              onViewDetails={handleViewLaundryDetails}
            />
          </TabsContent>
        </Tabs>

        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onUpdateStatus={handleUpdateStatus}
          onCancelAppointment={handleCancelAppointment}
        />

        <LaundryAppointmentDetailsModal
          order={selectedOrder}
          isOpen={isLaundryDetailsModalOpen}
          onClose={handleCloseLaundryDetailsModal}
        />
      </div>
    );
  }

  // If only laundry specialist, show only laundry orders
  if (isLaundrySpecialist) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cleaning Services Dashboard</h1>
        </div>
        <LaundryAppointmentsList
          orders={laundryOrders}
          loading={laundryLoading}
          onUpdateStatus={handleUpdateLaundryStatus}
          onViewDetails={handleViewLaundryDetails}
        />

        <LaundryAppointmentDetailsModal
          order={selectedOrder}
          isOpen={isLaundryDetailsModalOpen}
          onClose={handleCloseLaundryDetailsModal}
        />
      </div>
    );
  }

  // Default to beauty services for regular stylists
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
        loading={beautyLoading}
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

export default SpecialistAppointmentsTab;
