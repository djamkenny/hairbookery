
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationSound } from "./useNotificationSound";

export interface Notification {
  id: string;
  title: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string | null;
  priority?: string | null;
  type: string;
  metadata?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { playNotificationSound } = useNotificationSound();

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("Error fetching notifications:", error);
          return;
        }

        if (!mounted) return;
        setNotifications(data || []);
      } catch (error) {
        console.error("Error in fetchNotifications:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("notifications_realtime")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "notifications"
        },
        (payload) => {
          console.log("Notification change detected:", payload);
          if (payload.eventType === 'INSERT') {
            console.log("New notification received, playing sound");
            playNotificationSound();
          }
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { notifications, loading };
}
