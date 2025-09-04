
import React, { useState, useEffect } from "react";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { useStylistAppointments } from "@/hooks/useStylistAppointments";
import { useLaundryAppointments } from "@/hooks/useLaundryAppointments";
import { useCleaningAppointments } from "@/hooks/useCleaningAppointments";
import AppointmentsHeader from "./appointments/AppointmentsHeader";
import AppointmentsContent from "./appointments/AppointmentsContent";
import { LaundryAppointmentsList } from "@/components/laundry/LaundryAppointmentsList";
import LaundryAppointmentDetailsModal from "@/components/laundry/LaundryAppointmentDetailsModal";
import { CleaningAppointmentsList } from "@/components/cleaning/CleaningAppointmentsList";
import { CleaningAppointmentDetailsModal } from "@/components/cleaning/CleaningAppointmentDetailsModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const SpecialistAppointmentsTab = () => {
  const [isLaundrySpecialist, setIsLaundrySpecialist] = useState(false);
  const [isCleaningSpecialist, setIsCleaningSpecialist] = useState(false);
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

  const {
    orders: cleaningOrders,
    loading: cleaningLoading,
    selectedOrder: selectedCleaningOrder,
    isDetailsModalOpen: isCleaningDetailsModalOpen,
    handleUpdateStatus: handleUpdateCleaningStatus,
    handleViewDetails: handleViewCleaningDetails,
    handleCloseDetailsModal: handleCloseCleaningDetailsModal
  } = useCleaningAppointments();

  useEffect(() => {
    const checkUserType = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_stylist, is_laundry_specialist, is_cleaning_specialist')
          .eq('id', user.id)
          .single();
        
        setIsStylist(profile?.is_stylist || false);
        setIsLaundrySpecialist(profile?.is_laundry_specialist || false);
        setIsCleaningSpecialist(profile?.is_cleaning_specialist || false);
      }
    };

    checkUserType();
  }, []);

  // Count active services to determine tab layout
  const activeServices = [isStylist, isLaundrySpecialist, isCleaningSpecialist].filter(Boolean).length;

  // If user has multiple service types, show tabs
  if (activeServices > 1) {
    return (
      <div className="space-y-6">
        <AppointmentsHeader />
        
        <Tabs defaultValue={isStylist ? "beauty" : isLaundrySpecialist ? "laundry" : "cleaning"} className="w-full">
          <TabsList className={cn(
            "grid w-full",
            activeServices === 2 ? "grid-cols-2" : activeServices === 3 ? "grid-cols-3" : "grid-cols-1"
          )}>
            {isStylist && <TabsTrigger value="beauty">Beauty Services</TabsTrigger>}
            {isLaundrySpecialist && <TabsTrigger value="laundry">Laundry Services</TabsTrigger>}
            {isCleaningSpecialist && <TabsTrigger value="cleaning">Cleaning Services</TabsTrigger>}
          </TabsList>
          
          {isStylist && (
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
          )}
          
          {isLaundrySpecialist && (
            <TabsContent value="laundry" className="space-y-6">
              <LaundryAppointmentsList
                orders={laundryOrders}
                loading={laundryLoading}
                onUpdateStatus={handleUpdateLaundryStatus}
                onViewDetails={handleViewLaundryDetails}
              />
            </TabsContent>
          )}
          
          {isCleaningSpecialist && (
            <TabsContent value="cleaning" className="space-y-6">
              <CleaningAppointmentsList
                orders={cleaningOrders}
                loading={cleaningLoading}
                onViewDetails={handleViewCleaningDetails}
                onUpdateStatus={handleUpdateCleaningStatus}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Modals */}
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

        <CleaningAppointmentDetailsModal
          order={selectedCleaningOrder}
          isOpen={isCleaningDetailsModalOpen}
          onClose={handleCloseCleaningDetailsModal}
        />
      </div>
    );
  }

  // If only cleaning specialist, show only cleaning orders
  if (isCleaningSpecialist) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cleaning Services Dashboard</h1>
        </div>
        <CleaningAppointmentsList
          orders={cleaningOrders}
          loading={cleaningLoading}
          onViewDetails={handleViewCleaningDetails}
          onUpdateStatus={handleUpdateCleaningStatus}
        />

        <CleaningAppointmentDetailsModal
          order={selectedCleaningOrder}
          isOpen={isCleaningDetailsModalOpen}
          onClose={handleCloseCleaningDetailsModal}
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
