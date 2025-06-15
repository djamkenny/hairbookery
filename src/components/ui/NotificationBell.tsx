
import React, { useEffect, useState } from "react";
import { BellIcon, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string | null;
  priority?: string | null;
  type: string;
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);
      if (!mounted) return;
      setNotifications(data || []);
      setLoading(false);
    };
    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("user_notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, payload => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Mark all as read when opening panel
  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        className={cn(
          "relative rounded-full hover:bg-accent p-2 transition-colors",
          open ? "bg-accent" : ""
        )}
        onClick={async () => {
          setOpen(!open);
          if (!open) await markAllAsRead();
        }}
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <Card className="absolute top-10 right-0 w-80 max-h-96 overflow-y-auto shadow-xl z-50 animate-in fade-in px-2 py-2 border border-border bg-background">
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <span className="font-semibold">Notifications</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={cn(
                  "px-4 py-2 rounded hover:bg-accent/30 text-left border-b last:border-b-0 transition",
                  !n.is_read && "bg-accent/10"
                )}
              >
                <div className="font-medium text-sm">{n.title || n.type}</div>
                <div className="text-xs text-muted-foreground">{n.message}</div>
                <div className="text-[10px] text-right text-muted-foreground italic mt-0.5">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
};
export default NotificationBell;
