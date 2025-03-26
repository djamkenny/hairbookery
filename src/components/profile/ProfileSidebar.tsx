
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

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  fullName: string;
  email: string;
  loading: boolean;
}

const ProfileSidebar = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  fullName, 
  email, 
  loading 
}: ProfileSidebarProps) => {
  const navigate = useNavigate();

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
    <Card className="sticky top-24 animate-fade-in shadow-md border border-border/30">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-primary/20">
          <AvatarImage src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3" alt="User" />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{fullName || "User"}</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="mt-4">
          <Link to="#" onClick={() => setActiveTab("dashboard")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "dashboard" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
            <div className="flex items-center">
              <LineChartIcon className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
          <Link to="#" onClick={() => setActiveTab("appointments")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "appointments" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Appointments</span>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
          <Link to="#" onClick={() => setActiveTab("profile")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "profile" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
            <div className="flex items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Personal Info</span>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
          <Link to="#" onClick={() => setActiveTab("favorites")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "favorites" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
            <div className="flex items-center">
              <HeartIcon className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
          <Link to="#" onClick={() => setActiveTab("settings")} className={`flex items-center justify-between px-4 py-3 ${activeTab === "settings" ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"} transition-colors rounded-md`}>
            <div className="flex items-center">
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
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
        </nav>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
