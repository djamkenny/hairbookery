
import { useState } from "react";

export const useNotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  return {
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications
  };
};
