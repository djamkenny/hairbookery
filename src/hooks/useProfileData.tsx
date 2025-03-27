
import { useState } from "react";
import { useUserProfile } from "./useUserProfile";
import { useAppointments } from "./useAppointments";
import { useNotificationSettings } from "./useNotificationSettings";
import { useFavorites } from "./useFavorites";

export const useProfileData = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Get user profile data
  const {
    loading,
    user,
    fullName,
    setFullName,
    email,
    phone,
    setPhone
  } = useUserProfile();
  
  // Get appointments data
  const {
    upcomingAppointments,
    pastAppointments,
    handleCancelAppointment,
    handleRescheduleAppointment
  } = useAppointments(user?.id);
  
  // Get notification settings
  const {
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications
  } = useNotificationSettings();
  
  // Get favorites data
  const {
    favoriteSylists,
    removeFavoriteStylist
  } = useFavorites();

  return {
    activeTab,
    setActiveTab,
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications,
    loading,
    user,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    upcomingAppointments,
    pastAppointments,
    favoriteSylists,
    handleCancelAppointment,
    handleRescheduleAppointment,
    removeFavoriteStylist
  };
};
