
import { useState } from "react";
import { useUserProfile } from "./useUserProfile";
import { useAppointments } from "./useAppointments";
import { useNotificationSettings } from "./useNotificationSettings";
import { useFavorites } from "./useFavorites";
import { useLoyaltyPoints } from "./useLoyaltyPoints";

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
    setPhone,
    avatarUrl,
    setAvatarUrl,
    refreshUserProfile
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
    removeFavoriteStylist,
    addFavoriteStylist,
    refreshFavorites
  } = useFavorites();

  // Get loyalty points data
  const {
    loyaltyPoints,
    refreshLoyaltyPoints
  } = useLoyaltyPoints();

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
    avatarUrl,
    setAvatarUrl,
    refreshUserProfile,
    upcomingAppointments,
    pastAppointments,
    favoriteSylists,
    loyaltyPoints,
    handleCancelAppointment,
    handleRescheduleAppointment,
    removeFavoriteStylist,
    addFavoriteStylist,
    refreshFavorites,
    refreshLoyaltyPoints
  };
};
