
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  title: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string | null;
  priority?: string | null;
  type: string;
}
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!mounted) return;
      setNotifications(data || []);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("notifications_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => fetch()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { notifications, loading };
}
