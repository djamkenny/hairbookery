
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PersonalInfoTab from "./PersonalInfoTab";
import AppointmentsTab from "./AppointmentsTab";
import FavoritesTab from "./FavoritesTab";
import SettingsTab from "./SettingsTab";
import DashboardTab from "./DashboardTab";
import { Appointment } from "@/types/appointment";

interface ProfileContentProps {
  activeTab: string;
  user: any;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  phone: string;
  setPhone: (phone: string) => void;
  avatarUrl: string | null;
  refreshUserProfile: () => Promise<void>;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  favoriteSylists: any[];
  loyaltyPoints: number;
  handleRescheduleAppointment: (id: string) => void;
  handleCancelAppointment: (id: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (enabled: boolean) => void;
  removeFavoriteStylist: (stylistId: string) => void;
  showRatingDialog: boolean;
  ratingDialogData: {
    specialistId: string;
    specialistName: string;
    serviceName: string;
  } | null;
  closeRatingDialog: () => void;
}

const ProfileContent = ({
  activeTab,
  user,
  fullName,
  setFullName,
  email,
  phone,
  setPhone,
  avatarUrl,
  refreshUserProfile,
  upcomingAppointments,
  pastAppointments,
  favoriteSylists,
  loyaltyPoints,
  handleRescheduleAppointment,
  handleCancelAppointment,
  emailNotifications,
  setEmailNotifications,
  smsNotifications,
  setSmsNotifications,
  removeFavoriteStylist,
  showRatingDialog,
  ratingDialogData,
  closeRatingDialog
}: ProfileContentProps) => {
  return (
    <div className="lg:col-span-3">
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="dashboard" className="mt-0">
          <DashboardTab 
            user={user}
            avatarUrl={avatarUrl}
            upcomingAppointments={upcomingAppointments}
            pastAppointments={pastAppointments}
            favoriteSylists={favoriteSylists}
            loyaltyPoints={loyaltyPoints}
            handleRescheduleAppointment={handleRescheduleAppointment}
            handleCancelAppointment={handleCancelAppointment}
          />
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-0">
          <AppointmentsTab 
            upcomingAppointments={upcomingAppointments}
            pastAppointments={pastAppointments}
            handleRescheduleAppointment={handleRescheduleAppointment}
            handleCancelAppointment={handleCancelAppointment}
            showRatingDialog={showRatingDialog}
            ratingDialogData={ratingDialogData}
            closeRatingDialog={closeRatingDialog}
          />
        </TabsContent>
        
        <TabsContent value="personal-info" className="mt-0">
          <PersonalInfoTab
            user={user}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            phone={phone}
            setPhone={setPhone}
            avatarUrl={avatarUrl}
            refreshUserProfile={refreshUserProfile}
          />
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-0">
          <FavoritesTab 
            favoriteSylists={favoriteSylists}
            removeFavoriteStylist={removeFavoriteStylist}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <SettingsTab
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            smsNotifications={smsNotifications}
            setSmsNotifications={setSmsNotifications}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileContent;
