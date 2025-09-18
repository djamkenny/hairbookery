import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const SpecialistNotificationHandler = () => {
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle new booking notifications for specialists
    notifications.forEach((notification) => {
      // Only show toasts for unread booking notifications
      if (!notification.is_read && 
          (notification.type === 'beauty_booking' || 
           notification.type === 'laundry_order_assigned' || 
           notification.type === 'cleaning_booking')) {
        
        // Show toast notification with action
        toast.success(notification.title || "New Booking", {
          description: notification.message,
          duration: 8000,
          action: {
            label: "View Details",
            onClick: () => {
              if (notification.action_url) {
                navigate(notification.action_url);
              } else {
                navigate("/stylist-dashboard");
              }
            }
          }
        });
      }
    });
  }, [notifications, navigate]);

  return null; // This component doesn't render anything
};