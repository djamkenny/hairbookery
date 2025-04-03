import React from "react";
import DashboardTab from "@/components/profile/DashboardTab";
import AppointmentsTab from "@/components/profile/AppointmentsTab";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import FavoritesTab from "@/components/profile/FavoritesTab";
import SettingsTab from "@/components/profile/SettingsTab";
import { useIsMobile } from "@/hooks/use-mobile";
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
  handleRescheduleAppointment: (id: string) => void;
  handleCancelAppointment: (id: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (value: boolean) => void;
  removeFavoriteStylist: (id: string) => void;
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
  handleRescheduleAppointment,
  handleCancelAppointment,
  emailNotifications,
  setEmailNotifications,
  smsNotifications,
  setSmsNotifications,
  removeFavoriteStylist
}: ProfileContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? "order-1" : "lg:col-span-3"} animate-slide-in space-y-6`}>
      {activeTab === "dashboard" && (
        <DashboardTab 
          user={user}
          avatarUrl={avatarUrl}
          upcomingAppointments={upcomingAppointments}
          pastAppointments={pastAppointments}
          favoriteSylists={favoriteSylists}
          handleRescheduleAppointment={handleRescheduleAppointment}
          handleCancelAppointment={handleCancelAppointment}
        />
      )}
      
      {activeTab === "appointments" && (
        <AppointmentsTab 
          upcomingAppointments={upcomingAppointments}
          pastAppointments={pastAppointments}
          handleRescheduleAppointment={handleRescheduleAppointment}
          handleCancelAppointment={handleCancelAppointment}
        />
      )}
      
      {activeTab === "profile" && (
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
      )}
      
      {activeTab === "favorites" && (
        <FavoritesTab 
          favoriteSylists={favoriteSylists}
          removeFavoriteStylist={removeFavoriteStylist}
        />
      )}
      
      {activeTab === "settings" && (
        <SettingsTab 
          emailNotifications={emailNotifications}
          setEmailNotifications={setEmailNotifications}
          smsNotifications={smsNotifications}
          setSmsNotifications={setSmsNotifications}
        />
      )}
    </div>
  );
};

export default ProfileContent;
