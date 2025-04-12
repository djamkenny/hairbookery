import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CalendarIcon, 
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
  LineChartIcon,
  HeartIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  fullName: string;
  email: string;
  loading: boolean;
  avatarUrl: string | null;
}

const ProfileSidebar = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  fullName, 
  email, 
  loading,
  avatarUrl
}: ProfileSidebarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during logout");
    }
  };

  return (
    <Card className={`${isMobile ? "shadow-sm mb-6" : "sticky top-24"} animate-fade-in shadow-md border border-border/30`}>
      <CardHeader className={`flex ${isMobile ? "flex-row justify-between" : "flex-col"} items-center gap-4 pb-2`}>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-offset-2 ring-primary/20">
            <AvatarImage 
              src={avatarUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3"} 
              alt={fullName || "User"} 
            />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-semibold">{fullName || "User"}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-full">{email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="mt-2 md:mt-4 overflow-x-auto scrollbar-none">
          <div className={`${isMobile ? "flex py-2 px-1 gap-1 overflow-x-auto hide-scrollbar" : "flex flex-col"}`}>
            <Link 
              to="#" 
              onClick={() => setActiveTab("dashboard")} 
              className={`${isMobile ? "flex-shrink-0 min-w-[105px] px-3 py-2 text-sm justify-center" : "flex items-center justify-between px-4 py-3"} ${activeTab === "dashboard" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}
            >
              <div className={`flex items-center ${isMobile ? "flex-col gap-1" : ""}`}>
                <LineChartIcon className={`${isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"}`} />
                <span>Dashboard</span>
              </div>
              {!isMobile && <ChevronRightIcon className="h-4 w-4" />}
            </Link>
            
            <Link 
              to="#" 
              onClick={() => setActiveTab("appointments")} 
              className={`${isMobile ? "flex-shrink-0 min-w-[105px] px-3 py-2 text-sm justify-center" : "flex items-center justify-between px-4 py-3"} ${activeTab === "appointments" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}
            >
              <div className={`flex items-center ${isMobile ? "flex-col gap-1" : ""}`}>
                <CalendarIcon className={`${isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"}`} />
                <span>Appointments</span>
              </div>
              {!isMobile && <ChevronRightIcon className="h-4 w-4" />}
            </Link>
            
            <Link 
              to="#" 
              onClick={() => setActiveTab("profile")} 
              className={`${isMobile ? "flex-shrink-0 min-w-[105px] px-3 py-2 text-sm justify-center" : "flex items-center justify-between px-4 py-3"} ${activeTab === "profile" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}
            >
              <div className={`flex items-center ${isMobile ? "flex-col gap-1" : ""}`}>
                <UserIcon className={`${isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"}`} />
                <span>Profile</span>
              </div>
              {!isMobile && <ChevronRightIcon className="h-4 w-4" />}
            </Link>
            
            <Link 
              to="#" 
              onClick={() => setActiveTab("favorites")} 
              className={`${isMobile ? "flex-shrink-0 min-w-[105px] px-3 py-2 text-sm justify-center" : "flex items-center justify-between px-4 py-3"} ${activeTab === "favorites" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}
            >
              <div className={`flex items-center ${isMobile ? "flex-col gap-1" : ""}`}>
                <HeartIcon className={`${isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"}`} />
                <span>Favorites</span>
              </div>
              {!isMobile && <ChevronRightIcon className="h-4 w-4" />}
            </Link>
            
            <Link 
              to="#" 
              onClick={() => setActiveTab("settings")} 
              className={`${isMobile ? "flex-shrink-0 min-w-[105px] px-3 py-2 text-sm justify-center" : "flex items-center justify-between px-4 py-3"} ${activeTab === "settings" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}
            >
              <div className={`flex items-center ${isMobile ? "flex-col gap-1" : ""}`}>
                <SettingsIcon className={`${isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"}`} />
                <span>Settings</span>
              </div>
              {!isMobile && <ChevronRightIcon className="h-4 w-4" />}
            </Link>
          </div>
          
          {!isMobile && (
            <div className="px-4 pt-6 pb-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </>
                )}
              </Button>
            </div>
          )}
          
          {isMobile && (
            <div className="px-4 py-3 mt-2 border-t border-border/40">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-center text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-3 w-3 mr-2 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOutIcon className="mr-2 h-3 w-3" />
                    <span>Logout</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </nav>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
