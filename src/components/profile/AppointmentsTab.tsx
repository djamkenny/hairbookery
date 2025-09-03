
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment } from "@/types/appointment";
import AppointmentsList from "./appointments/AppointmentsList";
import { RatingDialog } from "@/components/ui/rating-dialog";
import { useClientLaundryOrders } from "@/hooks/useClientLaundryOrders";
import LaundryAppointmentDetailsCard from "@/components/appointments/LaundryAppointmentDetailsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

interface AppointmentsTabProps {
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  handleRescheduleAppointment: (id: string) => void;
  handleCancelAppointment: (id: string) => void;
  showRatingDialog: boolean;
  ratingDialogData: {
    specialistId: string;
    specialistName: string;
    serviceName: string;
  } | null;
  closeRatingDialog: () => void;
  userId?: string;
}

const AppointmentsTab = ({ 
  upcomingAppointments, 
  pastAppointments, 
  handleRescheduleAppointment, 
  handleCancelAppointment,
  showRatingDialog,
  ratingDialogData,
  closeRatingDialog,
  userId
}: AppointmentsTabProps) => {
  const { orders: laundryOrders, loading: laundryLoading } = useClientLaundryOrders(userId);

  const upcomingLaundryOrders = laundryOrders.filter(order => 
    !['delivered', 'canceled'].includes(order.status)
  );
  
  const pastLaundryOrders = laundryOrders.filter(order => 
    ['delivered', 'canceled'].includes(order.status)
  );

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">Your Appointments</h1>
      
      <Tabs defaultValue="upcoming" className="w-full overflow-hidden">
        <TabsList className="mb-3 sm:mb-4 md:mb-6 w-full overflow-x-auto hide-scrollbar">
          <TabsTrigger value="upcoming" className="flex-1 text-xs sm:text-sm">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="flex-1 text-xs sm:text-sm">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-3 md:space-y-4">
          {/* Beauty Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base">Beauty Services</h3>
              <AppointmentsList
                appointments={upcomingAppointments}
                type="upcoming"
                onReschedule={handleRescheduleAppointment}
                onCancel={handleCancelAppointment}
              />
            </div>
          )}

          {/* Laundry Orders */}
          {upcomingLaundryOrders.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base">Laundry Services</h3>
              <div className="space-y-2 sm:space-y-3">
                {upcomingLaundryOrders.map(order => (
                  <LaundryAppointmentDetailsCard
                    key={order.id}
                    order={order}
                    showClientInfo={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {upcomingAppointments.length === 0 && upcomingLaundryOrders.length === 0 && !laundryLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Package className="h-8 w-8 sm:h-10 w-10 md:h-12 w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground text-center text-xs sm:text-sm">
                  You don't have any upcoming appointments or orders.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-3 md:space-y-4">
          {/* Beauty Appointments */}
          {pastAppointments.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base">Beauty Services</h3>
              <AppointmentsList
                appointments={pastAppointments}
                type="past"
              />
            </div>
          )}

          {/* Laundry Orders */}
          {pastLaundryOrders.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-medium text-sm sm:text-base">Laundry Services</h3>
              <div className="space-y-2 sm:space-y-3">
                {pastLaundryOrders.map(order => (
                  <LaundryAppointmentDetailsCard
                    key={order.id}
                    order={order}
                    showClientInfo={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {pastAppointments.length === 0 && pastLaundryOrders.length === 0 && !laundryLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Package className="h-8 w-8 sm:h-10 w-10 md:h-12 w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No past appointments</h3>
                <p className="text-muted-foreground text-center text-xs sm:text-sm">
                  Your completed appointments and orders will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Rating Dialog */}
      {showRatingDialog && ratingDialogData && (
        <RatingDialog
          isOpen={showRatingDialog}
          onClose={closeRatingDialog}
          specialistId={ratingDialogData.specialistId}
          specialistName={ratingDialogData.specialistName}
          serviceName={ratingDialogData.serviceName}
        />
      )}
    </div>
  );
};

export default AppointmentsTab;
