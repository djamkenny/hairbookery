
import React, { useEffect, useState } from "react";
import { BellIcon, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { notifications, loading } = useNotifications();

  // Mark all as read when opening panel
  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleToggle = async () => {
    setOpen(!open);
    if (!open) {
      await markAllAsRead();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        className={cn(
          "relative rounded-full hover:bg-accent p-2 transition-colors",
          open ? "bg-accent" : ""
        )}
        onClick={handleToggle}
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {open && (
        <Card className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto shadow-xl z-50 animate-in fade-in px-0 py-0 border border-border bg-background">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <span className="font-semibold">Notifications</span>
            <button 
              onClick={() => setOpen(false)}
              className="hover:bg-accent rounded p-1"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="animate-spin w-5 h-5" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 border-b last:border-b-0 hover:bg-accent/30 transition-colors cursor-pointer",
                    !n.is_read && "bg-accent/10"
                  )}
                  onClick={() => {
                    if (n.action_url) {
                      window.location.href = n.action_url;
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {n.title && (
                        <div className="font-medium text-sm text-foreground mb-1 truncate">
                          {n.title}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mb-2 leading-relaxed">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-muted-foreground/70">
                        {formatTimeAgo(n.created_at)}
                      </div>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
