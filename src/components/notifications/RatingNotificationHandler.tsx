import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { RatingDialog } from "@/components/ui/rating-dialog";

export const RatingNotificationHandler = () => {
  const { notifications } = useNotifications();
  const [ratingDialog, setRatingDialog] = useState<{
    isOpen: boolean;
    specialistId: string;
    specialistName: string;
    serviceName: string;
  } | null>(null);

  useEffect(() => {
    // Check for unread appointment completion notifications that should show rating
    const ratingNotification = notifications.find(
      (notification) =>
        notification.type === 'appointment_completed' &&
        !notification.is_read &&
        notification.metadata?.shouldShowRating
    );

    if (ratingNotification && ratingNotification.metadata) {
      setRatingDialog({
        isOpen: true,
        specialistId: ratingNotification.metadata.specialistId,
        specialistName: ratingNotification.metadata.specialistName,
        serviceName: ratingNotification.metadata.serviceName,
      });
    }
  }, [notifications]);

  const handleCloseRating = () => {
    setRatingDialog(null);
  };

  if (!ratingDialog) return null;

  return (
    <RatingDialog
      isOpen={ratingDialog.isOpen}
      onClose={handleCloseRating}
      specialistId={ratingDialog.specialistId}
      specialistName={ratingDialog.specialistName}
      serviceName={ratingDialog.serviceName}
    />
  );
};