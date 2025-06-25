
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAppointments } from "@/hooks/useAppointments";
import { useFavorites } from "@/hooks/useFavorites";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

export const useProfileData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const {
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    avatarUrl,
    refreshUserProfile,
    loading: profileLoading
  } = useUserProfile();

  const {
    loading: appointmentsLoading,
    upcomingAppointments,
    pastAppointments,
    handleCancelAppointment,
    handleRescheduleAppointment,
    showRatingDialog,
    ratingDialogData,
    closeRatingDialog
  } = useAppointments(user?.id);

  const { favoriteSylists, removeFavoriteStylist } = useFavorites();
  const { loyaltyPoints } = useLoyaltyPoints();
  
  const {
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications
  } = useNotificationSettings();

  const loading = profileLoading || appointmentsLoading;

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
    refreshUserProfile,
    upcomingAppointments,
    pastAppointments,
    favoriteSylists,
    loyaltyPoints,
    handleCancelAppointment,
    handleRescheduleAppointment,
    removeFavoriteStylist,
    showRatingDialog,
    ratingDialogData,
    closeRatingDialog
  };
};
