
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment } from "@/types/appointment";
import AppointmentsList from "./appointments/AppointmentsList";
import { RatingDialog } from "@/components/ui/rating-dialog";

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
}

const AppointmentsTab = ({ 
  upcomingAppointments, 
  pastAppointments, 
  handleRescheduleAppointment, 
  handleCancelAppointment,
  showRatingDialog,
  ratingDialogData,
  closeRatingDialog
}: AppointmentsTabProps) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Your Appointments</h1>
      
      <Tabs defaultValue="upcoming" className="w-full overflow-hidden">
        <TabsList className="mb-4 md:mb-6 w-full overflow-x-auto hide-scrollbar">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-3 md:space-y-4">
          <AppointmentsList
            appointments={upcomingAppointments}
            type="upcoming"
            onReschedule={handleRescheduleAppointment}
            onCancel={handleCancelAppointment}
          />
        </TabsContent>
        
        <TabsContent value="past" className="space-y-3 md:space-y-4">
          <AppointmentsList
            appointments={pastAppointments}
            type="past"
          />
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
